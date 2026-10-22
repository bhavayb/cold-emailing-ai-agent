"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";

interface ImpactMetric {
  badge: string;
  statement: string;
}

interface Dossier {
  full_name: string;
  headline: string;
  signature_hook: string;
  impact_metrics: ImpactMetric[];
  skills: string[];
}

const DEFAULT_DOSSIER: Dossier = {
  full_name: "",
  headline: "",
  signature_hook:
    "Upload your resume on the left and we will automatically extract your strongest achievements and skills here.",
  impact_metrics: [
    {
      badge: "+42% Performance",
      statement: "Redesigned core API layer handling high-throughput production traffic.",
    },
    {
      badge: "100k+ Users",
      statement: "Built end-to-end full-stack architecture from zero to production.",
    },
  ],
  skills: ["Python", "TypeScript", "React", "SQL", "System Design"],
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ResumePage() {
  const router = useRouter();
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<Dossier>(DEFAULT_DOSSIER);

  useEffect(() => {
    fetch(`${API_URL}/api/resume`)
      .then((res) => res.json())
      .then((data) => {
        if (data.dossier && data.dossier.full_name) {
          setDossier(data.dossier);
        }
      })
      .catch(() => {});
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/api/resume/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.dossier) {
        setDossier(data.dossier);
      }
    } catch (err) {
      alert("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAndContinue() {
    await fetch(`${API_URL}/api/resume`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dossier),
    });
    router.push("/campaigns");
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#141413]">
      {/* Simple Top Header */}
      <header className="border-b border-[#E6E4DD] bg-[#FAF8F5] sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif tracking-tight">
            envoy<span className="text-[#D94E34]">.</span>
          </Link>

          <div className="flex items-center gap-6 text-xs font-medium">
            <Link href="/" className="text-[#686662] hover:text-[#141413]">
              1. Home
            </Link>
            <span className="text-[#141413] font-semibold underline decoration-[#D94E34] decoration-2 underline-offset-8">
              2. Your Profile
            </span>
            <Link href="/campaigns" className="text-[#686662] hover:text-[#141413]">
              3. Outreach
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1
            style={{ fontFamily: "var(--font-serif)" }}
            className="text-4xl tracking-tight mb-2"
          >
            Set up your candidate profile
          </h1>
          <p className="text-sm text-[#686662]">
            Upload your resume once. We use your key achievements to personalize every outreach email.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Left: Upload & Basic Info */}
          <div className="md:col-span-5 space-y-4">
            <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-[#E6E4DD] hover:border-[#141413] bg-white p-8 text-center transition">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E6E4DD] flex items-center justify-center mx-auto mb-3">
                {loading ? (
                  <RefreshCw className="w-5 h-5 text-[#D94E34] animate-spin" />
                ) : (
                  <UploadCloud className="w-5 h-5 text-[#D94E34]" />
                )}
              </div>

              <p className="font-medium text-sm mb-1">
                {loading ? "Reading your resume..." : "Upload your resume (PDF)"}
              </p>
              <p className="text-xs text-[#686662]">
                Click to browse files from your computer
              </p>
            </label>

            {fileName && (
              <div className="p-3.5 rounded-xl border border-[#E6E4DD] bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[#141413]" />
                  <span className="text-xs font-medium truncate max-w-[200px]">
                    {fileName}
                  </span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#1B4332]" />
              </div>
            )}

            <div className="p-5 rounded-2xl border border-[#E6E4DD] bg-white space-y-3">
              <div>
                <label className="text-xs text-[#686662] block mb-1">Your Name</label>
                <input
                  value={dossier.full_name}
                  placeholder="e.g. Rohan Sharma"
                  onChange={(e) => setDossier({ ...dossier, full_name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E6E4DD] bg-[#FAF8F5] text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-[#686662] block mb-1">Current Title / Role</label>
                <input
                  value={dossier.headline}
                  placeholder="e.g. Data Science Intern"
                  onChange={(e) => setDossier({ ...dossier, headline: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E6E4DD] bg-[#FAF8F5] text-sm"
                />
              </div>
            </div>
          </div>

          {/* Right: Key Highlights & Skills */}
          <div className="md:col-span-7 space-y-5">
            <div className="p-6 rounded-2xl border border-[#E6E4DD] bg-white space-y-4">
              <div>
                <h2 className="text-base font-semibold mb-1">One-Line Summary</h2>
                <textarea
                  rows={2}
                  value={dossier.signature_hook}
                  onChange={(e) =>
                    setDossier({ ...dossier, signature_hook: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-[#E6E4DD] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#141413]"
                />
              </div>

              <div>
                <h2 className="text-base font-semibold mb-2">Key Highlights Mentioned in Emails</h2>
                <div className="space-y-2.5">
                  {dossier.impact_metrics?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-[#E6E4DD] bg-[#FAF8F5]/60 flex items-start gap-3"
                    >
                      <span className="px-2.5 py-1 rounded-md bg-[#1B4332] text-white text-xs font-medium shrink-0">
                        {item.badge}
                      </span>
                      <p className="text-xs text-[#141413] leading-relaxed">
                        {item.statement}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-base font-semibold mb-2">Top Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {dossier.skills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full border border-[#E6E4DD] bg-[#FAF8F5] text-xs text-[#141413]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveAndContinue}
                className="px-7 py-3.5 rounded-full bg-[#D94E34] text-white text-sm font-medium hover:bg-[#b83e27] transition flex items-center gap-2"
              >
                Continue to Outreach <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}