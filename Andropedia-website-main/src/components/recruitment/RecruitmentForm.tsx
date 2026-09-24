"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { publicDomains } from "@/content/domains";

interface RecruitmentFormState {
  name: string;
  email: string;
  year: string;
  domain: string;
  skills: string;
  motivation: string;
  portfolioUrl: string;
  consent: boolean;
}

const initialState: RecruitmentFormState = {
  name: "",
  email: "",
  year: "",
  domain: "",
  skills: "",
  motivation: "",
  portfolioUrl: "",
  consent: false,
};

const fieldClassName = "min-h-12 w-full rounded-[var(--radius-control)] border border-[var(--color-line-light)] bg-paper-strong px-4 py-3 text-base text-text outline-none transition-colors placeholder:text-text-muted/70 focus:border-brand-blue focus:ring-2 focus:ring-[rgba(66,115,228,0.18)]";

export function RecruitmentForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");

  const update = <Key extends keyof RecruitmentFormState>(key: Key, value: RecruitmentFormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.domain) {
      setStatus("error");
      setMessage("Choose the domain you want to join.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Your application could not be submitted.");
      }

      setReference(result.reference);
      setStatus("success");
      setForm(initialState);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Your application could not be submitted.");
    }
  };

  if (status === "success") {
    return (
      <div className="border-y border-[var(--color-line-light)] py-12" role="status" aria-live="polite">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue text-white"><Check className="h-5 w-5" aria-hidden="true" /></span>
        <p className="type-label mt-8 text-brand-blue">Interest received</p>
        <h3 className="type-h3 mt-4 max-w-[18ch]">Thank you for introducing yourself.</h3>
        <p className="type-body mt-5 text-text-muted">Your recruitment reference is <strong className="font-semibold text-text">{reference}</strong>. Keep it for follow-up.</p>
        <button type="button" className="text-link mt-8 min-h-11" onClick={() => setStatus("idle")}>Submit another response <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate={false}>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="type-label text-text-muted">Full name</span>
          <input className={`${fieldClassName} mt-2`} name="name" autoComplete="name" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Your name" minLength={2} maxLength={80} required />
        </label>
        <label className="block">
          <span className="type-label text-text-muted">College email</span>
          <input className={`${fieldClassName} mt-2`} name="email" type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="name@college.edu" maxLength={160} required />
        </label>
      </div>

      <label className="block sm:max-w-sm">
        <span className="type-label text-text-muted">Year of study</span>
        <select className={`${fieldClassName} mt-2`} name="year" value={form.year} onChange={(event) => update("year", event.target.value)} required>
          <option value="" disabled>Select your year</option>
          <option value="first">First year</option>
          <option value="second">Second year</option>
          <option value="third">Third year</option>
          <option value="fourth">Fourth year</option>
          <option value="other">Other</option>
        </select>
      </label>

      <fieldset>
        <legend className="type-label text-text-muted">Primary domain</legend>
        <div className="mt-3 grid gap-px border border-[var(--color-line-light)] bg-[var(--color-line-light)] sm:grid-cols-2">
          {publicDomains.map((domain, index) => {
            const selected = form.domain === domain.id;
            return (
              <button
                key={domain.id}
                type="button"
                aria-pressed={selected}
                onClick={() => update("domain", domain.id)}
                className={`flex min-h-20 items-center justify-between gap-4 p-4 text-left transition-colors ${selected ? "bg-brand-blue text-white" : "bg-paper-strong text-text hover:bg-brand-blue-pale"}`}
              >
                <span><span className={`type-label mr-3 ${selected ? "text-white/75" : "text-text-muted"}`}>{String(index + 1).padStart(2, "0")}</span><span className="font-semibold">{domain.name}</span></span>
                {selected && <Check className="h-5 w-5 shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="block">
        <span className="type-label text-text-muted">Skills and interests</span>
        <textarea className={`${fieldClassName} mt-2 min-h-28 resize-y`} name="skills" value={form.skills} onChange={(event) => update("skills", event.target.value)} placeholder="Tell us what you are learning, making, researching, designing, documenting, or organising." minLength={20} maxLength={800} required />
      </label>

      <label className="block">
        <span className="type-label text-text-muted">Why Andropedia?</span>
        <textarea className={`${fieldClassName} mt-2 min-h-36 resize-y`} name="motivation" value={form.motivation} onChange={(event) => update("motivation", event.target.value)} placeholder="What would you like to learn, contribute, or build with the community?" minLength={40} maxLength={1200} required />
      </label>

      <label className="block">
        <span className="type-label text-text-muted">Portfolio or work link <span className="normal-case tracking-normal">(optional)</span></span>
        <input className={`${fieldClassName} mt-2`} name="portfolioUrl" type="url" inputMode="url" value={form.portfolioUrl} onChange={(event) => update("portfolioUrl", event.target.value)} placeholder="https://" maxLength={300} />
      </label>

      <label className="flex items-start gap-3 border-y border-[var(--color-line-light)] py-5 text-sm leading-relaxed text-text-muted">
        <input className="mt-1 h-4 w-4 accent-[var(--color-brand-blue)]" type="checkbox" checked={form.consent} onChange={(event) => update("consent", event.target.checked)} required />
        <span>I confirm these details are accurate and consent to Andropedia reviewing them for recruitment.</span>
      </label>

      {status === "error" && <p className="border-l-2 border-[var(--color-status-error)] pl-4 text-sm text-[var(--color-status-error)]" role="alert">{message}</p>}

      <button type="submit" disabled={status === "submitting"} className="button-primary w-full sm:w-auto disabled:cursor-wait disabled:opacity-60">
        {status === "submitting" ? <><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Submitting</> : <>Submit recruitment interest <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
      </button>
    </form>
  );
}
