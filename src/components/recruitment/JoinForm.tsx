"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, Copy, Lock, Send } from "lucide-react";
import { RECRUIT_DOMAINS } from "@/content/recruitment";
import { ToastRegion, useToasts } from "@/components/ui/Toast";
import { DOMAIN_ACCENT, accentVars } from "@/content/accents";
import type { DomainType } from "@/lib/types";
import {
  ALL_QUESTION_IDS,
  DOMAIN_IDS,
  DOMAIN_QUESTIONS,
  OTHER,
  OTHER_PREFIX,
  UNIVERSAL_QUESTIONS,
  validateAnswers,
  type DomainId,
  type Question,
} from "@/lib/recruitment/questions";

const ID_TO_DOMAIN: Record<DomainId, DomainType> = { technical: "Technical", web: "Web", design: "Design", media: "Media", pr: "PR" };

type Answer = string | string[];

interface FormData {
  name: string;
  registerNo: string;
  department: string;
  year: string;
  phone: string;
  email: string;
  profile: string;
  domain: DomainId | "";
  /** Raw answers by question id. For a choice with "Other" picked, the value is "Other" and the text is in `other`. */
  answers: Record<string, Answer>;
  other: Record<string, string>;
  consent: boolean;
  website: string; // honeypot, hidden from real users
}

interface CycleInfo {
  state: "open" | "upcoming" | "closed";
  opensAt: string | null;
  closesAt: string | null;
  message: string;
}

const STEPS = ["Basics", "Vibe check", "Choose domain", "Domain round", "Review"];
const LAST_STEP = STEPS.length - 1;
const BASIC_KEYS = ["name", "registerNo", "department", "year", "phone", "email", "profile"] as const;
const YEARS = ["first", "second", "third", "fourth", "other"];
const YEAR_LABELS: Record<string, string> = {
  first: "1st Year", second: "2nd Year", third: "3rd Year", fourth: "4th Year", other: "Other",
};

const ALL_QUESTIONS: Question[] = [...UNIVERSAL_QUESTIONS, ...DOMAIN_IDS.flatMap((d) => DOMAIN_QUESTIONS[d])];
const QUESTION_BY_ID = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));
const UNIVERSAL_IDS = new Set(UNIVERSAL_QUESTIONS.map((q) => q.id));

const domainQuestions = (d: DomainId | "") => (d ? DOMAIN_QUESTIONS[d] : []);

/** Fields shown on each step, in order (used to find the step and field of an error). */
function stepKeys(step: number, domain: DomainId | ""): string[] {
  if (step === 0) return [...BASIC_KEYS];
  if (step === 1) return UNIVERSAL_QUESTIONS.map((q) => q.id);
  if (step === 2) return ["domain"];
  if (step === 3) return domainQuestions(domain).map((q) => q.id);
  return ["consent"];
}

/** DOM id to focus for a field that has an error. */
function focusId(key: string): string {
  if (key === "domain") return `domain-${RECRUIT_DOMAINS[0].id}`;
  if (key === "consent") return "consent";
  const q = QUESTION_BY_ID.get(key);
  if (!q) return `f-${key}`;
  if (q.kind === "choice" || q.kind === "multi") return `q-${q.id}-0`;
  if (q.kind === "scale") return `q-${q.id}-${q.from}`;
  return `q-${q.id}`;
}

const EMPTY: FormData = {
  name: "", registerNo: "", department: "", year: "second", phone: "", email: "", profile: "",
  domain: "", answers: {}, other: {}, consent: false, website: "",
};

/** The answers as the server expects them: "Other" choices carry their text. */
function composeAnswers(f: FormData): Record<string, Answer> {
  const out: Record<string, Answer> = {};
  for (const [id, value] of Object.entries(f.answers)) {
    const q = QUESTION_BY_ID.get(id);
    out[id] = q?.kind === "choice" && q.other && value === OTHER ? `${OTHER_PREFIX}${(f.other[id] ?? "").trim()}` : value;
  }
  return out;
}

