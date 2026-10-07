"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Eye, EyeOff, Lock, LockOpen, Plus, Trash2, Users } from "lucide-react";
import type { AdminEvent, Attendee } from "@/lib/events";

const fmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

const input = "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-emerald-400/60 focus:outline-none";
const blank = { title: "", type: "Workshop", description: "", location: "", startsAt: "", endsAt: "", capacity: "", teamMin: "", teamMax: "", prize: "" };

type Notice = { type: "error" | "success"; text: string } | null;

/** Super-admin event management: create, publish, open/close reservations, view attendees, delete. */
export function EventsAdmin() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [form, setForm] = useState(blank);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [attendees, setAttendees] = useState<{ eventId: string; list: Attendee[] } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/events", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setEvents(data.events);
      else setNotice({ type: "error", text: data.error ?? "Could not load events." });
    } catch {
      setNotice({ type: "error", text: "Could not load events." });
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
    if (!form.startsAt) return setNotice({ type: "error", text: "Choose a start date and time." });
    const done = await call(
      "create",
      "/api/admin/events",
      "POST",
      {
        title: form.title,
        type: form.type,
        description: form.description,
        location: form.location,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        capacity: form.capacity ? Number(form.capacity) : null,
        teamMin: form.teamMin ? Number(form.teamMin) : null,
        teamMax: form.teamMax ? Number(form.teamMax) : null,
        prize: form.prize || null,
        isPublished: false,
      },
      "Event saved as a draft. Publish it when it is ready."
    );
    if (done) {
      setForm(blank);
      setShowForm(false);
    }
  };

  const showAttendees = async (id: string) => {
    if (attendees?.eventId === id) return setAttendees(null);
    const res = await fetch(`/api/admin/events/${id}/rsvps`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (data.success) setAttendees({ eventId: id, list: data.attendees });
    else setNotice({ type: "error", text: data.error ?? "Could not load attendees." });
  };

  const remove = async (ev: AdminEvent) => {
    const warning = ev.rsvpCount > 0 ? ` This also deletes ${ev.rsvpCount} reservation(s).` : "";
    if (!window.confirm(`Delete "${ev.title}"?${warning}`)) return;
    await call(`del:${ev.id}`, `/api/admin/events/${ev.id}`, "DELETE", undefined, "Event deleted.");
  };

  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="rounded-[28px] border border-sky-400/10 bg-white/[0.04] p-6 shadow-[0_18px_50px_rgba(2,6,23,0.45)] sm:p-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Events & reservations</h2>
          <p className="mt-1 text-xs text-slate-400">Create events, publish them to the public Events page, and see who reserved a seat.</p>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400">
          <Plus className="h-4 w-4" /> New event
        </button>
      </div>

      {notice && (
        <p role={notice.type === "error" ? "alert" : "status"} className={`mb-4 rounded-xl border px-4 py-3 text-sm ${notice.type === "error" ? "border-rose-400/30 bg-rose-500/10 text-rose-200" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"}`}>
          {notice.text}
        </p>
      )}

      {showForm && (
        <form onSubmit={create} className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:grid-cols-2">
          <input className={input} placeholder="Title" value={form.title} onChange={set("title")} required minLength={3} maxLength={160} />
          <input className={input} placeholder="Type (Hackathon, Workshop...)" value={form.type} onChange={set("type")} required maxLength={40} />
          <textarea className={`${input} sm:col-span-2`} placeholder="Description (10+ characters)" value={form.description} onChange={set("description")} required minLength={10} maxLength={2000} rows={3} />
          <input className={input} placeholder="Location" value={form.location} onChange={set("location")} required maxLength={160} />
          <input className={input} placeholder="Prize or perk (optional)" value={form.prize} onChange={set("prize")} maxLength={160} />
          <label className="space-y-1 text-xs text-slate-400">Starts<input className={input} type="datetime-local" value={form.startsAt} onChange={set("startsAt")} required /></label>
          <label className="space-y-1 text-xs text-slate-400">Ends (optional)<input className={input} type="datetime-local" value={form.endsAt} onChange={set("endsAt")} /></label>
          <input className={input} type="number" min={1} placeholder="Seat or team limit (empty = unlimited)" value={form.capacity} onChange={set("capacity")} />
          <div className="grid grid-cols-2 gap-3">
            <input className={input} type="number" min={1} max={10} placeholder="Min team size" aria-label="Minimum team size" value={form.teamMin} onChange={set("teamMin")} />
            <input className={input} type="number" min={1} max={10} placeholder="Max team size" aria-label="Maximum team size" value={form.teamMax} onChange={set("teamMax")} />
          </div>
          <p className="text-xs text-slate-500 sm:col-span-2">Leave both team sizes empty for a normal event where each person reserves a seat. Fill both to make it a team event.</p>
          <div className="flex items-end justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300 hover:text-white">Cancel</button>
            <button type="submit" disabled={busy === "create"} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-60">Save draft</button>
          </div>
        </form>
      )}

      {events.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 py-8 text-center text-sm text-slate-500">No events yet. Create the first one.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((ev) => (
            <li key={ev.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{ev.title}</p>
                  <p className="text-xs text-slate-400">
                    {fmt.format(new Date(ev.startsAt))} · {ev.location} · {ev.rsvpCount}{ev.capacity ? ` / ${ev.capacity}` : ""} {ev.teamMax != null ? `teams (of ${ev.teamMin === ev.teamMax ? ev.teamMax : `${ev.teamMin}-${ev.teamMax}`})` : "reserved"}
                  </p>
                  <p className="mt-1 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-wider">
                    <span className={ev.isPublished ? "text-emerald-300" : "text-amber-300"}>{ev.isPublished ? "Published" : "Draft"}</span>
                    <span className="text-slate-500">{ev.status}</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" disabled={busy === `pub:${ev.id}`} onClick={() => call(`pub:${ev.id}`, `/api/admin/events/${ev.id}`, "PATCH", { isPublished: !ev.isPublished })} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10">
                    {ev.isPublished ? <><EyeOff className="h-3.5 w-3.5" /> Unpublish</> : <><Eye className="h-3.5 w-3.5" /> Publish</>}
                  </button>
                  <button type="button" disabled={busy === `reg:${ev.id}`} onClick={() => call(`reg:${ev.id}`, `/api/admin/events/${ev.id}`, "PATCH", { registrationOpen: !ev.registrationOpen })} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10">
                    {ev.registrationOpen ? <><Lock className="h-3.5 w-3.5" /> Close reservations</> : <><LockOpen className="h-3.5 w-3.5" /> Reopen reservations</>}
                  </button>
                  <button type="button" onClick={() => showAttendees(ev.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10">
                    <Users className="h-3.5 w-3.5" /> Attendees
                  </button>
                  <a href={`/api/admin/events/${ev.id}/rsvps?format=csv`} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10">
                    <Download className="h-3.5 w-3.5" /> CSV
                  </a>
                  <button type="button" onClick={() => remove(ev)} aria-label={`Delete ${ev.title}`} className="rounded-lg border border-rose-400/30 p-1.5 text-rose-300 hover:bg-rose-500/10">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {attendees?.eventId === ev.id && (
                <div className="mt-3 border-t border-white/10 pt-3">
                  {attendees.list.length === 0 ? (
                    <p className="text-xs text-slate-500">No reservations yet.</p>
                  ) : (
                    <ul className="grid gap-1 text-xs text-slate-300 sm:grid-cols-2">
                      {attendees.list.map((a) => (
                        <li key={a.id} className="truncate">
                          {a.teamName && <span className="text-emerald-300">{a.teamName} · </span>}
                          {a.name} {a.isLeader && <span className="text-amber-300">(leader)</span>}{" "}
                          <span className="text-slate-500">· {a.email}{a.mobile ? ` · ${a.mobile}` : ""}{a.registerNo ? ` · ${a.registerNo}` : ""}{a.dept ? ` · ${a.dept} ${a.section ?? ""}` : ""}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
