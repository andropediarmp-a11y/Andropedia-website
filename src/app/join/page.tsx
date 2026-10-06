"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Send,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Rocket,
  MessageSquareText,
  Users,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  DomainId,
  ELIGIBILITY,
  FAQS,
  PROCESS_STEPS,
  RECRUITMENT_CYCLE,
  RECRUIT_DOMAINS,
  WHY_JOIN,
} from "@/content/recruitment";

type Field =
  | "name" | "email" | "year" | "portfolioUrl"
  | "domain"
  | "domainAnswer" | "skills" | "motivation"
  | "consent";

interface FormData {
  name: string;
  email: string;
  year: string;
  portfolioUrl: string;
  domain: DomainId | "";
  domainAnswer: string;
  skills: string;
  motivation: string;
  consent: boolean;
  website: string; // honeypot, hidden from real users
}

const STEPS = ["Your details", "Choose domain", "Your answers", "Review & submit"];
const STEP_FIELDS: Field[][] = [
  ["name", "email", "year", "portfolioUrl"],
  ["domain"],
  ["domainAnswer", "skills", "motivation"],
  ["consent"],
];
const WHY_ICONS = [Rocket, MessageSquareText, Users];
const YEAR_LABELS: Record<string, string> = {
  first: "1st Year", second: "2nd Year", third: "3rd Year", fourth: "4th Year", other: "Other",
};

const EMPTY: FormData = {
  name: "", email: "", year: "second", portfolioUrl: "", domain: "",
  domainAnswer: "", skills: "", motivation: "", consent: false, website: "",
};

// Mirrors the server rules in src/lib/recruitment/schema.ts so people see problems early.
function validate(f: FormData, step: number): Partial<Record<Field, string>> {
  const e: Partial<Record<Field, string>> = {};
  const len = (v: string) => v.trim().length;
  if (step === 0) {
    if (len(f.name) < 2) e.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Enter a valid college email.";
    if (f.portfolioUrl.trim() && !(/^https?:\/\//i.test(f.portfolioUrl.trim()) && URL.canParse(f.portfolioUrl.trim()))) {
      e.portfolioUrl = "Enter a valid http(s) link.";
    }
  }
  if (step === 1 && !f.domain) e.domain = "Choose the domain you want to join.";
  if (step === 2) {
    if (len(f.domainAnswer) < 20) e.domainAnswer = "Please write at least 20 characters.";
    if (len(f.skills) < 20) e.skills = "Please write at least 20 characters.";
    if (len(f.motivation) < 40) e.motivation = "Please write at least 40 characters.";
  }
  if (step === 3 && !f.consent) e.consent = "Consent is required to submit.";
  return e;
}

const inputClass =
  "w-full px-4 py-3 bg-slate-900/90 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors";
const labelClass = "text-xs font-mono text-slate-300 uppercase tracking-wider";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-center gap-1.5 text-xs text-rose-300">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </p>
  );
}

