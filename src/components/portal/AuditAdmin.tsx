"use client";

import { useState } from "react";

interface Entry {
  id: string;
  actorId: string;
  action: string;
  target: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

const fmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

/** Recent admin actions (grading, week, member, application and project changes). Loaded on demand. */
export function AuditAdmin({ names }: { names: Record<string, string> }) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/audit?limit=100", { cache: "no-store" });
      const data = await res.json();
      if (!data.success) throw new Error();
      setEntries(data.entries);
    } catch {
      setError("Could not load the audit log.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_18px_50px_rgba(2,6,23,0.45)]">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-white">Audit log</h2>
          <p className="mt-1 text-[11px] text-slate-400">Who changed what: grades, weeks, members, applicants, projects and events.</p>
        </div>
        <button type="button" onClick={load} disabled={busy} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:border-emerald-400/40 disabled:opacity-50">
          {busy ? "Loading..." : entries ? "Refresh" : "Show recent activity"}
        </button>
      </div>
      {error && <p role="alert" className="px-6 py-4 text-xs text-rose-200">{error}</p>}
      {entries && (
        <ul className="max-h-96 divide-y divide-white/5 overflow-y-auto text-xs">
          {entries.length === 0 && <li className="px-6 py-6 text-center text-slate-400">Nothing recorded yet.</li>}
          {entries.map((e) => (
            <li key={e.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-6 py-3">
              <span className="w-36 shrink-0 text-slate-500">{fmt.format(new Date(e.createdAt))}</span>
              <span className="font-semibold text-white">{names[e.actorId] ?? e.actorId}</span>
              <span className="font-mono text-emerald-300">{e.action}</span>
              {e.meta && <span className="break-all font-mono text-[11px] text-slate-500">{JSON.stringify(e.meta).slice(0, 160)}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
