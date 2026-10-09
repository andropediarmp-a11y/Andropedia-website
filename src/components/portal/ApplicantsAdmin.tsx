"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import { csvRow } from "@/lib/csv";
import { DOMAIN_QUESTIONS, UNIVERSAL_QUESTIONS, type DomainId } from "@/lib/recruitment/questions";

const STATUSES = ["new", "shortlisted", "accepted", "rejected"] as const;
type Status = (typeof STATUSES)[number];
const DOMAIN_LABEL: Record<string, string> = { technical: "Technical", web: "Web", design: "Design", media: "Media", pr: "PR" };
const STATUS_STYLE: Record<Status, string> = {
  new: "border-slate-600 bg-slate-800 text-slate-300",
  shortlisted: "border-sky-400/30 bg-sky-500/10 text-sky-300",
  accepted: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  rejected: "border-rose-400/30 bg-rose-500/10 text-rose-300",
};

interface Applicant {
  id: string;
  reference: string;
  name: string;
  registerNo: string;
  department: string;
  year: string;
  phone: string;
  email: string;
  profile: string;
  domain: string;
  answers: Record<string, string>;
  status: Status;
  emailSentAt: string | null;
  sheetSyncedAt: string | null;
  createdAt: string;
}

const fmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
const field = "rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-white focus:border-emerald-400 focus:outline-none";

