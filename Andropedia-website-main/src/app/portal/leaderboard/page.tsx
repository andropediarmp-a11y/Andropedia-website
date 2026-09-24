"use client";

import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
import { PortalAccessGate } from "@/components/portal/PortalAccessGate";
import { PortalNav } from "@/components/portal/PortalNav";

export default function PortalLeaderboardPage() {
  return <PortalAccessGate><div className="min-h-screen bg-[#050b16] text-slate-100"><PortalNav /><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="rounded-[28px] bg-[#f5f6f8] p-5 text-[#111318] sm:p-8"><p className="font-mono text-xs uppercase tracking-[0.12em] text-[#4273e4]">Member portal</p><h1 className="mt-4 text-4xl font-bold tracking-[-0.04em]">Leaderboard</h1><div className="mt-8"><LeaderboardView /></div></div></div></div></PortalAccessGate>;
}
