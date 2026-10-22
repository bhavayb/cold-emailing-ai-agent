"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles, Play, ArrowRight, CheckCircle2, Mail } from "lucide-react";

const SAMPLE_MATCHES = [
  {
    company: "Razorpay",
    posted: "2d ago",
    match: "94% Match",
    manager: "Vikramaditya Singh",
    title: "VP of Engineering",
    location: "Bengaluru · Hybrid",
    role: "Senior Backend Engineer",
    hook: "Recently posted about scaling UPI payment switches to 10k TPS",
    skills: ["Go", "Distributed Systems", "Kafka", "PostgreSQL"],
  },
  {
    company: "Stripe",
    posted: "1d ago",
    match: "92% Match",
    manager: "Sarah Chen",
    title: "Head of Core Infrastructure",
    location: "Remote · Full-time",
    role: "Staff AI Engineer",
    hook: "Wrote an engineering note on reducing LLM tail latency by 40%",
    skills: ["Python", "Rust", "LLMs", "Kubernetes"],
  },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#141413]">
      {/* 1. Minimal Top Navbar */}
      <header className="border-b border-[#E6E4DD] bg-[#FAF8F5]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif tracking-tight flex items-center gap-1">
            envoy<span className="text-[#D94E34]">.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-[#686662]">
            <a href="#how-it-works" className="hover:text-[#141413]">How it works</a>
            <a href="#matches" className="hover:text-[#141413]">Features</a>
            <Link href="/resume" className="hover:text-[#141413]">Resume Dossier</Link>
            <Link href="/campaigns" className="hover:text-[#141413]">Campaign Board</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/resume"
              className="px-4 py-2 rounded-full bg-[#D94E34] text-white text-sm font-medium hover:bg-[#b83e27] transition flex items-center gap-1.5"
            >
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (myjobb.ai style) */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E6E4DD] bg-white text-xs font-mono text-[#686662] mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#D94E34]" />
          Your AI Hiring Manager Outreach Agent
        </div>

        <h1
          style={{ fontFamily: "var(--font-serif)" }}
          className="text-5xl md:text-7xl leading-[1.06] tracking-tight text-[#141413] mb-6"
        >
          Skip the resume pile. <br />
          Write <span className="italic text-[#D94E34]">directly</span> to the person hiring.
        </h1>

        <p className="text-base md:text-lg text-[#686662] max-w-2xl mx-auto leading-relaxed mb-8">
          Watches your target roles, finds the exact Hiring Manager with 90%+ confidence,
          reads their recent posts, and drafts a personal 130-word note in your Gmail.
          It asks you when it is unsure.
        </p>

        {/* Dual Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <Link
            href="/resume"
            className="px-7 py-3.5 rounded-full bg-[#D94E34] text-white font-medium text-sm hover:bg-[#b83e27] transition flex items-center gap-2 shadow-sm"
          >
            Upload resume to start <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/campaigns"
            className="px-6 py-3.5 rounded-full border border-[#E6E4DD] bg-white text-[#141413] font-medium text-sm hover:border-[#141413] transition flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-[#141413]" /> Watch it draft an email
          </Link>
        </div>

        {/* Social Proof Logo Strip */}
        <div className="pt-6 border-t border-[#E6E4DD]">
          <p className="text-[11px] font-mono uppercase tracking-widest text-[#686662] mb-4">
            Where Envoy users landed interviews
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 text-sm font-semibold tracking-tight text-[#686662]/80">
            <span>Razorpay</span>
            <span>Stripe</span>
            <span>Swiggy</span>
            <span>Linear</span>
            <span>PhonePe</span>
            <span>Zepto</span>
            <span>Vercel</span>
          </div>
        </div>
      </section>

      {/* 3. Live Product Showcase Frame (app.envoy.ai/discover) */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 pb-20 relative">
        <div className="rounded-2xl border border-[#E6E4DD] bg-white overflow-hidden shadow-sm">
          {/* Browser Top Bar */}
          <div className="px-4 py-3 border-b border-[#E6E4DD] bg-[#FAF8F5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E6E4DD]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E6E4DD]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E6E4DD]" />
            </div>
            <div className="px-4 py-1 rounded-md border border-[#E6E4DD] bg-white text-xs font-mono text-[#686662]">
              app.envoy.ai/discover
            </div>
            <div className="text-xs font-mono text-[#1B4332]">● Agent Online</div>
          </div>

          {/* Browser Body */}
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  style={{ fontFamily: "var(--font-serif)" }}
                  className="text-2xl text-[#141413]"
                >
                  Hiring Managers matched to your profile
                </h2>
                <p className="text-xs text-[#686662]">
                  Ranked by title match, department ownership, and recent activity
                </p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E6E4DD]">
                2 decision makers ready
              </span>
            </div>

            {/* Match Cards */}
            <div className="grid md:grid-cols-2 gap-5">
              {SAMPLE_MATCHES.map((item) => (
                <div
                  key={item.company}
                  className="p-5 rounded-xl border border-[#E6E4DD] bg-[#FAF8F5]/50 hover:border-[#141413] transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">{item.company}</span>
                        <span className="text-xs text-[#686662] font-mono">· {item.posted}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#1B4332] text-white text-xs font-mono">
                        ★ {item.match}
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="font-semibold text-[#141413]">{item.manager}</p>
                      <p className="text-xs text-[#686662]">
                        {item.title} · Hiring for <span className="text-[#141413] font-medium">{item.role}</span>
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-[#E6E4DD] text-xs text-[#141413] mb-4">
                      <span className="font-mono text-[10px] uppercase text-[#D94E34] block mb-0.5">
                        Personalization Hook Found
                      </span>
                      “{item.hook}”
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {item.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded border border-[#E6E4DD] bg-white text-[11px] font-mono text-[#686662]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/campaigns"
                    className="w-full py-2.5 rounded-lg bg-[#141413] text-white text-xs font-mono uppercase tracking-wider text-center hover:bg-[#D94E34] transition"
                  >
                    Draft Gmail Note →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Gmail Reply Toast (myjobb.ai style) */}
        <div className="mt-4 md:mt-0 md:absolute md:-bottom-5 md:right-10 max-w-sm p-4 rounded-xl border border-[#1B4332]/30 bg-white shadow-lg flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1B4332]">Reply received in Gmail</span>
              <span className="text-[10px] font-mono text-[#686662]">just now</span>
            </div>
            <p className="text-xs text-[#141413] mt-0.5">
              <span className="font-medium">Vikramaditya (Razorpay):</span> “Loved your note on our UPI post — free Thursday at 2 PM?”
            </p>
          </div>
        </div>

        {/* 4-Step Feature Switcher Tabs Underneath */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
          {[
            { id: 1, label: "1. Upload your resume" },
            { id: 2, label: "2. Paste any job link" },
            { id: 3, label: "3. Verify Hiring Manager" },
            { id: 4, label: "4. Draft in your Gmail" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 rounded-xl border text-left font-mono text-xs transition flex items-center justify-between ${
                activeTab === tab.id
                  ? "border-[#141413] bg-white text-[#141413] font-semibold"
                  : "border-[#E6E4DD] bg-[#FAF8F5] text-[#686662]"
              }`}
            >
              <span>{tab.label}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}