export default function JoinPage() {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [reference, setReference] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const formTop = useRef<HTMLDivElement>(null);

  const domain = RECRUIT_DOMAINS.find((d) => d.id === form.domain);
  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key as Field] ? { ...prev, [key]: undefined } : prev));
  };

  const goToStep = (next: number) => {
    setStep(next);
    setServerError("");
    formTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNext = () => {
    const found = validate(form, step);
    setErrors(found);
    if (Object.keys(found).length === 0) goToStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(form, 3);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          year: form.year,
          domain: form.domain,
          skills: form.skills,
          motivation: form.motivation,
          domainAnswer: form.domainAnswer,
          portfolioUrl: form.portfolioUrl,
          consent: form.consent,
          website: form.website,
        }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setReference(data.reference);
        setSubmitted(true);
        formTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      if (res.status === 409) {
        // This email already has an application.
        setErrors({ email: data?.error || "An application with this email already exists." });
        goToStep(0);
      } else if (data?.fieldErrors) {
        const fe = data.fieldErrors as Record<string, string[]>;
        const mapped: Partial<Record<Field, string>> = {};
        for (const key of Object.keys(fe)) mapped[key as Field] = fe[key][0];
        const firstStep = STEP_FIELDS.findIndex((fields) => fields.some((f) => mapped[f]));
        setErrors(mapped);
        if (firstStep >= 0 && firstStep !== 3) goToStep(firstStep);
        setServerError(data.error || "Please check the highlighted fields.");
      } else {
        setServerError(data?.error || "Something went wrong. Please try again.");
      }
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToApply = () =>
    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* ---------- Header ---------- */}
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            ANDROPEDIA {RECRUITMENT_CYCLE.toUpperCase()}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            Join the <span className="text-gradient-emerald">Tech Forge</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Take the leap. Build real systems, solve high-stakes problems, and climb the club leaderboard alongside the sharpest minds on campus.
          </p>
          <button
            type="button"
            onClick={scrollToApply}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
            data-cursor-text="Apply"
          >
            Start your application <ArrowRight className="w-4 h-4" />
          </button>
        </header>

        {/* ---------- Why join ---------- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5" aria-label="Why join">
          {WHY_JOIN.map((item, i) => {
            const Icon = WHY_ICONS[i % WHY_ICONS.length];
            return (
              <div key={item.title} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold text-white">{item.title}</h2>
                <p className="text-sm text-slate-400 leading-relaxed">{item.text}</p>
              </div>
            );
          })}
        </section>

        {/* ---------- Eligibility + process ---------- */}
        <section className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8" aria-label="Eligibility and selection process">
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-xl font-bold text-white">Who can apply</h2>
            <ul className="space-y-3">
              {ELIGIBILITY.map((line) => (
                <li key={line} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-5">
            <h2 className="text-xl font-bold text-white">How selection works</h2>
            <ol className="space-y-5">
              {PROCESS_STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="w-8 h-8 shrink-0 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{s.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Application ---------- */}
        <section id="apply" className="scroll-mt-24" aria-label="Application">
          <div ref={formTop} className="scroll-mt-24" />

          {submitted ? (
            <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-emerald-500/40 text-center space-y-6 max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Application Received!</h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Thank you for applying to Andropedia, <span className="text-emerald-400 font-semibold">{form.name}</span>.
                  Our <span className="text-emerald-400 font-semibold">{domain?.name}</span> domain leads will review it. We&apos;ve emailed a confirmation to{" "}
                  <span className="text-emerald-400 font-semibold">{form.email}</span>. Shortlisted candidates will be contacted by email.
                </p>
                <p className="text-xs font-mono text-slate-400">
                  Reference ID: <span className="text-emerald-300">{reference}</span>
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex px-6 py-3 rounded-xl glass-panel text-slate-300 hover:text-white text-sm"
              >
                Back to home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="glass-panel p-6 sm:p-12 rounded-3xl border border-white/10 space-y-8">
              {/* progress */}
              <ol className="flex items-center gap-2 sm:gap-3" aria-label="Application progress">
                {STEPS.map((label, i) => (
                  <li key={label} className="flex-1 space-y-2" aria-current={i === step ? "step" : undefined}>
                    <div className={`h-1.5 rounded-full transition-colors ${i <= step ? "bg-emerald-400" : "bg-white/10"}`} />
                    <span className={`block text-[10px] sm:text-xs font-mono uppercase tracking-wider ${i === step ? "text-emerald-300" : "text-slate-500"}`}>
                      <span className="hidden sm:inline">{i + 1}. </span>{label}
                    </span>
                  </li>
                ))}
              </ol>

              {serverError && (
                <p role="alert" className="rounded-xl border border-rose-500/35 bg-rose-500/10 p-3 text-xs text-rose-200">
                  {serverError}
                </p>
              )}

              {/* Step 1: details */}
              {step === 0 && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-xl font-bold text-white">Your details</h2>
                    <p className="text-xs text-slate-400 font-mono">Use the email you check often: your confirmation and updates go there. One application per email.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className={labelClass}>Full Name *</label>
                      <input id="name" type="text" autoComplete="name" placeholder="e.g. Maya Nair" value={form.name}
                        onChange={(e) => set("name", e.target.value)} className={inputClass} />
                      <FieldError message={errors.name} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className={labelClass}>College Email *</label>
                      <input id="email" type="email" autoComplete="email" placeholder="name@student.college.edu" value={form.email}
                        onChange={(e) => set("email", e.target.value)} className={inputClass} />
                      <FieldError message={errors.email} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="year" className={labelClass}>Academic Year *</label>
                      <select id="year" value={form.year} onChange={(e) => set("year", e.target.value)} className={inputClass}>
                        <option value="first">1st Year (Freshman)</option>
                        <option value="second">2nd Year (Sophomore)</option>
                        <option value="third">3rd Year (Junior)</option>
                        <option value="fourth">4th Year (Senior)</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="portfolio" className={labelClass}>GitHub / Portfolio link</label>
                      <input id="portfolio" type="url" placeholder="https://github.com/yourhandle" value={form.portfolioUrl}
                        onChange={(e) => set("portfolioUrl", e.target.value)} className={inputClass} />
                      <FieldError message={errors.portfolioUrl} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: domain */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-xl font-bold text-white">Choose your domain</h2>
                    <p className="text-xs text-slate-400 font-mono">Pick the track you most want to be evaluated in. You can still collaborate across domains later.</p>
                  </div>
                  <div role="radiogroup" aria-label="Domain" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {RECRUIT_DOMAINS.map((d) => (
                      <label
                        key={d.id}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          form.domain === d.id
                            ? "bg-emerald-500/15 border-emerald-400 text-white shadow-md shadow-emerald-500/10"
                            : "bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-sm">{d.name}</span>
                          <input type="radio" name="domain" value={d.id} checked={form.domain === d.id}
                            onChange={() => set("domain", d.id)} className="accent-emerald-500" />
                        </div>
                        <span className="text-[11px] text-slate-400 leading-snug">{d.desc}</span>
                      </label>
                    ))}
                  </div>
                  <FieldError message={errors.domain} />
                </div>
              )}

              {/* Step 3: answers */}
              {step === 2 && domain && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-xl font-bold text-white">Your answers</h2>
                    <p className="text-xs text-slate-400 font-mono">Be specific and honest. We read every answer.</p>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="domainAnswer" className={labelClass}>{domain.name} question *</label>
                    <p className="text-sm text-slate-200">{domain.question}</p>
                    <textarea id="domainAnswer" rows={4} maxLength={800} placeholder={domain.placeholder} value={form.domainAnswer}
                      onChange={(e) => set("domainAnswer", e.target.value)} className={inputClass} />
                    <div className="flex justify-between"><FieldError message={errors.domainAnswer} /><span className="text-[10px] font-mono text-slate-500 ml-auto">{form.domainAnswer.length}/800</span></div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="skills" className={labelClass}>Relevant experience or prior projects *</label>
                    <textarea id="skills" rows={3} maxLength={800} placeholder="Technologies, frameworks, competitions or past projects..." value={form.skills}
                      onChange={(e) => set("skills", e.target.value)} className={inputClass} />
                    <div className="flex justify-between"><FieldError message={errors.skills} /><span className="text-[10px] font-mono text-slate-500 ml-auto">{form.skills.length}/800</span></div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="motivation" className={labelClass}>Why do you want to join Andropedia? *</label>
                    <textarea id="motivation" rows={4} maxLength={1200} placeholder="What excites you about our weekly sprints, culture and club projects?" value={form.motivation}
                      onChange={(e) => set("motivation", e.target.value)} className={inputClass} />
                    <div className="flex justify-between"><FieldError message={errors.motivation} /><span className="text-[10px] font-mono text-slate-500 ml-auto">{form.motivation.length}/1200</span></div>
                  </div>
                </div>
              )}

              {/* Step 4: review */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-xl font-bold text-white">Review & submit</h2>
                    <p className="text-xs text-slate-400 font-mono">Check everything. Only one application is allowed per email.</p>
                  </div>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    {[
                      ["Name", form.name],
                      ["Email", form.email],
                      ["Year", YEAR_LABELS[form.year]],
                      ["Domain", domain?.name ?? ""],
                      ["Portfolio", form.portfolioUrl || "None"],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{k}</dt>
                        <dd className="text-slate-200 break-words">{v}</dd>
                      </div>
                    ))}
                    {[
                      [domain?.question ?? "Domain question", form.domainAnswer],
                      ["Experience", form.skills],
                      ["Why Andropedia", form.motivation],
                    ].map(([k, v]) => (
                      <div key={k} className="sm:col-span-2">
                        <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{k}</dt>
                        <dd className="text-slate-200 whitespace-pre-wrap break-words">{v}</dd>
                      </div>
                    ))}
                  </dl>

                  {/* Honeypot: hidden from people, bots tend to fill it */}
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                    value={form.website} onChange={(e) => set("website", e.target.value)} className="hidden" />

                  <div className="space-y-2">
                    <label className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed cursor-pointer">
                      <input type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)}
                        className="mt-0.5 accent-emerald-500" />
                      <span>I agree that Andropedia may store my application details and contact me by email about my application. *</span>
                    </label>
                    <FieldError message={errors.consent} />
                  </div>
                </div>
              )}

              {/* controls */}
              <div className="flex items-center justify-between gap-3 pt-2">
                {step > 0 ? (
                  <button type="button" onClick={() => goToStep(step - 1)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl glass-panel text-slate-300 hover:text-white text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : <span />}

                {step < 3 ? (
                  <button type="button" onClick={handleNext}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="submit" disabled={submitting} data-cursor-text="Apply"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed">
                    <Send className="w-4 h-4" />
                    {submitting ? "Submitting..." : "Submit application"}
                  </button>
                )}
              </div>
            </form>
          )}
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 space-y-6" aria-label="Frequently asked questions">
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="divide-y divide-white/10">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.q} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between text-left font-semibold text-white hover:text-emerald-400 transition-colors text-base"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-emerald-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  {isOpen && <p className="mt-3 text-sm text-slate-300 leading-relaxed">{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