// ---------------------------------------------------------------- draft autosave
const DRAFT_KEY = "andropedia_recruitment_draft_v2";
const DRAFT_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
interface Draft { form: FormData; step: number }

function loadDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (d?.v !== 2 || typeof d.savedAt !== "number" || Date.now() - d.savedAt > DRAFT_MAX_AGE_MS) return null;
    const f = d.form ?? {};
    const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
    const answers: Record<string, Answer> = {};
    const other: Record<string, string> = {};
    for (const id of ALL_QUESTION_IDS) {
      const v = f.answers?.[id];
      if (typeof v === "string") answers[id] = v.slice(0, 1200);
      else if (Array.isArray(v)) answers[id] = v.filter((x: unknown) => typeof x === "string").slice(0, 10);
      if (typeof f.other?.[id] === "string") other[id] = f.other[id].slice(0, 200);
    }
    const domain: FormData["domain"] = DOMAIN_IDS.includes(f.domain) ? f.domain : "";
    // Keep only the chosen domain's answers, so a restored draft can never carry two domains.
    const allowed = new Set([...UNIVERSAL_IDS, ...domainQuestions(domain).map((q) => q.id)]);
    for (const id of Object.keys(answers)) {
      if (!allowed.has(id)) {
        delete answers[id];
        delete other[id];
      }
    }
    const form: FormData = {
      name: str(f.name, 80),
      registerNo: str(f.registerNo, 30),
      department: str(f.department, 60),
      year: YEARS.includes(f.year) ? f.year : "second",
      phone: str(f.phone, 20),
      email: str(f.email, 160),
      profile: str(f.profile, 300),
      domain,
      answers,
      other,
      consent: false, // consent is always asked again
      website: "",
    };
    const filled = form.name || form.email || form.domain || Object.keys(answers).length > 0;
    if (!filled) return null;
    const step = Number.isInteger(d.step) ? Math.min(Math.max(d.step, 0), LAST_STEP - 1) : 0;
    return { form, step: step >= 3 && !form.domain ? 2 : step };
  } catch {
    return null; // storage unavailable or corrupt: just start fresh
  }
}

function saveDraft(form: FormData, step: number) {
  try {
    const { consent, website, ...rest } = form;
    void consent; void website;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ v: 2, savedAt: Date.now(), step, form: rest }));
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
type Errors = Record<string, string | undefined>;

function validate(f: FormData, step: number): Errors {
  const e: Errors = {};
  const len = (v: string) => v.trim().length;
  if (step === 0) {
    const digits = f.phone.replace(/\D/g, "").length;
    if (len(f.name) < 2) e.name = "Enter your full name.";
    if (len(f.registerNo) < 3) e.registerNo = "Enter your register / roll number.";
    if (len(f.department) < 2) e.department = "Enter your department.";
    if (!/^\+?[\d\s\-()]{10,20}$/.test(f.phone.trim()) || digits < 10 || digits > 15) e.phone = "Enter a valid phone / WhatsApp number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Enter a valid email address.";
    if (len(f.profile) < 3) e.profile = "Share a LinkedIn, GitHub or Instagram link or handle.";
  }
  if (step === 1) Object.assign(e, validateAnswers("technical", composeAnswers(f), "universal").errors);
  if (step === 2 && !f.domain) e.domain = "Choose the domain you want to join.";
  if (step === 3 && f.domain) Object.assign(e, validateAnswers(f.domain, composeAnswers(f), "domain").errors);
  if (step === 4 && !f.consent) e.consent = "Consent is required to submit.";
  return e;
}

// ---------------------------------------------------------------- shared bits
const ring = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70";
const inputClass = `w-full px-4 py-3 bg-black/40 border border-white/15 rounded-xl text-base sm:text-sm text-white placeholder:text-white/40 shadow-[inset_0_0_30px_rgba(204,215,255,0.06)] focus:outline-none focus:border-emerald-400 aria-[invalid=true]:border-rose-400/70 transition-colors ${ring}`;
const labelClass = "text-xs font-mono text-slate-300 uppercase tracking-wider";
const questionClass = "text-sm font-medium text-slate-100 leading-snug";
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