/** Super-admin view of recruitment applications: filter, read answers, set status, email the decision, export. */
export function ApplicantsAdmin() {
  const [rows, setRows] = useState<Applicant[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [domain, setDomain] = useState("all");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/applications", { cache: "no-store" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setRows(data.applications);
    } catch {
      setNotice({ type: "error", text: "Could not load applications." });
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const setApplicantStatus = async (row: Applicant, next: Status) => {
    if (next === row.status) return;
    const emails = notify && next !== "new";
    setBusy(row.id);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/applications/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next, notify: emails }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(data?.error || "Could not update the status.");
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: next } : r)));
      const mail = data.emailed === true ? " and emailed them" : data.emailed === false ? ", but the email failed to send" : "";
      setNotice({ type: data.emailed === false ? "error" : "success", text: `${row.name} is now ${next}${mail}.` });
    } catch (err) {
      setNotice({ type: "error", text: err instanceof Error ? err.message : "Could not update the status." });
    } finally {
      setBusy(null);
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (domain === "all" || r.domain === domain) &&
        (status === "all" || r.status === status) &&
        (!q || `${r.name} ${r.email} ${r.registerNo} ${r.reference} ${r.department}`.toLowerCase().includes(q))
    );
  }, [rows, domain, status, query]);

  const counts = useMemo(() => Object.fromEntries(STATUSES.map((s) => [s, rows.filter((r) => r.status === s).length])) as Record<Status, number>, [rows]);

  const exportCsv = () => {
    const questionIds = [...UNIVERSAL_QUESTIONS, ...Object.values(DOMAIN_QUESTIONS).flat()].map((q) => q.id);
    const ids = [...new Set(questionIds)];
    const lines = [
      csvRow(["reference", "applied_at", "status", "name", "register_no", "department", "year", "phone", "email", "profile", "domain", ...ids]),
      ...visible.map((r) =>
        csvRow([r.reference, r.createdAt, r.status, r.name, r.registerNo, r.department, r.year, r.phone, r.email, r.profile, r.domain, ...ids.map((id) => r.answers[id] ?? "")])
      ),
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `applications-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const labelsFor = (row: Applicant) =>
    [...UNIVERSAL_QUESTIONS, ...(DOMAIN_QUESTIONS[row.domain as DomainId] ?? [])].filter((q) => row.answers[q.id]);

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_18px_50px_rgba(2,6,23,0.45)]">
      <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Recruitment applicants ({visible.length}{visible.length !== rows.length ? ` of ${rows.length}` : ""})</h2>
            <p className="mt-1 text-[11px] text-slate-400">
              {STATUSES.map((s) => `${counts[s]} ${s}`).join(" · ")}
            </p>
          </div>
          <button type="button" onClick={exportCsv} disabled={visible.length === 0} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:border-emerald-400/40 disabled:opacity-40">
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> Export CSV
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="applicant-search">Search applicants</label>
          <input id="applicant-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, register no, reference..." className={`${field} w-64`} />
          <label className="sr-only" htmlFor="applicant-domain">Filter by domain</label>
          <select id="applicant-domain" value={domain} onChange={(e) => setDomain(e.target.value)} className={field}>
            <option value="all">All domains</option>
            {Object.entries(DOMAIN_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <label className="sr-only" htmlFor="applicant-status">Filter by status</label>
          <select id="applicant-status" value={status} onChange={(e) => setStatus(e.target.value)} className={field}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-emerald-400" />
            Email the applicant when I change their status
          </label>
        </div>
        {notice && (
          <p role={notice.type === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-2.5 text-xs ${notice.type === "error" ? "border-rose-400/30 bg-rose-500/10 text-rose-200" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"}`}>
            {notice.text}
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-white/[0.02] text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
            <tr>
              <th className="px-4 py-4" aria-label="Details" />
              <th className="px-4 py-4">Applicant</th>
              <th className="px-4 py-4">Domain</th>
              <th className="px-4 py-4">Department / year</th>
              <th className="px-4 py-4">Applied</th>
              <th className="px-4 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {!loaded && <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading applications...</td></tr>}
            {loaded && visible.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">{rows.length === 0 ? "No applications yet." : "No applications match these filters."}</td></tr>}
            {visible.map((r) => (
              <Fragment key={r.id}>
                <tr className="hover:bg-white/[0.02]">
                  <td className="px-4 py-4">
                    <button type="button" onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id} aria-label={`${open === r.id ? "Hide" : "Show"} answers from ${r.name}`} className="text-slate-400 hover:text-white">
                      {open === r.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-white">{r.name}</div>
                    <div className="font-mono text-[11px] text-slate-400">{r.email}</div>
                  </td>
                  <td className="px-4 py-4"><span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-slate-300">{DOMAIN_LABEL[r.domain] ?? r.domain}</span></td>
                  <td className="px-4 py-4 text-slate-300">{r.department} · {r.year}</td>
                  <td className="px-4 py-4 text-slate-400">{fmt.format(new Date(r.createdAt))}</td>
                  <td className="px-4 py-4">
                    <select
                      aria-label={`Status for ${r.name}`}
                      value={r.status}
                      disabled={busy === r.id}
                      onChange={(e) => void setApplicantStatus(r, e.target.value as Status)}
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold focus:outline-none disabled:opacity-50 ${STATUS_STYLE[r.status] ?? STATUS_STYLE.new}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
                    </select>
                  </td>
                </tr>
                {open === r.id && (
                  <tr className="bg-black/30">
                    <td />
                    <td colSpan={5} className="space-y-4 px-4 py-5">
                      <dl className="grid gap-x-8 gap-y-2 text-[11px] sm:grid-cols-2 lg:grid-cols-3">
                        {[["Reference", r.reference], ["Register no.", r.registerNo], ["Phone", r.phone], ["Profile", r.profile], ["Confirmation email", r.emailSentAt ? "sent" : "not sent"], ["Google Sheet", r.sheetSyncedAt ? "copied" : "not copied"]].map(([k, v]) => (
                          <div key={k}><dt className="font-mono uppercase tracking-wider text-slate-500">{k}</dt><dd className="mt-0.5 break-all text-slate-200">{v}</dd></div>
                        ))}
                      </dl>
                      <div className="space-y-3">
                        {labelsFor(r).map((q) => (
                          <div key={q.id}>
                            <p className="text-[11px] font-semibold text-slate-400">{q.label}</p>
                            <p className="mt-0.5 whitespace-pre-wrap break-words text-xs text-slate-100">{r.answers[q.id]}</p>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
