"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode, Ref } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, ArrowRight, CalendarClock, Copy, Lock, Pencil, Send, Trophy } from "lucide-react";
import { RECRUIT_DOMAINS } from "@/content/recruitment";
import { ToastRegion, useToasts } from "@/components/ui/Toast";
import { ACCENTS, DOMAIN_ACCENT, accentVars } from "@/content/accents";
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
import { GameBoard } from "./game/GameBoard";
import { AndySays, Mascot, type Mood } from "./game/Mascot";
import { PowerBar } from "./game/PowerBar";
import { StarterChips } from "./game/StarterChips";
import { XpChip } from "./game/XpChip";
import { fireConfetti } from "./game/confetti";
import { ANDY_CHEER, ANDY_HI, BONUS_XP, DEFAULT_STARTERS, DOMAIN_CLASS, LEVELS, LEVEL_XP, STARTERS } from "./game/config";

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

const LAST_STEP = LEVELS.length - 1;
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
const DRAFT_KEY_V1 = "andropedia_recruitment_draft_v1";
const DRAFT_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
interface Draft { form: FormData; step: number; reached: number }

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

/** An old v1 draft (name, email, year, portfolio link, domain). Its free-text answers no longer map to a question, so they are dropped. */
function loadV1Draft(): Draft | null {
  const raw = window.localStorage.getItem(DRAFT_KEY_V1);
  if (!raw) return null;
  const d = JSON.parse(raw);
  if (d?.v !== 1 || typeof d.savedAt !== "number" || Date.now() - d.savedAt > DRAFT_MAX_AGE_MS) return null;
  const f = d.form ?? {};
  const form: FormData = {
    ...EMPTY,
    name: str(f.name, 80),
    email: str(f.email, 160),
    year: YEARS.includes(f.year) ? f.year : "second",
    profile: str(f.portfolioUrl, 300),
    domain: DOMAIN_IDS.includes(f.domain) ? f.domain : "",
  };
  return form.name || form.email ? { form, step: 0, reached: 0 } : null;
}

function loadDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return loadV1Draft();
    const d = JSON.parse(raw);
    if (d?.v !== 2 || typeof d.savedAt !== "number" || Date.now() - d.savedAt > DRAFT_MAX_AGE_MS) return null;
    const f = d.form ?? {};
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
    const safeStep = step >= 3 && !form.domain ? 2 : step;
    // Drafts saved before levels existed have no `reached`: everything before the saved step counts as cleared.
    const savedReached = Number.isInteger(d.reached) ? Math.min(Math.max(d.reached, 0), LAST_STEP) : safeStep;
    const reached = Math.max(safeStep, form.domain ? savedReached : Math.min(savedReached, 2));
    return { form, step: safeStep, reached };
  } catch {
    return null; // storage unavailable or corrupt: just start fresh
  }
}

function saveDraft(form: FormData, step: number, reached: number) {
  try {
    const { consent, website, ...rest } = form;
    void consent; void website;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ v: 2, savedAt: Date.now(), step, reached, form: rest }));
  } catch {
    /* storage full or blocked: autosave is best-effort */
  }
}

function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
    window.localStorage.removeItem(DRAFT_KEY_V1);
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

/** Every level at once: what a submit checks, however the player got to the last screen. */
function validateAll(f: FormData): Errors {
  const e: Errors = {};
  for (let s = 0; s <= LAST_STEP; s++) Object.assign(e, validate(f, s));
  return e;
}

// ---------------------------------------------------------------- shared bits
const ring = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70";
const inputClass = `w-full px-4 py-3 bg-black/40 border border-white/15 rounded-xl text-base sm:text-sm text-white placeholder:text-white/40 shadow-[inset_0_0_30px_rgba(204,215,255,0.06)] focus:outline-none focus:border-[color:var(--a1,#3395ff)] aria-[invalid=true]:border-rose-400/70 transition-colors ${ring}`;
const labelClass = "text-xs font-mono text-slate-300 uppercase tracking-wider";
const questionClass = "text-sm font-medium text-slate-100 leading-snug";
const eyebrow = "font-mono text-[11px] uppercase tracking-[0.16em]";
const primaryBtn = `btn-glow w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed ${ring}`;
const tokenBase = `cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-emerald-400/70`;
const tokenOn = "border-[color:var(--a1)] bg-[var(--a1-soft)] text-white";
const tokenOff = "border-white/10 bg-black/30 text-slate-300 hover:border-[color:var(--a1-line)]";

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

