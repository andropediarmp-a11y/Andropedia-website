"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  CheckCircle2, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  Code2, 
  Globe, 
  Cpu, 
  Palette, 
  Video, 
  Megaphone,
  ArrowRight
} from "lucide-react";

export default function JoinPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    year: "second",
    domain: "web",
    portfolioUrl: "",
    experience: "",
    motivation: "",
    consent: false,
    website: "", // honeypot, hidden from real users
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [reference, setReference] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const domains = [
    { id: "technical", name: "Technical", desc: "C++, Rust, Systems, DSA, Competitive Programming" },
    { id: "web", name: "Web", desc: "Next.js, TypeScript, Cloud, APIs, Microservices" },
    { id: "rd", name: "R&D", desc: "Machine Learning, PyTorch, Vision, Research Papers" },
    { id: "design", name: "Design", desc: "UI/UX, Figma Tokens, 3D Assets, Micro-interactions" },
    { id: "media", name: "Media", desc: "Cinematography, After Effects, VFX, Video Podcasts" },
    { id: "pr", name: "PR", desc: "Corporate Sponsorships, Hackathon Logistics, Alliances" },
  ];

  const faqs = [
    {
      q: "Who is eligible to apply for Andropedia?",
      a: "Any undergraduate or postgraduate student with an active appetite for engineering, design, or community building. We welcome 1st, 2nd, and 3rd year students across all branches."
    },
    {
      q: "How does the weekly task and evaluation cycle work?",
      a: "Once inducted, each domain assigns weekly challenges tailored to current industry and research demands. Members submit deliverables via our portal, which domain leads evaluate on technical depth, innovation, completion, and documentation. Scores update the live leaderboard."
    },
    {
      q: "What is the expected weekly time commitment?",
      a: "Typically 6 to 10 hours per week, covering the weekly task sprint, domain sync discussions, and collaborative weekend hack sessions."
    },
    {
      q: "Can I contribute to more than one domain?",
      a: "Yes! While each member has a primary domain for weekly evaluations and leaderboard tracking, cross-domain collaboration on hackathons and flagship projects is strongly encouraged."
    }
  ];

  const domainName = domains.find((d) => d.id === formData.domain)?.name ?? formData.domain;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          year: formData.year,
          domain: formData.domain,
          skills: formData.experience,
          motivation: formData.motivation,
          portfolioUrl: formData.portfolioUrl,
          consent: formData.consent,
          website: formData.website,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setReference(data.reference);
        setSubmitted(true);
      } else {
        setErrorMsg(data?.error || "Something went wrong. Please try again.");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            ANDROPEDIA RECRUITMENT SPRINT 2026
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            Join the <span className="text-gradient-emerald">Tech Forge</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Take the leap. Build real systems, solve high-stake problems, and climb the club leaderboard alongside the sharpest minds on campus.
          </p>
        </div>

        {/* Form or Submitted confirmation */}
        {submitted ? (
          <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-emerald-500/40 text-center space-y-6 max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Application Received!</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Thank you for applying to Andropedia, <span className="text-emerald-400 font-semibold">{formData.fullName}</span>. 
                Our <span className="text-emerald-400 font-semibold">{domainName}</span> domain leads are reviewing submissions. We&apos;ve emailed a confirmation to <span className="text-emerald-400 font-semibold">{formData.email}</span>. Shortlisted candidates will be contacted by email.
              </p>
              <p className="text-xs font-mono text-slate-400">Reference ID: <span className="text-emerald-300">{reference}</span></p>
            </div>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/portal/login"
                className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
              >
                Inspect Live Leaderboard &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 space-y-8">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">Candidate Information</h2>
              <p className="text-xs text-slate-400 font-mono">Fill out your profile details and select your preferred domain track.</p>
            </div>

            {/* Grid 1: Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Maya Nair"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/90 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">College Email *</label>
                <input
                  required
                  type="email"
                  placeholder="name@student.college.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/90 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">Academic Year *</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/90 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400 transition-colors"
                >
                  <option value="first">1st Year (Freshman)</option>
                  <option value="second">2nd Year (Sophomore)</option>
                  <option value="third">3rd Year (Junior)</option>
                  <option value="fourth">4th Year (Senior)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">GitHub / Portfolio URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/yourhandle"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/90 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>

            {/* Domain Selection Radios */}
            <div className="space-y-3">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                Primary Domain Preference *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {domains.map((dom) => (
                  <label
                    key={dom.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      formData.domain === dom.id
                        ? "bg-emerald-500/15 border-emerald-400 text-white shadow-md shadow-emerald-500/10"
                        : "bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-sm">{dom.name}</span>
                      <input
                        type="radio"
                        name="domain"
                        value={dom.id}
                        checked={formData.domain === dom.id}
                        onChange={() => setFormData({ ...formData, domain: dom.id })}
                        className="accent-emerald-500"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 leading-snug">{dom.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                  Relevant Experience or Prior Projects *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail your experience with technologies, frameworks, competitions, or past projects..."
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/90 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                  Why do you want to join Andropedia? *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="What excites you about our weekly sprints, culture, and club projects?"
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/90 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>

            {/* Honeypot: hidden from people, bots tend to fill it */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="hidden"
            />

            <label className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed cursor-pointer">
              <input
                required
                type="checkbox"
                checked={formData.consent}
                onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                className="mt-0.5 accent-emerald-500"
              />
              <span>I agree that Andropedia may store my application details and contact me by email about my application. *</span>
            </label>

            {errorMsg && (
              <p role="alert" className="rounded-xl border border-rose-500/35 bg-rose-500/10 p-3 text-xs text-rose-200">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
              data-cursor-text="Apply"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "Submitting..." : "Submit Recruitment Application"}</span>
            </button>
          </form>
        )}

        {/* FAQs */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 space-y-6">
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="divide-y divide-white/10">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="py-4">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left font-semibold text-white hover:text-emerald-400 transition-colors text-base"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-emerald-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm text-slate-300 leading-relaxed animate-in fade-in-50 duration-200">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
