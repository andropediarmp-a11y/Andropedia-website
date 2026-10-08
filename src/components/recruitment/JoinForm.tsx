"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, Copy, Lock, Send } from "lucide-react";
import { type DomainId, RECRUIT_DOMAINS } from "@/content/recruitment";
import { ToastRegion, useToasts } from "@/components/ui/Toast";
import { DOMAIN_ACCENT, accentVars } from "@/content/accents";
import type { DomainType } from "@/lib/types";

const ID_TO_DOMAIN: Record<DomainId, DomainType> = { technical: "Technical", web: "Web", rd: "R&D", design: "Design", media: "Media", pr: "PR" };

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

interface CycleInfo {
  state: "open" | "upcoming" | "closed";
  opensAt: string | null;
  closesAt: string | null;
  message: string;
}

const STEPS = ["Your details", "Choose domain", "Your answers", "Review & submit"];
const STEP_FIELDS: Field[][] = [
  ["name", "email", "year", "portfolioUrl"],
  ["domain"],
  ["domainAnswer", "skills", "motivation"],
  ["consent"],
];
const YEARS = ["first", "second", "third", "fourth", "other"];
const YEAR_LABELS: Record<string, string> = {
  first: "1st Year", second: "2nd Year", third: "3rd Year", fourth: "4th Year", other: "Other",
};
const DOMAIN_IDS = RECRUIT_DOMAINS.map((d) => d.id) as string[];

/** DOM id to focus for each field when it has an error. */
const FIELD_ID: Record<Field, string> = {
  name: "name", email: "email", year: "year", portfolioUrl: "portfolio",
  domain: `domain-${RECRUIT_DOMAINS[0].id}`,
  domainAnswer: "domainAnswer", skills: "skills", motivation: "motivation", consent: "consent",
};

const EMPTY: FormData = {
  name: "", email: "", year: "second", portfolioUrl: "", domain: "",
  domainAnswer: "", skills: "", motivation: "", consent: false, website: "",
};

// ---------------------------------------------------------------- draft autosave
const DRAFT_KEY = "andropedia_recruitment_draft_v1";
const DRAFT_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
interface Draft { form: FormData; step: number }

function loadDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (d?.v !== 1 || typeof d.savedAt !== "number" || Date.now() - d.savedAt > DRAFT_MAX_AGE_MS) return null;
    const f = d.form ?? {};
    const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
    const form: FormData = {
      name: str(f.name, 80),
      email: str(f.email, 160),
      year: YEARS.includes(f.year) ? f.year : "second",
      portfolioUrl: str(f.portfolioUrl, 300),
      domain: DOMAIN_IDS.includes(f.domain) ? f.domain : "",
      domainAnswer: str(f.domainAnswer, 800),
      skills: str(f.skills, 800),
      motivation: str(f.motivation, 1200),
      consent: false, // consent is always asked again
      website: "",
    };
    const filled = form.name || form.email || form.domain || form.domainAnswer || form.skills || form.motivation;
    if (!filled) return null;
    const step = Number.isInteger(d.step) ? Math.min(Math.max(d.step, 0), 2) : 0;
    return { form, step: step === 2 && !form.domain ? 1 : step };
  } catch {
    return null; // storage unavailable or corrupt: just start fresh
  }
}

function saveDraft(form: FormData, step: number) {
  try {
    const { consent, website, ...rest } = form;
    void consent; void website;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ v: 1, savedAt: Date.now(), step, form: rest }));
  } catch {
    /* storage full or blocked: autosave is best-effort */
  }
}