function StepHeader({ level, title, blurb, headingRef }: { level: number; title: string; blurb: string; headingRef: Ref<HTMLHeadingElement> }) {
  return (
    <div className="space-y-3">
      <p className={`${eyebrow} text-a1`}>Level {level + 1} / {LEVELS.length}</p>
      <h2 ref={headingRef} tabIndex={-1} className="text-fade text-[30px] sm:text-[40px] font-medium leading-[1.05] tracking-[-1.2px] sm:tracking-[-2px] outline-none">
        {title}
      </h2>
      <p className="text-base leading-6 text-white/70">{blurb}</p>
    </div>
  );
}

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
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {htmlFor ? (
          <label htmlFor={htmlFor} className={questionClass}>{q.label}{star}</label>
        ) : (
          <legend className={questionClass}>{q.label}{star}</legend>
        )}
        {!q.required && <span className="chip-accent">Bonus +{BONUS_XP} XP</span>}
      </div>
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
    const min = q.kind === "textarea" ? q.min ?? 0 : 0;
    const used = text.trim().length;
    const pick = (starter: string) => {
      const next = (text.trim() ? text.replace(/\s*$/, " ") : "") + starter;
      onChange(next.slice(0, q.maxLen));
      requestAnimationFrame(() => {
        const el = document.getElementById(id) as HTMLTextAreaElement | null;
        el?.focus();
        el?.setSelectionRange(el.value.length, el.value.length);
      });
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
        {q.kind === "textarea" && min > 0 && <PowerBar length={used} min={min} />}
        {q.kind === "textarea" && used < Math.max(min, 1) && (
          <StarterChips starters={STARTERS[q.id] ?? DEFAULT_STARTERS} onPick={pick} label={`Sentence starters for: ${q.label}`} />
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
              <label key={opt} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${tokenBase} ${checked ? tokenOn : tokenOff}`}>
                <input id={`${id}-${i}`} type="radio" name={id} value={opt} checked={checked}
                  onChange={() => onChange(opt)} className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--a1,#3395ff)]" />
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
              <label key={opt} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${tokenBase} ${checked ? tokenOn : tokenOff}`}>
                <input id={`${id}-${i}`} type="checkbox" checked={checked}
                  onChange={() => onChange(checked ? picked.filter((p) => p !== opt) : [...picked, opt])}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--a1,#3395ff)]" />
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
            <label key={n} className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm ${tokenBase} ${checked ? tokenOn : tokenOff}`}>
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
  /** Furthest level reached. Every level before it is cleared and can be revisited. */
  const [reached, setReached] = useState(initialDraft?.reached ?? 0);
  /** The level Andy is cheering for, until the player changes something. */
  const [cheer, setCheer] = useState<number | null>(null);
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
  const prevStep = useRef(step);

  const domain = RECRUIT_DOMAINS.find((d) => d.id === form.domain);
  const questionsForDomain = domainQuestions(form.domain);
  const klass = form.domain ? DOMAIN_CLASS[form.domain] : null;
  const accent = klass ? DOMAIN_ACCENT[klass.type] : ACCENTS.blue;
  const initial = form.name.trim().charAt(0) || "?";

  // Cosmetic XP: a level's worth per cleared level, plus a bonus for each optional question answered.
  const bonusCount = [...UNIVERSAL_QUESTIONS, ...questionsForDomain].filter((q) => !q.required && String(form.answers[q.id] ?? "").trim()).length;
  const xp = (submitted ? LEVELS.length : reached) * LEVEL_XP + bonusCount * BONUS_XP;

  // Autosave (debounced). Not while showing the confirmation screen.
  useEffect(() => {
    if (submitted) return;
    const t = window.setTimeout(() => saveDraft(form, step, reached), 600);
    return () => window.clearTimeout(t);
  }, [form, step, reached, submitted]);

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

  // Move focus to the step heading whenever the step differs from the previous one.
  useEffect(() => {
    if (prevStep.current === step) return;
    prevStep.current = step;
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  // The success screen: big confetti once, and focus its heading.
  useEffect(() => {
    if (!submitted) return;
    headingRef.current?.focus({ preventScroll: true });
    void fireConfetti("big", [accent.a1, accent.a2, "#ffffff"]);
  }, [submitted, accent.a1, accent.a2]);

  const clearError = (key: string) => setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    clearError(key);
    setCheer(null);
  };
  const setAnswer = (id: string, value: Answer) => {
    setForm((prev) => ({ ...prev, answers: { ...prev.answers, [id]: value } }));
    clearError(id);
    setCheer(null);
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
    // A new class means a new round: the domain round is no longer cleared.
    if (form.domain !== id) setReached((r) => Math.min(r, 3));
    clearError("domain");
    setCheer(null);
  };

  const goToStep = (next: number, cheerLevel: number | null = null) => {
    setStep(next);
    setCheer(cheerLevel);
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
    if (Object.keys(found).length > 0) {
      focusFirstError(found, stepKeys(step, form.domain));
      return;
    }
    const next = step + 1;
    if (next > reached) {
      setReached(next);
      void fireConfetti("small", [accent.a1, accent.a2, "#ffffff"]);
    }
    goToStep(next, step);
  };

  const startOver = () => {
    clearDraft();
    setForm(EMPTY);
    setErrors({});
    setStep(0);
    setReached(0);
    setCheer(null);
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
    // Re-check every level, not just the last one, so nothing slips through a stale step.
    const found = validateAll(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const firstStep = [0, 1, 2, 3, 4].find((s) => stepKeys(s, form.domain).some((k) => found[k])) ?? LAST_STEP;
      if (firstStep !== step) goToStep(firstStep);
      focusFirstError(found, stepKeys(firstStep, form.domain));
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
        <div className="glass-card p-6 sm:p-14 text-center space-y-8 max-w-3xl mx-auto" style={accentVars(accent)}>
          <div className="max-w-xl mx-auto">
            <GameBoard current={LAST_STEP} reached={LAST_STEP} initial={initial} finished />
          </div>
          <div className="space-y-4" role="status">
            <div className="glass-inner w-16 h-16 !rounded-2xl flex items-center justify-center mx-auto" style={{ borderColor: "var(--a1-line)", boxShadow: "0 0 36px var(--a1-soft)" }}>
              <Trophy className="w-8 h-8 text-a1" aria-hidden="true" />
            </div>
            <p className={`${eyebrow} text-a1`}>Quest complete</p>
            <h2 ref={headingRef} tabIndex={-1} className="text-fade text-[34px] sm:text-[48px] font-medium leading-[1.05] tracking-[-1.2px] sm:tracking-[-2px] outline-none">
              Application received!
            </h2>
            <div className="flex justify-center"><XpChip xp={xp} /></div>
            <p className="text-base leading-6 text-white/70 max-w-xl mx-auto">
              Thank you for applying to Andropedia, <span className="text-a1 font-semibold">{form.name}</span>.
              Our <span className="text-a1 font-semibold">{domain?.name}</span> domain leads will review it.
              {" "}We&apos;re sending a confirmation email to{" "}
              <span className="text-a1 font-semibold break-all">{form.email}</span>. It usually arrives within a minute;
              if you don&apos;t see it, check your spam folder and keep the reference ID below.{" "}
              Shortlisted candidates will be contacted by email.
            </p>
            <p className="text-xs font-mono text-slate-400 flex items-center justify-center gap-2 flex-wrap">
              Reference ID: <span className="text-a1 select-all">{reference}</span>
              <button type="button" onClick={copyReference} className={`inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-slate-300 hover:text-white ${ring}`}>
                <Copy className="w-3 h-3" aria-hidden="true" /> Copy
              </button>
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Mascot mood="cheer" size={48} />
            <Link href="/" className={`btn-glass ${ring}`}>
              Back to home
            </Link>
          </div>
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

  // Andy reacts to what is on this level right now.
  const stepErrors = stepKeys(step, form.domain).filter((k) => errors[k]).length;
  const mood: Mood = stepErrors > 0 || serverError ? "oops" : cheer !== null && ANDY_CHEER[cheer] ? "cheer" : "hi";
  const andyText =
    mood === "oops"
      ? serverError
        ? "The server said no, but your answers are safe here. Fix what it flagged and try again."
        : `Oops! ${stepErrors === 1 ? "One thing needs" : `${stepErrors} things need`} a fix before the next level.`
      : mood === "cheer" && cheer !== null
        ? ANDY_CHEER[cheer]
        : step === 3 && klass
          ? `Boss round, ${klass.title}! Be specific, we read every word.`
          : ANDY_HI[step];

  const section = (title: string, level: number, children: ReactNode) => (
    <section className="space-y-3" aria-label={title}>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
        <h3 className={`${eyebrow} text-a1`}>{title}</h3>
        <button type="button" onClick={() => goToStep(level)} aria-label={`Edit ${title}`}
          className={`inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs text-slate-300 hover:text-white ${ring}`}>
          <Pencil className="w-3 h-3" aria-hidden="true" /> Edit
        </button>
      </div>
      {children}
    </section>
  );
  const row = (k: string, v: string, wide = false) => (
    <div key={k} className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{k}</dt>
      <dd className="text-slate-200 break-words whitespace-pre-wrap">{v}</dd>
    </div>
  );
  const rows = "grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm";

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
        style={accentVars(accent)}
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

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className={`${eyebrow} text-slate-400`}>
              Level {step + 1} of {LEVELS.length}<span className="hidden sm:inline"> · {LEVELS[step].label}</span>
            </p>
            <XpChip xp={xp} />
          </div>
          <GameBoard current={step} reached={reached} initial={initial} onSelect={(i) => goToStep(i)} />
          <AndySays mood={mood} message={andyText} />
        </div>

        {serverError && (
          <p role="alert" className="rounded-xl border border-rose-500/35 bg-rose-500/10 p-3 text-xs sm:text-sm text-rose-200">
            {serverError}
          </p>
        )}

        <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {step === 0 && (
            <div className="space-y-6">
              <StepHeader level={0} title="The basic bureaucracy" headingRef={headingRef}
                blurb="Fill this out before your Wi-Fi cuts out. One application per email." />
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
                <fieldset className="space-y-2">
                  <legend className={labelClass}>Year *</legend>
                  <div className="flex flex-wrap gap-2">
                    {YEARS.map((y, i) => {
                      const checked = form.year === y;
                      return (
                        <label key={y} className={`rounded-xl border px-4 py-2.5 text-sm ${tokenBase} ${checked ? tokenOn : tokenOff}`}>
                          <input id={i === 0 ? "f-year" : undefined} type="radio" name="year" value={y} checked={checked}
                            onChange={() => setField("year", y)} className="sr-only" />
                          {YEAR_LABELS[y]}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
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
              <StepHeader level={1} title="Universal vibe check" headingRef={headingRef}
                blurb="Everyone answers these. There are no wrong answers, only revealing ones." />
              {UNIVERSAL_QUESTIONS.map(renderQuestion)}
            </div>
          )}

          {step === 2 && (
            <fieldset className="space-y-6">
              <legend className="sr-only">Choose your domain</legend>
              <StepHeader level={2} title="Choose your class" headingRef={headingRef}
                blurb="Pick exactly one domain. It decides the questions you answer next, and the track you are evaluated in." />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {RECRUIT_DOMAINS.map((d) => {
                  const c = DOMAIN_CLASS[d.id];
                  const Icon = c.icon;
                  const on = form.domain === d.id;
                  return (
                    <label
                      key={d.id}
                      htmlFor={`domain-${d.id}`}
                      style={accentVars(DOMAIN_ACCENT[c.type])}
                      className={`glass-inner !rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-emerald-400/70 ${
                        on
                          ? "!border-[var(--a1)] bg-[var(--a1-soft)] shadow-[0_0_28px_var(--a1-soft)]"
                          : "hover:!border-[var(--a1-line)]"
                      }`}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border" style={{ borderColor: "var(--a1-line)", background: "var(--a1-soft)" }}>
                          <Icon className="h-5 w-5 text-a1" aria-hidden="true" />
                        </span>
                        <input
                          id={`domain-${d.id}`} type="radio" name="domain" value={d.id} checked={on}
                          aria-describedby={err("domain") ? "domain-error" : undefined}
                          onChange={() => chooseDomain(d.id)} className="mt-1 h-4 w-4 accent-[color:var(--a1)]"
                        />
                      </span>
                      <span className="space-y-1">
                        <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">{d.name}</span>
                        <span className="text-accent block text-xl font-medium leading-tight tracking-[-0.5px]">{c.title}</span>
                        <span className="block text-sm leading-5 text-slate-300">{c.tagline}</span>
                        <span className="block text-xs leading-5 text-slate-400">{d.desc}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <FieldError id="domain" message={err("domain")} />
            </fieldset>
          )}

          {step === 3 && domain && klass && (
            <div className="space-y-6">
              <StepHeader level={3} title={`${klass.title}: the ${domain.name} round`} headingRef={headingRef}
                blurb="Be specific and honest. We read every answer. Your progress is saved on this device as you go." />
              {questionsForDomain.map((q, i) => (
                <div key={q.id} className="glass-inner p-4 sm:p-6 space-y-3">
                  <p className={`${eyebrow} text-a1`}>Challenge {i + 1} / {questionsForDomain.length}</p>
                  {renderQuestion(q)}
                </div>
              ))}
            </div>
          )}

          {step === LAST_STEP && (
            <div className="space-y-6">
              <StepHeader level={4} title="Review your player card" headingRef={headingRef}
                blurb="Check everything. Only one application is allowed per email, so make it count." />

              <div className="glass-inner p-5 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--a1)] text-2xl font-bold uppercase text-black shadow-[0_0_24px_var(--a1-soft)]" aria-hidden="true">{initial}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-accent break-words text-2xl font-medium leading-[1.1] tracking-[-0.8px]">{form.name}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-2">
                      {klass && <span className="chip-accent"><klass.icon className="h-3 w-3" aria-hidden="true" />{klass.title}</span>}
                      <span className="chip-accent">{YEAR_LABELS[form.year]}</span>
                    </p>
                  </div>
                  <XpChip xp={xp} />
                </div>

                {section("Basics", 0, (
                  <dl className={rows}>
                    {row("Register no.", form.registerNo)}
                    {row("Department", form.department)}
                    {row("Phone", form.phone)}
                    {row("Email", form.email)}
                    {row("Profile", form.profile, true)}
                  </dl>
                ))}
                {section("Vibe check", 1, (
                  <dl className={rows}>{UNIVERSAL_QUESTIONS.map((q) => row(q.label, answerText(q), true))}</dl>
                ))}
                {section("Class", 2, (
                  <dl className={rows}>{row("Domain", `${domain?.name ?? ""}${klass ? ` · ${klass.title}` : ""}`, true)}</dl>
                ))}
                {section("Domain round", 3, (
                  <dl className={rows}>{questionsForDomain.map((q) => row(q.label, answerText(q), true))}</dl>
                ))}
              </div>

              {/* Honeypot: hidden from people and screen readers, bots tend to fill it */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                value={form.website} onChange={(e) => setField("website", e.target.value)} className="hidden" />

              <div className="glass-inner p-4 sm:p-6 space-y-3">
                <p className={`${eyebrow} text-a1`}>Player&apos;s pledge</p>
                <label className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed cursor-pointer">
                  <input {...a11y("consent", "consent")} aria-required="true" type="checkbox" checked={form.consent}
                    onChange={(e) => setField("consent", e.target.checked)} className={`mt-1 h-4 w-4 accent-[color:var(--a1)] ${ring}`} />
                  <span>I agree that Andropedia may store my application details and contact me by email about my application. *</span>
                </label>
                <FieldError id="consent" message={err("consent")} />
              </div>
            </div>
          )}
        </motion.div>

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