// ---------------------------------------------------------------- one question
interface QuestionFieldProps {
  q: Question;
  value: Answer | undefined;
  otherText: string;
  error?: string;
  onChange: (value: Answer) => void;
  onOtherText: (text: string) => void;
}

function QuestionField({ q, value, otherText, error, onChange, onOtherText }: QuestionFieldProps) {
  const id = `q-${q.id}`;
  const star = q.required ? " *" : "";
  const describedBy = [error ? `${id}-error` : "", q.hint ? `${id}-hint` : ""].filter(Boolean).join(" ") || undefined;
  const text = typeof value === "string" ? value : "";

  const heading = (htmlFor?: string) => (
    <>
      {htmlFor ? (
        <label htmlFor={htmlFor} className={questionClass}>{q.label}{star}</label>
      ) : (
        <legend className={questionClass}>{q.label}{star}</legend>
      )}
      {q.hint && <p id={`${id}-hint`} className="text-xs text-slate-400">{q.hint}</p>}
    </>
  );

  if (q.kind === "text" || q.kind === "textarea" || q.kind === "url") {
    const common = {
      id,
      "aria-required": q.required || undefined,
      "aria-invalid": error ? (true as const) : undefined,
      "aria-describedby": describedBy,
      maxLength: q.maxLen,
      value: text,
      className: inputClass,
      placeholder: "placeholder" in q ? q.placeholder : undefined,
    };
    return (
      <div className="space-y-2">
        {heading(id)}
        {q.kind === "textarea" ? (
          <textarea {...common} rows={q.maxLen > 500 ? 4 : 3} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input {...common} type={q.kind === "url" ? "url" : "text"} inputMode={q.kind === "url" ? "url" : undefined}
            onChange={(e) => onChange(e.target.value)} />
        )}
        <div className="flex">
          <FieldError id={id} message={error} />
          {q.kind === "textarea" && (
            <span className="text-[10px] font-mono text-slate-400 ml-auto" aria-hidden="true">{text.length}/{q.maxLen}</span>
          )}
        </div>
      </div>
    );
  }

  if (q.kind === "choice") {
    const options = q.other ? [...q.options, OTHER] : q.options;
    return (
      <fieldset className="space-y-2" aria-describedby={describedBy}>
        {heading()}
        <div className="grid gap-2">
          {options.map((opt, i) => {
            const checked = value === opt;
            return (
              <label key={opt}
                className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-emerald-400/70 ${
                  checked ? "border-emerald-400/70 bg-emerald-500/10 text-white" : "border-white/10 bg-black/30 text-slate-300 hover:border-white/25"
                }`}>
                <input id={`${id}-${i}`} type="radio" name={id} value={opt} checked={checked}
                  onChange={() => onChange(opt)} className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-500" />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
        {q.other && value === OTHER && (
          <input type="text" maxLength={200} value={otherText} aria-label={`${q.label} (other)`} placeholder="Tell us in a few words"
            aria-invalid={error ? true : undefined} onChange={(e) => onOtherText(e.target.value)} className={inputClass} />
        )}
        <FieldError id={id} message={error} />
      </fieldset>
    );
  }

  if (q.kind === "multi") {
    const picked = Array.isArray(value) ? value : [];
    return (
      <fieldset className="space-y-2" aria-describedby={describedBy}>
        {heading()}
        <div className="grid gap-2">
          {q.options.map((opt, i) => {
            const checked = picked.includes(opt);
            return (
              <label key={opt}
                className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-emerald-400/70 ${
                  checked ? "border-emerald-400/70 bg-emerald-500/10 text-white" : "border-white/10 bg-black/30 text-slate-300 hover:border-white/25"
                }`}>
                <input id={`${id}-${i}`} type="checkbox" checked={checked}
                  onChange={() => onChange(checked ? picked.filter((p) => p !== opt) : [...picked, opt])}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-500" />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
        <FieldError id={id} message={error} />
      </fieldset>
    );
  }

  // scale
  const steps = Array.from({ length: q.to - q.from + 1 }, (_, i) => q.from + i);
  return (
    <fieldset className="space-y-2" aria-describedby={describedBy}>
      {heading()}
      <div className="flex flex-wrap gap-2">
        {steps.map((n) => {
          const checked = text === String(n);
          return (
            <label key={n}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-emerald-400/70 ${
                checked ? "border-emerald-400/70 bg-emerald-500/20 text-white" : "border-white/10 bg-black/30 text-slate-300 hover:border-white/25"
              }`}>
              <input id={`${id}-${n}`} type="radio" name={id} value={n} checked={checked} aria-label={`${n} of ${q.to}`}
                onChange={() => onChange(String(n))} className="sr-only" />
              <span aria-hidden="true">{n}</span>
            </label>
          );
        })}
      </div>
      <p className="flex justify-between gap-4 text-[11px] text-slate-400">
        <span>{q.from}: {q.lowLabel}</span>
        <span className="text-right">{q.to}: {q.highLabel}</span>
      </p>
      <FieldError id={id} message={error} />
    </fieldset>
  );
}

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
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [reference, setReference] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [cycle, setCycle] = useState<CycleInfo | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const { toasts, push, dismiss } = useToasts(initialDraft ? ["Draft restored. Pick up where you left off."] : []);

  const topRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const domain = RECRUIT_DOMAINS.find((d) => d.id === form.domain);
  const questionsForDomain = domainQuestions(form.domain);

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

  const clearError = (key: string) => setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    clearError(key);
  };
  const setAnswer = (id: string, value: Answer) => {
    setForm((prev) => ({ ...prev, answers: { ...prev.answers, [id]: value } }));
    clearError(id);
  };
  const setOther = (id: string, text: string) => {
    setForm((prev) => ({ ...prev, other: { ...prev.other, [id]: text } }));
    clearError(id);
  };

  // Only one domain per application: switching domain drops the previous domain's answers.
  const chooseDomain = (id: DomainId) => {
    setForm((prev) => {
      if (prev.domain === id) return prev;
      const keep = (rec: Record<string, never> | Record<string, unknown>) =>
        Object.fromEntries(Object.entries(rec).filter(([k]) => UNIVERSAL_IDS.has(k)));
      return { ...prev, domain: id, answers: keep(prev.answers) as FormData["answers"], other: keep(prev.other) as FormData["other"] };
    });
    clearError("domain");
  };

  const goToStep = (next: number) => {
    setStep(next);
    setServerError("");
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const focusFirstError = (found: Errors, keys: string[]) => {
    const first = keys.find((k) => found[k]);
    if (first) window.setTimeout(() => document.getElementById(focusId(first))?.focus(), 0);
  };

  const handleNext = () => {
    const found = validate(form, step);
    setErrors(found);
    if (Object.keys(found).length === 0) goToStep(step + 1);
    else focusFirstError(found, stepKeys(step, form.domain));
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
    const found = validate(form, LAST_STEP);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstError(found, stepKeys(LAST_STEP, form.domain));
      return;
    }
    if (!form.domain) return;

    // Send the universal answers plus the chosen domain's only, as typed (multi-selects stay lists).
    const allowed = new Set([...UNIVERSAL_IDS, ...domainQuestions(form.domain).map((q) => q.id)]);
    const answers = Object.fromEntries(Object.entries(composeAnswers(form)).filter(([id]) => allowed.has(id)));

    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          registerNo: form.registerNo,
          department: form.department,
          year: form.year,
          phone: form.phone,
          email: form.email,
          profile: form.profile,
          domain: form.domain,
          answers,
          consent: form.consent,
          website: form.website,
        }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        clearDraft();
        setReference(data.reference);
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
        window.setTimeout(() => document.getElementById("f-email")?.focus(), 0);
      } else if (res.status === 429) {
        const wait = Number(res.headers.get("Retry-After"));
        setServerError(
          `${data?.error || "Too many attempts."}${Number.isFinite(wait) && wait > 0 ? ` Try again in about ${Math.ceil(wait / 60)} minute(s).` : ""}`
        );
      } else if (data?.fieldErrors) {
        const fe = data.fieldErrors as Record<string, string[]>;
        const mapped: Errors = {};
        for (const key of Object.keys(fe)) mapped[key] = fe[key][0];
        const firstStep = [0, 1, 2, 3].find((s) => stepKeys(s, form.domain).some((k) => mapped[k]));
        setErrors(mapped);
        if (firstStep !== undefined) {
          goToStep(firstStep);
          focusFirstError(mapped, stepKeys(firstStep, form.domain));
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
              {" "}We&apos;re sending a confirmation email to{" "}
              <span className="text-emerald-400 font-semibold break-all">{form.email}</span>. It usually arrives within a minute;
              if you don&apos;t see it, check your spam folder and keep the reference ID below.{" "}
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
  const err = (key: string) => errors[key];
  const a11y = (key: string, id: string) => ({
    id,
    "aria-invalid": err(key) ? (true as const) : undefined,
    "aria-describedby": err(key) ? `${id}-error` : undefined,
  });
  const renderQuestion = (q: Question) => {
    const v = form.answers[q.id];
    return (
      <QuestionField key={q.id} q={q} value={v} otherText={form.other[q.id] ?? ""} error={err(q.id)}
        onChange={(value) => setAnswer(q.id, value)} onOtherText={(text) => setOther(q.id, text)} />
    );
  };
  const answerText = (q: Question) => {
    const v = composeAnswers(form)[q.id];
    const text = Array.isArray(v) ? v.join(", ") : (v ?? "");
    return text || "Not answered";
  };

  return (
    <>
      <div ref={topRef} className="scroll-mt-24" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step < LAST_STEP) handleNext(); // Enter in a field moves on instead of submitting early
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
                <span className="sr-only">Step {i + 1} of {STEPS.length}: </span>
                <span className="hidden sm:inline" aria-hidden="true">{i + 1}. </span>
                <span className={i === step ? "" : "hidden sm:inline"}>{label}</span>
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
              <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-white outline-none">The basic bureaucracy</h2>
              <p className="text-xs text-slate-400">Fill this out before your Wi-Fi cuts out. One application per email.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="f-name" className={labelClass}>Full Name *</label>
                <input {...a11y("name", "f-name")} aria-required="true" type="text" autoComplete="name" enterKeyHint="next" placeholder="The one on your ID card, not your gamer tag"
                  value={form.name} onChange={(e) => setField("name", e.target.value)} className={inputClass} />
                <FieldError id="f-name" message={err("name")} />
              </div>
              <div className="space-y-2">
                <label htmlFor="f-registerNo" className={labelClass}>Register / Roll Number *</label>
                <input {...a11y("registerNo", "f-registerNo")} aria-required="true" type="text" autoComplete="off" enterKeyHint="next" placeholder="e.g. RA2511026020025"
                  value={form.registerNo} onChange={(e) => setField("registerNo", e.target.value)} className={inputClass} />
                <FieldError id="f-registerNo" message={err("registerNo")} />
              </div>
              <div className="space-y-2">
                <label htmlFor="f-department" className={labelClass}>Department &amp; Section *</label>
                <input {...a11y("department", "f-department")} aria-required="true" type="text" autoComplete="off" enterKeyHint="next" placeholder="e.g. CSE AIML A"
                  value={form.department} onChange={(e) => setField("department", e.target.value)} className={inputClass} />
                <FieldError id="f-department" message={err("department")} />
              </div>
              <div className="space-y-2">
                <label htmlFor="f-year" className={labelClass}>Year *</label>
                <select {...a11y("year", "f-year")} value={form.year} onChange={(e) => setField("year", e.target.value)} className={inputClass}>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{YEAR_LABELS[y]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="f-phone" className={labelClass}>Phone / WhatsApp Number *</label>
                <input {...a11y("phone", "f-phone")} aria-required="true" type="tel" inputMode="tel" autoComplete="tel" enterKeyHint="next" placeholder="The one you actually check at midnight"
                  value={form.phone} onChange={(e) => setField("phone", e.target.value)} className={inputClass} />
                <FieldError id="f-phone" message={err("phone")} />
              </div>
              <div className="space-y-2">
                <label htmlFor="f-email" className={labelClass}>Email Address *</label>
                <input {...a11y("email", "f-email")} aria-required="true" type="email" inputMode="email" autoComplete="email" enterKeyHint="next" placeholder="Ideally not the inbox drowning in circulars"
                  value={form.email} onChange={(e) => setField("email", e.target.value)} className={inputClass} />
                <FieldError id="f-email" message={err("email")} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="f-profile" className={labelClass}>LinkedIn / GitHub / Instagram *</label>
                <input {...a11y("profile", "f-profile")} aria-required="true" type="text" autoComplete="off" enterKeyHint="next" placeholder="Drop whichever shows off your best side; we will stalk it"
                  value={form.profile} onChange={(e) => setField("profile", e.target.value)} className={inputClass} />
                <FieldError id="f-profile" message={err("profile")} />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-white outline-none">Universal vibe check</h2>
              <p className="text-xs text-slate-400">Everyone answers these. There are no wrong answers, only revealing ones.</p>
            </div>
            {UNIVERSAL_QUESTIONS.map(renderQuestion)}
          </div>
        )}

        {step === 2 && (
          <fieldset className="space-y-6">
            <legend className="sr-only">Choose your domain</legend>
            <div className="border-b border-white/10 pb-4">
              <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-white outline-none">Choose your domain</h2>
              <p className="text-xs text-slate-400">Pick exactly one. It decides the questions you answer next, and the track you are evaluated in.</p>
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
                      onChange={() => chooseDomain(d.id)} className="accent-emerald-500 h-4 w-4"
                    />
                  </span>
                  <span className="text-[11px] text-slate-300 leading-snug">{d.desc}</span>
                </label>
              ))}
            </div>
            <FieldError id="domain" message={err("domain")} />
          </fieldset>
        )}

        {step === 3 && domain && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-white outline-none">{domain.name} round</h2>
              <p className="text-xs text-slate-400">Be specific and honest. We read every answer. Your progress is saved on this device as you go.</p>
            </div>
            {questionsForDomain.map(renderQuestion)}
          </div>
        )}

        {step === LAST_STEP && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-white outline-none">Review &amp; submit</h2>
              <p className="text-xs text-slate-400">Check everything. Only one application is allowed per email, so make it count.</p>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              {[
                ["Name", form.name],
                ["Register no.", form.registerNo],
                ["Department", form.department],
                ["Year", YEAR_LABELS[form.year]],
                ["Phone", form.phone],
                ["Email", form.email],
                ["Profile", form.profile],
                ["Domain", domain?.name ?? ""],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{k}</dt>
                  <dd className="text-slate-200 break-words">{v}</dd>
                </div>
              ))}
              {[...UNIVERSAL_QUESTIONS, ...questionsForDomain].map((q) => (
                <div key={q.id} className="sm:col-span-2">
                  <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{q.label}</dt>
                  <dd className="text-slate-200 whitespace-pre-wrap break-words">{answerText(q)}</dd>
                </div>
              ))}
            </dl>

            {/* Honeypot: hidden from people and screen readers, bots tend to fill it */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
              value={form.website} onChange={(e) => setField("website", e.target.value)} className="hidden" />

            <div className="space-y-2">
              <label className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed cursor-pointer">
                <input {...a11y("consent", "consent")} aria-required="true" type="checkbox" checked={form.consent}
                  onChange={(e) => setField("consent", e.target.checked)} className={`mt-1 h-4 w-4 accent-emerald-500 ${ring}`} />
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

          {step < LAST_STEP ? (
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