function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------- validation (mirrors the server)
function validate(f: FormData, step: number): Partial<Record<Field, string>> {
  const e: Partial<Record<Field, string>> = {};
  const len = (v: string) => v.trim().length;
  if (step === 0) {
    if (len(f.name) < 2) e.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Enter a valid college email.";
    const url = f.portfolioUrl.trim();
    if (url && !(/^https?:\/\//i.test(url) && URL.canParse(url))) e.portfolioUrl = "Enter a valid http(s) link.";
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

// ---------------------------------------------------------------- shared bits
const ring = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70";
const inputClass = `w-full px-4 py-3 bg-black/40 border border-white/15 rounded-xl text-base sm:text-sm text-white placeholder:text-white/40 shadow-[inset_0_0_30px_rgba(204,215,255,0.06)] focus:outline-none focus:border-emerald-400 aria-[invalid=true]:border-rose-400/70 transition-colors ${ring}`;
const labelClass = "text-xs font-mono text-slate-300 uppercase tracking-wider";
const primaryBtn = `btn-glow w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed ${ring}`;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs text-rose-300">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

const noopSubscribe = () => () => {};
/** False during server render and hydration, true afterwards (no effect + setState needed). */
function useMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

// ---------------------------------------------------------------- cycle banner
function CycleBanner({ cycle, daysLeft }: { cycle: CycleInfo; daysLeft: number | null }) {
  if (cycle.state !== "open" || !cycle.closesAt) return null;
  const urgent = daysLeft !== null && daysLeft <= 3;
  return (
    <p className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs sm:text-sm ${urgent ? "border-amber-400/40 bg-amber-500/10 text-amber-200" : "border-emerald-500/30 bg-emerald-500/5 text-emerald-200"}`}>
      <CalendarClock className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>
        Applications close on <strong>{formatDate(cycle.closesAt)}</strong>
        {daysLeft !== null && daysLeft <= 14 && (daysLeft <= 0 ? " (today)" : ` (${daysLeft} ${daysLeft === 1 ? "day" : "days"} left)`)}.
      </span>
    </p>
  );
}

function ClosedPanel({ cycle }: { cycle: CycleInfo }) {
  const upcoming = cycle.state === "upcoming";
  return (
    <div className="glass-card p-8 sm:p-12 text-center space-y-4 max-w-2xl mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center mx-auto">
        <Lock className="w-6 h-6 text-slate-300" aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-bold text-white">{upcoming ? "Applications open soon" : "Applications are closed"}</h2>
      <p className="text-sm text-slate-300 leading-relaxed">
        {upcoming && cycle.opensAt ? `Applications open on ${formatDate(cycle.opensAt)}.` : cycle.message}{" "}
        Follow the club for the next recruitment announcement.
      </p>
      <Link href="/" className={`btn-glass ${ring}`}>
        Back to home
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------- the form
export function JoinForm() {
  const mounted = useMounted();
  if (!mounted) {
    return (
      <div aria-busy="true" aria-label="Loading the application form" className="glass-card p-6 sm:p-12 space-y-6 animate-pulse">
        <div className="h-1.5 rounded-full bg-white/10" />
        <div className="h-6 w-48 rounded bg-white/10" />
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="h-12 rounded-xl bg-white/5" />
          <div className="h-12 rounded-xl bg-white/5" />
          <div className="h-12 rounded-xl bg-white/5" />
          <div className="h-12 rounded-xl bg-white/5" />
        </div>
      </div>
    );
  }
  return <ApplicationForm initialDraft={loadDraft()} />;
}

function ApplicationForm({ initialDraft }: { initialDraft: Draft | null }) {
  const [form, setForm] = useState<FormData>(initialDraft?.form ?? EMPTY);
  const [step, setStep] = useState(initialDraft?.step ?? 0);
  const [restored, setRestored] = useState(initialDraft !== null);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [reference, setReference] = useState("");
  const [queued, setQueued] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cycle, setCycle] = useState<CycleInfo | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const { toasts, push, dismiss } = useToasts(initialDraft ? ["Draft restored. Pick up where you left off."] : []);

  const topRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const domain = RECRUIT_DOMAINS.find((d) => d.id === form.domain);

  // Autosave (debounced). Not while showing the confirmation screen.
  useEffect(() => {
    if (submitted) return;
    const t = window.setTimeout(() => saveDraft(form, step), 600);
    return () => window.clearTimeout(t);
  }, [form, step, submitted]);

  // Deadline / open-close state from the server.
  const loadCycle = () =>
    fetch("/api/recruitment/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((c: CycleInfo & { success?: boolean }) => {
        setCycle(c);
        setDaysLeft(c.closesAt ? Math.ceil((Date.parse(c.closesAt) - Date.now()) / 86_400_000) : null);
      })
      .catch(() => undefined); // if the check fails, assume open: the server enforces it anyway
  useEffect(() => {
    void loadCycle();
  }, []);

  // Move focus to the step heading whenever the step changes (not on first render).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key as Field] ? { ...prev, [key]: undefined } : prev));
  };

  const goToStep = (next: number) => {
    setStep(next);
    setServerError("");
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const focusFirstError = (found: Partial<Record<Field, string>>, fields: Field[]) => {
    const first = fields.find((f) => found[f]);
    if (first) window.setTimeout(() => document.getElementById(FIELD_ID[first])?.focus(), 0);
  };

  const handleNext = () => {
    const found = validate(form, step);
    setErrors(found);
    if (Object.keys(found).length === 0) goToStep(step + 1);
    else focusFirstError(found, STEP_FIELDS[step]);
  };

  const startOver = () => {
    clearDraft();
    setForm(EMPTY);
    setErrors({});
    setStep(0);
    setRestored(false);
    push("Draft cleared.");
  };

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      push("Reference ID copied.", "success");
    } catch {
      push("Couldn't copy. Please select and copy the ID manually.", "error");
    }
  };

  const submit = async () => {
    const found = validate(form, 3);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstError(found, STEP_FIELDS[3]);
      return;
    }

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
        clearDraft();
        setReference(data.reference);
        setQueued(Boolean(data.queued));
        setSubmitted(true);
        topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      if (res.status === 403) {
        void loadCycle(); // closed while the form was open: show the closed state
        setServerError(data?.error || "Applications are not being accepted right now.");
      } else if (res.status === 409) {
        setErrors({ email: data?.error || "An application with this email already exists." });
        goToStep(0);
        window.setTimeout(() => document.getElementById("email")?.focus(), 0);
      } else if (res.status === 429) {
        const wait = Number(res.headers.get("Retry-After"));
        setServerError(
          `${data?.error || "Too many attempts."}${Number.isFinite(wait) && wait > 0 ? ` Try again in about ${Math.ceil(wait / 60)} minute(s).` : ""}`
        );
      } else if (data?.fieldErrors) {
        const fe = data.fieldErrors as Record<string, string[]>;
        const mapped: Partial<Record<Field, string>> = {};
        for (const key of Object.keys(fe)) mapped[key as Field] = fe[key][0];
        const firstStep = STEP_FIELDS.findIndex((fields) => fields.some((f) => mapped[f]));
        setErrors(mapped);
        if (firstStep >= 0 && firstStep !== 3) {
          goToStep(firstStep);
          focusFirstError(mapped, STEP_FIELDS[firstStep]);
        }
        setServerError(data.error || "Please check the highlighted fields.");
      } else {
        setServerError(data?.error || "Something went wrong. Please try again.");
      }
    } catch {
      setServerError("Network error. Please check your connection and try again. Your answers are still here.");
      push("You appear to be offline.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- states other than the form
  if (submitted) {
    return (
      <>
        <div ref={topRef} className="scroll-mt-24" />
        <div className="glass-card p-8 sm:p-14 text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
          </div>
          <div className="space-y-3" role="status">
            <h2 ref={headingRef} tabIndex={-1} className="text-2xl sm:text-3xl font-bold text-white outline-none">Application Received!</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Thank you for applying to Andropedia, <span className="text-emerald-400 font-semibold">{form.name}</span>.
              Our <span className="text-emerald-400 font-semibold">{domain?.name}</span> domain leads will review it.
              {queued
                ? " Your application is safely saved; your confirmation email may take a little longer than usual. "
                : " We've emailed a confirmation to "}
              {!queued && <span className="text-emerald-400 font-semibold break-all">{form.email}</span>}
              {!queued && ". "}
              Shortlisted candidates will be contacted by email.
            </p>
            <p className="text-xs font-mono text-slate-400 flex items-center justify-center gap-2 flex-wrap">
              Reference ID: <span className="text-emerald-300 select-all">{reference}</span>
              <button type="button" onClick={copyReference} className={`inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-slate-300 hover:text-white ${ring}`}>
                <Copy className="w-3 h-3" aria-hidden="true" /> Copy
              </button>
            </p>
          </div>
          <Link href="/" className={`btn-glass ${ring}`}>
            Back to home
          </Link>
        </div>
        <ToastRegion toasts={toasts} onDismiss={dismiss} />
      </>
    );
  }

  if (cycle && cycle.state !== "open") {
    return <ClosedPanel cycle={cycle} />;
  }

  // ---- the multi-step form
  const err = (f: Field) => errors[f];
  const a11y = (f: Field, id: string, extra?: string) => ({
    id,
    "aria-invalid": err(f) ? (true as const) : undefined,
    "aria-describedby": [err(f) ? `${id}-error` : "", extra ?? ""].filter(Boolean).join(" ") || undefined,
  });
  const counter = (v: string, max: number) => (
    <span className="text-[10px] font-mono text-slate-400 ml-auto" aria-hidden="true">{v.length}/{max}</span>
  );

  return (
    <>
      <div ref={topRef} className="scroll-mt-24" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 3) handleNext(); // Enter in a field moves on instead of submitting early
          else void submit();
        }}
        noValidate
        className="glass-card p-5 sm:p-12 space-y-8"
      >
        {cycle && <CycleBanner cycle={cycle} daysLeft={daysLeft} />}

        {restored && (
          <p className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-400/30 bg-sky-500/5 px-4 py-3 text-xs sm:text-sm text-sky-100">
            <span>We saved your progress on this device and restored it.</span>
            <button type="button" onClick={startOver} className={`underline underline-offset-2 hover:text-white rounded ${ring}`}>
              Start over
            </button>
          </p>
        )}

        <ol className="flex items-center gap-2 sm:gap-3" aria-label="Application progress">
          {STEPS.map((label, i) => (
            <li key={label} className="flex-1 space-y-2" aria-current={i === step ? "step" : undefined}>
              <div className={`h-1.5 rounded-full transition-colors ${i <= step ? "bg-emerald-400" : "bg-white/10"}`} />
              <span className={`block text-[10px] sm:text-xs font-mono uppercase tracking-wider ${i === step ? "text-emerald-300" : "text-slate-400"}`}>
                <span className="sr-only">Step {i + 1} of 4: </span>
                <span className="hidden sm:inline" aria-hidden="true">{i + 1}. </span>{label}
              </span>
            </li>
          ))}
        </ol>

        {serverError && (
          <p role="alert" className="rounded-xl border border-rose-500/35 bg-rose-500/10 p-3 text-xs sm:text-sm text-rose-200">
            {serverError}
          </p>
        )}

        {step === 0 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-white outline-none">Your details</h2>
              <p className="text-xs text-slate-400">Use an email you check often: your confirmation and updates go there. One application per email.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className={labelClass}>Full Name *</label>
                <input {...a11y("name", "name")} aria-required="true" type="text" autoComplete="name" enterKeyHint="next" placeholder="e.g. Maya Nair"
                  value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
                <FieldError id="name" message={err("name")} />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className={labelClass}>College Email *</label>
                <input {...a11y("email", "email")} aria-required="true" type="email" inputMode="email" autoComplete="email" enterKeyHint="next" placeholder="name@student.college.edu"
                  value={form.email} onChange={(e) => set("email", e.target.value)} className={inputClass} />
                <FieldError id="email" message={err("email")} />
              </div>
              <div className="space-y-2">
                <label htmlFor="year" className={labelClass}>Academic Year *</label>
                <select {...a11y("year", "year")} value={form.year} onChange={(e) => set("year", e.target.value)} className={inputClass}>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y === "other" ? "Other" : `${YEAR_LABELS[y]} (${{ first: "Freshman", second: "Sophomore", third: "Junior", fourth: "Senior" }[y]})`}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="portfolio" className={labelClass}>GitHub / Portfolio link</label>
                <input {...a11y("portfolioUrl", "portfolio")} type="url" inputMode="url" autoComplete="url" enterKeyHint="next" placeholder="https://github.com/yourhandle"
                  value={form.portfolioUrl} onChange={(e) => set("portfolioUrl", e.target.value)} className={inputClass} />
                <FieldError id="portfolio" message={err("portfolioUrl")} />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <fieldset className="space-y-6">
            <legend className="sr-only">Choose your domain</legend>
            <div className="border-b border-white/10 pb-4">
              <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-white outline-none">Choose your domain</h2>
              <p className="text-xs text-slate-400">Pick the track you most want to be evaluated in. You can still collaborate across domains later.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {RECRUIT_DOMAINS.map((d) => (
                <label
                  key={d.id}
                  htmlFor={`domain-${d.id}`}
                  style={accentVars(DOMAIN_ACCENT[ID_TO_DOMAIN[d.id]])}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between focus-within:ring-2 focus-within:ring-emerald-400/70 ${
                    form.domain === d.id
                      ? "border-[var(--a1)] bg-[var(--a1-soft)] text-white shadow-[0_0_28px_var(--a1-soft)]"
                      : "bg-black/30 border-white/10 text-slate-400 hover:border-[var(--a1-line)]"
                  }`}
                >
                  <span className="flex items-center justify-between mb-1">
                    <span className="text-accent text-sm font-semibold">{d.name}</span>
                    <input
                      id={`domain-${d.id}`} type="radio" name="domain" value={d.id} checked={form.domain === d.id}
                      aria-describedby={err("domain") ? "domain-error" : undefined}
                      onChange={() => set("domain", d.id)} className="accent-emerald-500 h-4 w-4"
                    />
                  </span>
                  <span className="text-[11px] text-slate-300 leading-snug">{d.desc}</span>
                </label>
              ))}
            </div>
            <FieldError id="domain" message={err("domain")} />
          </fieldset>
        )}

        {step === 2 && domain && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-white outline-none">Your answers</h2>
              <p className="text-xs text-slate-400">Be specific and honest. We read every answer. Your progress is saved on this device as you type.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="domainAnswer" className={labelClass}>{domain.name} question *</label>
              <p id="domainAnswer-hint" className="text-sm text-slate-200">{domain.question}</p>
              <textarea {...a11y("domainAnswer", "domainAnswer", "domainAnswer-hint")} aria-required="true" rows={4} maxLength={800} placeholder={domain.placeholder}
                value={form.domainAnswer} onChange={(e) => set("domainAnswer", e.target.value)} className={inputClass} />
              <div className="flex"><FieldError id="domainAnswer" message={err("domainAnswer")} />{counter(form.domainAnswer, 800)}</div>
            </div>
            <div className="space-y-2">
              <label htmlFor="skills" className={labelClass}>Relevant experience or prior projects *</label>
              <textarea {...a11y("skills", "skills")} aria-required="true" rows={3} maxLength={800} placeholder="Technologies, frameworks, competitions or past projects..."
                value={form.skills} onChange={(e) => set("skills", e.target.value)} className={inputClass} />
              <div className="flex"><FieldError id="skills" message={err("skills")} />{counter(form.skills, 800)}</div>
            </div>
            <div className="space-y-2">
              <label htmlFor="motivation" className={labelClass}>Why do you want to join Andropedia? *</label>
              <textarea {...a11y("motivation", "motivation")} aria-required="true" rows={4} maxLength={1200} placeholder="What excites you about our weekly sprints, culture and club projects?"
                value={form.motivation} onChange={(e) => set("motivation", e.target.value)} className={inputClass} />
              <div className="flex"><FieldError id="motivation" message={err("motivation")} />{counter(form.motivation, 1200)}</div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-white outline-none">Review &amp; submit</h2>
              <p className="text-xs text-slate-400">Check everything. Only one application is allowed per email, so make it count.</p>
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
                  <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{k}</dt>
                  <dd className="text-slate-200 break-words">{v}</dd>
                </div>
              ))}
              {[
                [domain?.question ?? "Domain question", form.domainAnswer],
                ["Experience", form.skills],
                ["Why Andropedia", form.motivation],
              ].map(([k, v]) => (
                <div key={k} className="sm:col-span-2">
                  <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{k}</dt>
                  <dd className="text-slate-200 whitespace-pre-wrap break-words">{v}</dd>
                </div>
              ))}
            </dl>

            {/* Honeypot: hidden from people and screen readers, bots tend to fill it */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
              value={form.website} onChange={(e) => set("website", e.target.value)} className="hidden" />

            <div className="space-y-2">
              <label className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed cursor-pointer">
                <input {...a11y("consent", "consent")} aria-required="true" type="checkbox" checked={form.consent}
                  onChange={(e) => set("consent", e.target.checked)} className={`mt-1 h-4 w-4 accent-emerald-500 ${ring}`} />
                <span>I agree that Andropedia may store my application details and contact me by email about my application. *</span>
              </label>
              <FieldError id="consent" message={err("consent")} />
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          {step > 0 ? (
            <button type="button" onClick={() => goToStep(step - 1)}
              className={`btn-glass !py-3 w-full sm:w-auto ${ring}`}>
              <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
            </button>
          ) : <span className="hidden sm:block" />}

          {step < 3 ? (
            <button type="submit" className={primaryBtn}>
              Continue <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <button type="submit" disabled={submitting} data-cursor-text="Apply" className={primaryBtn}>
              <Send className="w-4 h-4" aria-hidden="true" />
              {submitting ? "Submitting..." : "Submit application"}
            </button>
          )}
        </div>
      </form>
      <ToastRegion toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
