"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import type { User } from "@/lib/types";

const input = "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-emerald-400/60 focus:outline-none";
const DOMAINS = ["Technical", "Web", "R&D", "Design", "Media", "PR"];

/** Add a member by hand. They can log in right away with an emailed code. */
export function MemberCreate({ onCreated }: { onCreated: (member: User) => void }) {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", registerNo: "", domain: "Web", role: "member" });
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(data?.error || "Could not add the member.");
      onCreated(data.member);
      setForm({ name: "", email: "", registerNo: "", domain: "Web", role: "member" });
      setShow(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the member.");
    } finally {
      setBusy(false);
    }
  };

  if (!show) {
    return (
      <div className="border-b border-white/10 px-6 py-3">
        <button type="button" onClick={() => setShow(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:border-emerald-400/40">
          <UserPlus className="h-3.5 w-3.5" aria-hidden="true" /> Add member
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-3 border-b border-white/10 bg-slate-950/50 px-6 py-5 sm:grid-cols-5">
      <label className="space-y-1 text-xs text-slate-300">Name
        <input className={input} required minLength={2} maxLength={80} value={form.name} onChange={(e) => set("name", e.target.value)} />
      </label>
      <label className="space-y-1 text-xs text-slate-300">Email
        <input className={input} type="email" required maxLength={160} value={form.email} onChange={(e) => set("email", e.target.value)} />
      </label>
      <label className="space-y-1 text-xs text-slate-300">Register number
        <input className={input} required minLength={6} maxLength={30} value={form.registerNo} onChange={(e) => set("registerNo", e.target.value)} placeholder="RA2511026020025" />
      </label>
      <label className="space-y-1 text-xs text-slate-300">Domain
        <select className={input} value={form.domain} onChange={(e) => set("domain", e.target.value)}>
          {DOMAINS.map((d) => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
        </select>
      </label>
      <label className="space-y-1 text-xs text-slate-300">Portal role
        <select className={input} value={form.role} onChange={(e) => set("role", e.target.value)}>
          <option value="member" className="bg-slate-900">Member</option>
          <option value="domain_admin" className="bg-slate-900">Domain lead (can grade)</option>
          <option value="super_admin" className="bg-slate-900">Super admin</option>
        </select>
      </label>
      {error && <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200 sm:col-span-5">{error}</p>}
      <div className="flex gap-2 sm:col-span-5">
        <button type="submit" disabled={busy} className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 disabled:opacity-60">{busy ? "Adding..." : "Add member"}</button>
        <button type="button" onClick={() => setShow(false)} className="rounded-lg border border-white/15 px-4 py-2 text-xs text-slate-300">Cancel</button>
      </div>
    </form>
  );
}
