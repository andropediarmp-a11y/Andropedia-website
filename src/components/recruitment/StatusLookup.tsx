"use client";

import { useState } from "react";

// Applicants check where they stand with the reference ID from their confirmation email.
export function StatusLookup() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/recruitment/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, email }),
      });
      const data = await res.json().catch(() => null);
      setResult(res.ok && data?.success ? { ok: true, text: data.message } : { ok: false, text: data?.error || "Something went wrong. Please try again." });
    } catch {
      setResult({ ok: false, text: "Network error. Please check your connection and try again." });
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-base text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none";

  return (
    <form onSubmit={check} className="glass-card p-6 sm:p-8 space-y-4" aria-labelledby="status-heading">
      <h2 id="status-heading" className="text-fade-strong text-xl font-semibold">Already applied? Check your status</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm text-slate-300">
          Reference ID
          <input className={input} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="REC-1A2B3C4D" required maxLength={32} autoComplete="off" />
        </label>
        <label className="space-y-1 text-sm text-slate-300">
          Email you applied with
          <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required maxLength={160} autoComplete="email" />
        </label>
      </div>
      <button type="submit" disabled={busy} className="btn-glow disabled:opacity-60">{busy ? "Checking..." : "Check status"}</button>
      {result && (
        <p
          role="status"
          className={`rounded-xl border p-3 text-sm ${result.ok ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100" : "border-rose-500/35 bg-rose-500/10 text-rose-200"}`}
        >
          {result.text}
        </p>
      )}
    </form>
  );
}
