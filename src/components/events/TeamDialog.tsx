"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Plus, Trash2, Users, X } from "lucide-react";
import type { PublicEvent } from "@/lib/events";

const YEAR_OPTIONS: Array<[string, string]> = [
  ["first", "1st year"],
  ["second", "2nd year"],
  ["third", "3rd year"],
  ["fourth", "4th year"],
  ["other", "Other"],
];

interface MemberForm {
  name: string;
  mobile: string;
  email: string;
  dept: string;
  section: string;
  year: string;
  registerNo: string;
}

const blankMember = (): MemberForm => ({ name: "", mobile: "", email: "", dept: "", section: "", year: "", registerNo: "" });

const field = "w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-emerald-400/60 focus:outline-none";

/** Team registration: a team name plus teamMin..teamMax members. The first member is the team leader. */
export function TeamDialog({ event, onClose, onDone }: { event: PublicEvent; onClose: () => void; onDone: (id: string) => void }) {
  const min = event.teamMin ?? 1;
  const max = event.teamMax ?? min;
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<MemberForm[]>(() => Array.from({ length: min }, blankMember));
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const update = (i: number, k: keyof MemberForm, v: string) => setMembers((ms) => ms.map((m, idx) => (idx === i ? { ...m, [k]: v } : m)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${event.id}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName, members, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setDone(members[0].email);
        onDone(event.id);
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const sizeText = min === max ? `${min} members` : `${min} to ${max} members`;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xl sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Register a team for ${event.title}`}
        className="glass-card relative my-4 w-full max-w-2xl p-6 sm:p-8"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-full border border-white/15 bg-white/5 p-2 text-white/70 hover:text-white">
          <X className="h-4 w-4" />
        </button>

        {done ? (
          <div className="space-y-3 py-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300"><Check className="h-6 w-6" /></div>
            <h2 className="text-xl font-bold text-white">Your team is registered</h2>
            <p className="text-sm text-white/70">{teamName} · {event.title}</p>
            <p className="text-xs text-white/50">A confirmation email is on its way to every team member.</p>
            <button type="button" onClick={onClose} className="btn-ghost mt-2">Done</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5" noValidate>
            <div className="pr-8">
              <h2 className="text-xl font-bold text-white">Register your team</h2>
              <p className="mt-1 text-sm text-white/60">{event.title} · teams of {sizeText}. The first member is the team leader.</p>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-white/70">Team name</span>
              <input className={field} value={teamName} onChange={(e) => setTeamName(e.target.value)} required maxLength={60} placeholder="e.g. Null Pointers" autoFocus />
            </label>

            {members.map((m, i) => (
              <fieldset key={i} className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <legend className="flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-white/60">
                  <Users className="h-3.5 w-3.5" /> {i === 0 ? "Member 1 (team leader)" : `Member ${i + 1}`}
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={field} placeholder="Full name" aria-label={`Member ${i + 1} full name`} value={m.name} onChange={(e) => update(i, "name", e.target.value)} autoComplete="off" required maxLength={80} />
                  <input className={field} placeholder="Register number" aria-label={`Member ${i + 1} register number`} value={m.registerNo} onChange={(e) => update(i, "registerNo", e.target.value)} autoComplete="off" required maxLength={24} />
                  <input className={field} type="email" placeholder="College email" aria-label={`Member ${i + 1} email`} value={m.email} onChange={(e) => update(i, "email", e.target.value)} autoComplete="off" required maxLength={160} />
                  <input className={field} type="tel" inputMode="tel" placeholder="Mobile number" aria-label={`Member ${i + 1} mobile number`} value={m.mobile} onChange={(e) => update(i, "mobile", e.target.value)} autoComplete="off" required maxLength={16} />
                  <input className={field} placeholder="Department (e.g. CSE)" aria-label={`Member ${i + 1} department`} value={m.dept} onChange={(e) => update(i, "dept", e.target.value)} autoComplete="off" required maxLength={60} />
                  <div className="grid grid-cols-2 gap-3">
                    <input className={field} placeholder="Section" aria-label={`Member ${i + 1} section`} value={m.section} onChange={(e) => update(i, "section", e.target.value)} autoComplete="off" required maxLength={10} />
                    <select className={field} aria-label={`Member ${i + 1} year`} value={m.year} onChange={(e) => update(i, "year", e.target.value)} required>
                      <option value="" disabled>Year</option>
                      {YEAR_OPTIONS.map(([v, l]) => <option key={v} value={v} className="text-black">{l}</option>)}
                    </select>
                  </div>
                </div>
                {i >= min && (
                  <button type="button" onClick={() => setMembers((ms) => ms.filter((_, idx) => idx !== i))} className="inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-200">
                    <Trash2 className="h-3.5 w-3.5" /> Remove member
                  </button>
                )}
              </fieldset>
            ))}

            {members.length < max && (
              <button type="button" onClick={() => setMembers((ms) => [...ms, blankMember()])} className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-white/25 px-4 py-2 text-sm text-white/80 hover:border-white/50 hover:text-white">
                <Plus className="h-4 w-4" /> Add a member ({members.length}/{max})
              </button>
            )}

            {/* Honeypot: hidden from people, irresistible to bots. */}
            <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} className="absolute left-[-9999px] h-0 w-0 opacity-0" name="website" />

            {error && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>}

            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60">
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Registering...</> : <>Register team</>}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
