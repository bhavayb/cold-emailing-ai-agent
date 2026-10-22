"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  Copy,
  Check,
  Send,
  RefreshCw,
  Mail,
  Briefcase,
} from "lucide-react";

interface HiringManager {
  name: string;
  title: string;
  email: string;
  email_status?: string;
  linkedin: string;
  confidence_score: number;
  why_match: string;
  sent?: boolean;
}

interface Campaign {
  job_input: string;
  job_data?: {
    company_name: string;
    job_role: string;
    department: string;
    location: string;
  };
  hiring_manager?: HiringManager;
  hiring_managers?: HiringManager[];
  email_draft?: {
    subject_line_a: string;
    subject_line_b: string;
    email_body: string;
  };
}

const API_URL = "https://cold-emailing-ai-agent.onrender.com";

export default function CampaignsPage() {
  const [jobInput, setJobInput] = useState("");
  const [running, setRunning] = useState(false);
  const [sending, setSending] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<"A" | "B">("A");
  const [editableBody, setEditableBody] = useState("");
  const [copied, setCopied] = useState(false);
  const [managers, setManagers] = useState<HiringManager[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<Record<number, boolean>>({});
  const [sendStatusMsg, setSendStatusMsg] = useState<string | null>(null);

  const activeCampaign = campaigns[selectedIndex];

  // Loads all saved campaigns from backend/data/campaigns.json
  useEffect(() => {
    fetch(`${API_URL}/api/campaigns`)
      .then((res) => res.json())
      .then((data) => {
        if (data.campaigns?.length > 0) {
          setCampaigns(data.campaigns);
        }
      })
      .catch(() => {});
  }, []);

  // Updates recipients & email draft whenever you click a campaign on the right side
  useEffect(() => {
    if (!activeCampaign) return;

    setEditableBody(activeCampaign.email_draft?.email_body || "");
    setSendStatusMsg(null);

    const hmList =
      activeCampaign.hiring_managers && activeCampaign.hiring_managers.length > 0
        ? activeCampaign.hiring_managers
        : activeCampaign.hiring_manager
        ? [activeCampaign.hiring_manager]
        : [];

    setManagers(hmList);

    const initialSelected: Record<number, boolean> = {};
    hmList.forEach((_, idx) => {
      initialSelected[idx] = true;
    });
    setSelectedEmails(initialSelected);
  }, [selectedIndex, activeCampaign]);

  async function handleFindManagers() {
    if (!jobInput.trim()) return;
    setRunning(true);
    setSendStatusMsg(null);

    try {
      const res = await fetch(`${API_URL}/api/campaigns/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_input: jobInput,
          force_confirm: true,
        }),
      });
      const newCampaign: Campaign = await res.json();
      setCampaigns((prev) => [newCampaign, ...prev]);
      setSelectedIndex(0);
      setJobInput("");
    } catch (err) {
      alert("Something went wrong while searching. Please try again.");
    } finally {
      setRunning(false);
    }
  }

  async function handleSendAllSeparately() {
    const chosenRecipients = managers.filter((_, idx) => selectedEmails[idx]);
    if (chosenRecipients.length === 0) return;

    const subject =
      selectedSubject === "A"
        ? activeCampaign?.email_draft?.subject_line_a || ""
        : activeCampaign?.email_draft?.subject_line_b || "";

    setSending(true);
    setSendStatusMsg(null);

    try {
      const res = await fetch(`${API_URL}/api/campaigns/send-emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: chosenRecipients,
          subject,
          body_template: editableBody,
          primary_hm_name: managers[0]?.name || "",
        }),
      });

      const data = await res.json();
      const results = data.results || [];
      const failed = results.filter((r: any) => !r.success);

      if (failed.length > 0) {
        setSendStatusMsg(`Could not send: ${failed[0].error}`);
      } else {
        setSendStatusMsg(
          `✓ Sent ${results.length} separate emails successfully!`
        );
        setManagers((prev) =>
          prev.map((m, idx) => (selectedEmails[idx] ? { ...m, sent: true } : m))
        );
      }
    } catch (err) {
      setSendStatusMsg("Could not reach email server.");
    } finally {
      setSending(false);
    }
  }

  function handleCopyEmail() {
    const subject =
      selectedSubject === "A"
        ? activeCampaign?.email_draft?.subject_line_a
        : activeCampaign?.email_draft?.subject_line_b;
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${editableBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const selectedCount = Object.values(selectedEmails).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#141413]">
      {/* Simple Top Header */}
      <header className="border-b border-[#E6E4DD] bg-[#FAF8F5] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif tracking-tight">
            envoy<span className="text-[#D94E34]">.</span>
          </Link>

          <div className="flex items-center gap-6 text-xs font-medium">
            <Link href="/" className="text-[#686662] hover:text-[#141413]">
              1. Home
            </Link>
            <Link href="/resume" className="text-[#686662] hover:text-[#141413]">
              2. Your Profile
            </Link>
            <span className="text-[#141413] font-semibold underline decoration-[#D94E34] decoration-2 underline-offset-8">
              3. Outreach
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Top Search Bar */}
        <div className="p-6 rounded-2xl border border-[#E6E4DD] bg-white mb-6">
          <h1
            style={{ fontFamily: "var(--font-serif)" }}
            className="text-3xl mb-1"
          >
            Find the Hiring Manager & Draft Your Note
          </h1>
          <p className="text-xs text-[#686662] mb-4">
            Paste any job link (Workday, LinkedIn, Greenhouse) or role description below.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={jobInput}
              onChange={(e) => setJobInput(e.target.value)}
              placeholder="Paste job link or role description here..."
              className="flex-1 px-4 py-3 rounded-xl border border-[#E6E4DD] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#141413]"
            />
            <button
              onClick={handleFindManagers}
              disabled={running}
              className="px-6 py-3 rounded-xl bg-[#D94E34] text-white text-sm font-medium hover:bg-[#b83e27] transition flex items-center justify-center gap-2 disabled:opacity-60 shrink-0"
            >
              {running ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Finding decision makers...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Find Hiring Managers
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Workspace: Recipients (Left) + Email Composer (Middle) + Active Campaigns (Right) */}
        {!activeCampaign ? (
          <div className="p-14 rounded-2xl border border-[#E6E4DD] bg-white text-center">
            <Mail className="w-7 h-7 text-[#D94E34] mx-auto mb-3" />
            <h2 className="text-lg font-semibold mb-1">No active outreach yet</h2>
            <p className="text-xs text-[#686662] max-w-sm mx-auto">
              Paste a job link above and we’ll find the top 3–4 Hiring Managers along with a tailored email draft.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* LEFT (4 cols): 1. Select Recipients */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-2xl border border-[#E6E4DD] bg-white">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-semibold">1. Select Recipients</h2>
                  <span className="text-xs text-[#1B4332] font-medium">
                    {selectedCount} of {managers.length} selected
                  </span>
                </div>
                <p className="text-xs text-[#686662] mb-4">
                  {activeCampaign.job_data?.job_role} at{" "}
                  <strong className="text-[#141413]">
                    {activeCampaign.job_data?.company_name}
                  </strong>
                </p>

                <div className="space-y-3">
                  {managers.map((hm, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition ${
                        selectedEmails[idx]
                          ? "border-[#141413] bg-[#FAF8F5]/60"
                          : "border-[#E6E4DD] bg-white opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!selectedEmails[idx]}
                            onChange={(e) =>
                              setSelectedEmails({
                                ...selectedEmails,
                                [idx]: e.target.checked,
                              })
                            }
                            className="mt-1 rounded accent-[#D94E34]"
                          />
                          <div>
                            <p className="font-semibold text-sm leading-snug">
                              {hm.name}
                            </p>
                            <p className="text-xs text-[#686662]">{hm.title}</p>
                          </div>
                        </label>

                        <div className="flex items-center gap-2 shrink-0">
                          {hm.sent && (
                            <span className="px-2 py-0.5 rounded-full bg-[#1B4332] text-white text-[10px]">
                              Sent ✓
                            </span>
                          )}
                          {hm.linkedin && (
                            <a
                              href={hm.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-[#D94E34] hover:underline flex items-center gap-0.5"
                            >
                              LinkedIn <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      <input
                        value={hm.email}
                        onChange={(e) => {
                          const updated = [...managers];
                          updated[idx] = { ...updated[idx], email: e.target.value };
                          setManagers(updated);
                        }}
                        placeholder="Email address"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E6E4DD] bg-white text-xs text-[#141413]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CENTER (5 cols): 2. Review & Send Email */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-2xl border border-[#E6E4DD] bg-white flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold">2. Review & Send Email</h2>
                    <span className="text-xs text-[#686662]">
                      Sent individually 1-on-1
                    </span>
                  </div>

                  {/* Subject Line Options */}
                  <div className="space-y-2 mb-4">
                    <label className="text-xs text-[#686662] block">Subject Line</label>
                    <button
                      onClick={() => setSelectedSubject("A")}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs transition ${
                        selectedSubject === "A"
                          ? "border-[#141413] bg-[#FAF8F5] font-semibold"
                          : "border-[#E6E4DD] text-[#686662]"
                      }`}
                    >
                      Option 1: {activeCampaign.email_draft?.subject_line_a}
                    </button>

                    <button
                      onClick={() => setSelectedSubject("B")}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs transition ${
                        selectedSubject === "B"
                          ? "border-[#141413] bg-[#FAF8F5] font-semibold"
                          : "border-[#E6E4DD] text-[#686662]"
                      }`}
                    >
                      Option 2: {activeCampaign.email_draft?.subject_line_b}
                    </button>
                  </div>

                  {/* Editable Email Body */}
                  <div className="mb-4">
                    <label className="text-xs text-[#686662] block mb-1.5">
                      Message (First name is automatically swapped for each recipient)
                    </label>
                    <textarea
                      rows={11}
                      value={editableBody}
                      onChange={(e) => setEditableBody(e.target.value)}
                      className="w-full p-4 rounded-xl border border-[#E6E4DD] bg-[#FAF8F5] text-sm leading-relaxed focus:outline-none focus:border-[#141413]"
                    />
                  </div>

                  {sendStatusMsg && (
                    <div className="p-3 mb-4 rounded-xl border border-[#E6E4DD] bg-[#FAF8F5] text-xs font-medium">
                      {sendStatusMsg}
                    </div>
                  )}
                </div>

                {/* Send & Copy Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-[#E6E4DD]">
                  <button
                    onClick={handleSendAllSeparately}
                    disabled={sending || selectedCount === 0}
                    className="flex-1 py-3.5 px-5 rounded-full bg-[#D94E34] text-white text-sm font-medium hover:bg-[#b83e27] transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {sending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Sending {selectedCount} Emails...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Separate Emails ({selectedCount})
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopyEmail}
                    className="py-3.5 px-5 rounded-full border border-[#E6E4DD] bg-[#FAF8F5] text-xs font-medium hover:border-[#141413] transition flex items-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#1B4332]" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR (3 cols): Active / Saved Campaigns */}
            <div className="lg:col-span-3 space-y-3">
              <div className="p-5 rounded-2xl border border-[#E6E4DD] bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-[#D94E34]" />
                  <h3 className="text-sm font-semibold">
                    Active Campaigns ({campaigns.length})
                  </h3>
                </div>
                <p className="text-xs text-[#686662] mb-4">
                  Click any company below to view its contacts and email draft.
                </p>

                <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                  {campaigns.map((camp, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedIndex(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border transition ${
                        selectedIndex === idx
                          ? "border-[#141413] bg-[#FAF8F5] shadow-sm"
                          : "border-[#E6E4DD] bg-white hover:bg-[#FAF8F5]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm truncate">
                          {camp.job_data?.company_name || "Company"}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1B4332]/15 text-[#1B4332] font-medium shrink-0">
                          {camp.hiring_managers?.length || 1} contacts
                        </span>
                      </div>
                      <p className="text-xs text-[#686662] truncate">
                        {camp.job_data?.job_role}
                      </p>
                      {camp.job_data?.location && (
                        <p className="text-[11px] text-[#686662]/80 mt-1">
                          {camp.job_data.location}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}