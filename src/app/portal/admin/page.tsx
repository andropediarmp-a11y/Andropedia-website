"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { PortalNav } from "@/components/portal/PortalNav";
import { useAuth } from "@/lib/auth-context";
import { Week, User, Task } from "@/lib/types";
import { PortalAccessGate } from "@/components/portal/PortalAccessGate";

export default function AdminPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [members, setMembers] = useState<User[]>([]);

  const loadData = async () => {
    try {
      const [resWeeks, resMembers, resTasks] = await Promise.all([
        fetch("/api/weeks"),
        fetch("/api/members"),
        fetch("/api/tasks"),
      ]);

      const [dataWeeks, dataMembers, dataTasks] = await Promise.all([
        resWeeks.json(),
        resMembers.json(),
        resTasks.json(),
      ]);

      if (dataWeeks.success) setWeeks(dataWeeks.weeks);
      if (dataMembers.success) setMembers(dataMembers.members);
    } catch (err) {
      console.error("Admin data load error:", err);
    }
  };

  useEffect(() => {
    if (authLoading || currentUser?.role !== "super_admin") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [authLoading, currentUser]);

  const toggleWeekActive = (weekId: string) => {
    setWeeks((prev) =>
      prev.map((w) => {
        if (w.id === weekId) {
          return { ...w, isActive: !w.isActive };
        }
        return w;
      })
    );
  };

  return (
    <PortalAccessGate allowedRoles={["super_admin"]}>
      <div className="flex min-h-screen flex-col bg-[#050b16] text-slate-100">
        <PortalNav />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col justify-between gap-4 border-b border-sky-400/10 pb-6 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-violet-300">
                <ShieldAlert className="h-3.5 w-3.5" />
                Super admin console
              </div>
              <h1 className="text-3xl font-black text-white">Club governance & sprint ops</h1>
              <p className="mt-2 text-xs text-slate-400">Open or close weekly sprint windows and audit member roles and submissions.</p>
            </div>

            <span className="inline-flex items-center rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-300">
              System health: optimal
            </span>
          </div>

          <div className="rounded-[28px] border border-sky-400/10 bg-[#0b1420]/80 p-6 shadow-[0_18px_50px_rgba(2,6,23,0.45)] sm:p-8">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-white">Sprint cycles</h2>
              <p className="mt-1 text-xs text-slate-400">Toggle submission status to open or close deliverable windows.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {weeks.map((week) => (
                <div key={week.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-300">Week {week.weekNumber}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-mono ${week.isActive ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300" : "border-slate-700 bg-slate-800 text-slate-400"}`}>
                        {week.isActive ? "Open" : "Closed"}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{week.title}</h3>
                    <p className="mt-1 text-[11px] text-slate-400">Theme: {week.theme}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleWeekActive(week.id)}
                    className="rounded-xl border border-white/10 bg-slate-900 p-2 transition-colors hover:border-cyan-400/30"
                    title="Toggle active status"
                  >
                    {week.isActive ? <ToggleRight className="h-8 w-8 text-emerald-400" /> : <ToggleLeft className="h-8 w-8 text-slate-600" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1420]/80 shadow-[0_18px_50px_rgba(2,6,23,0.45)]">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h2 className="text-lg font-bold text-white">Member roster & roles ({members.length})</h2>
              <Link href="/team" className="text-xs font-semibold text-emerald-300">
                Public directory →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-white/[0.02] text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Domain</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={member.avatar} alt={member.name} className="h-9 w-9 rounded-xl object-cover" />
                          <span className="font-bold text-white">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400">{member.email}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-slate-300">{member.domain}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full border px-2 py-1 font-mono capitalize ${member.role === "super_admin" ? "border-violet-400/30 bg-violet-500/10 text-violet-300" : member.role === "domain_admin" ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300" : "border-slate-700 bg-slate-800 text-slate-300"}`}>
                          {member.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-amber-300">{member.points || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </PortalAccessGate>
  );
}
