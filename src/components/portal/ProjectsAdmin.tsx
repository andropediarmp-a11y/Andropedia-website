"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { PROJECT_DOMAINS, type ProjectView } from "@/lib/projects-shared";

const input = "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-emerald-400/60 focus:outline-none";
const blank = { title: "", domain: "Web", description: "", tags: "", github: "", live: "", status: "In progress" };

/** Super-admin project management: add, publish or hide, delete. Only published projects appear on /projects. */
export function ProjectsAdmin() {
  const [projects, setProjects] = useState<ProjectView[]>([]);
  const [form, setForm] = useState(blank);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const set = (key: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/projects", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setProjects(data.projects);
      else setNotice({ type: "error", text: data.error ?? "Could not load projects." });
    } catch {
      setNotice({ type: "error", text: "Could not load projects." });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const call = async (key: string, url: string, method: string, body?: unknown, ok?: string) => {
    setBusy(key);
    setNotice(null);
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setNotice({ type: "error", text: data.error ?? "That did not work. Please try again." });
        return false;
      }
      if (ok) setNotice({ type: "success", text: ok });
      await load();
      return true;
    } finally {
      setBusy(null);
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await call(
      "create",
      "/api/admin/projects",
      "POST",
      {
        title: form.title,
        domain: form.domain,
        description: form.description,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        github: form.github,
        live: form.live,
        status: form.status,
        isPublished: false,
      },
      "Saved as a draft. Publish it to show it on the Projects page."
    );
    if (done) {
      setForm(blank);
      setShowForm(false);
    }
  };

  const remove = async (p: ProjectView) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    await call(`del:${p.id}`, `/api/admin/projects/${p.id}`, "DELETE", undefined, "Project deleted.");
  };

  return (
    <div className="rounded-[28px] border border-sky-400/10 bg-white/[0.04] p-6 shadow-[0_18px_50px_rgba(2,6,23,0.45)] sm:p-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Projects</h2>
          <p className="mt-1 text-xs text-slate-400">Add club projects and publish them to the public Projects page.</p>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400">
          <Plus className="h-4 w-4" /> New project
        </button>
      </div>

      {notice && (
        <p role={notice.type === "error" ? "alert" : "status"} className={`mb-4 rounded-xl border px-4 py-3 text-sm ${notice.type === "error" ? "border-rose-400/30 bg-rose-500/10 text-rose-200" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"}`}>
          {notice.text}
        </p>
      )}

      {showForm && (
        <form onSubmit={create} className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:grid-cols-2">
          <input className={input} placeholder="Title" value={form.title} onChange={set("title")} required minLength={3} maxLength={120} />
          <select className={input} aria-label="Domain" value={form.domain} onChange={set("domain")}>
            {PROJECT_DOMAINS.map((d) => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
          </select>
          <textarea className={`${input} sm:col-span-2`} placeholder="Description (10+ characters)" value={form.description} onChange={set("description")} required minLength={10} maxLength={1000} rows={3} />
          <input className={input} placeholder="Tags, comma separated (Next.js, Redis)" value={form.tags} onChange={set("tags")} />
          <input className={input} placeholder="Status label (Live, Prototype...)" value={form.status} onChange={set("status")} required maxLength={40} />
          <input className={input} type="url" placeholder="Source link (https://github.com/...)" value={form.github} onChange={set("github")} maxLength={300} />
          <input className={input} type="url" placeholder="Live demo link (optional)" value={form.live} onChange={set("live")} maxLength={300} />
          <div className="flex items-end justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300 hover:text-white">Cancel</button>
            <button type="submit" disabled={busy === "create"} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-60">Save draft</button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 py-8 text-center text-sm text-slate-500">No projects yet. Add the first one.</p>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{p.title}</p>
                <p className="text-xs text-slate-400">{p.domain} · {p.status}{p.tags.length ? ` · ${p.tags.join(", ")}` : ""}</p>
                <p className={`mt-1 text-[10px] font-mono uppercase tracking-wider ${p.isPublished ? "text-emerald-300" : "text-amber-300"}`}>{p.isPublished ? "Published" : "Draft"}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" disabled={busy === `pub:${p.id}`} onClick={() => call(`pub:${p.id}`, `/api/admin/projects/${p.id}`, "PATCH", { isPublished: !p.isPublished })} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10">
                  {p.isPublished ? <><EyeOff className="h-3.5 w-3.5" /> Unpublish</> : <><Eye className="h-3.5 w-3.5" /> Publish</>}
                </button>
                <button type="button" onClick={() => remove(p)} aria-label={`Delete ${p.title}`} className="rounded-lg border border-rose-400/30 p-1.5 text-rose-300 hover:bg-rose-500/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
