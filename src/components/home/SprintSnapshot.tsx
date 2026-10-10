import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlurOrb } from "@/components/design/Backdrop";
import { Reveal } from "@/components/design/Reveal";
import { CountUp } from "@/components/design/scroll";
import { getLeaderboard, getWeeks } from "@/lib/data-store";
import { log } from "@/lib/logger";
import type { LeaderboardEntry } from "@/lib/types";

// Default mock sprint data with Andro Points
const DEFAULT_SPRINT_DATA = {
  sprintNumber: 4,
  podium: [
    {
      rank: 2,
      name: "Ananya Sharma",
      role: "WebDev Engineering Lead",
      domain: "Web Development",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      points: "3,120",
    },
    {
      rank: 1,
      name: "Aryan Kulkarni",
      role: "Chief of AI Innovations",
      domain: "R&D / AI Innovations",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      points: "3,450",
      mvpBadge: "SPRINT 04 MVP",
    },
    {
      rank: 3,
      name: "Kabir Mehta",
      role: "Design Architecture Lead",
      domain: "Design & 3D Architecture",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      points: "2,980",
    },
  ],
  ledger: [
    { rank: 1, name: "Aryan Kulkarni", domain: "R&D / AI Innovations", points: "3,450 pts", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
    { rank: 2, name: "Ananya Sharma", domain: "WebDev Engineering", points: "3,120 pts", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
    { rank: 3, name: "Kabir Mehta", domain: "Design & 3D Architecture", points: "2,980 pts", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" },
    { rank: 4, name: "Marcus Vance", domain: "Tech & Systems", points: "2,840 pts", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80" },
    { rank: 5, name: "Siddharth Roy", domain: "R&D / AI Innovations", points: "2,710 pts", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80" },
  ],
};

export async function SprintSnapshot() {
  let dbRows: LeaderboardEntry[] = [];
  let sprintNumber: number = DEFAULT_SPRINT_DATA.sprintNumber;

  try {
    const [board, weeks] = await Promise.all([getLeaderboard("All", "all-time"), getWeeks()]);
    dbRows = board.filter((r) => r.totalScore > 0);
    const active = weeks.find((w) => w.isActive);
    if (active) sprintNumber = active.weekNumber;
  } catch (err) {
    log.error("Home leaderboard fetch error", err);
  }

  const hasDbData = dbRows.length >= 3;
  const podiumData = hasDbData
    ? [
        {
          rank: 2,
          name: dbRows[1].name,
          role: `${dbRows[1].domain} Contributor`,
          domain: dbRows[1].domain,
          avatar: dbRows[1].avatar || DEFAULT_SPRINT_DATA.podium[0].avatar,
          points: dbRows[1].totalScore.toLocaleString(),
        },
        {
          rank: 1,
          name: dbRows[0].name,
          role: `${dbRows[0].domain} Lead`,
          domain: dbRows[0].domain,
          avatar: dbRows[0].avatar || DEFAULT_SPRINT_DATA.podium[1].avatar,
          points: dbRows[0].totalScore.toLocaleString(),
          mvpBadge: `SPRINT ${String(sprintNumber).padStart(2, "0")} MVP`,
        },
        {
          rank: 3,
          name: dbRows[2].name,
          role: `${dbRows[2].domain} Specialist`,
          domain: dbRows[2].domain,
          avatar: dbRows[2].avatar || DEFAULT_SPRINT_DATA.podium[2].avatar,
          points: dbRows[2].totalScore.toLocaleString(),
        },
      ]
    : DEFAULT_SPRINT_DATA.podium;

  const ledgerData = hasDbData
    ? dbRows.slice(0, 5).map((r, i) => ({
        rank: i + 1,
        name: r.name,
        domain: r.domain,
        points: `${r.totalScore.toLocaleString()} pts`,
        avatar: r.avatar || DEFAULT_SPRINT_DATA.ledger[i]?.avatar || "",
      }))
    : DEFAULT_SPRINT_DATA.ledger;

  const card2 = podiumData.find((p) => p.rank === 2) ?? podiumData[0];
  const card1 = podiumData.find((p) => p.rank === 1) ?? podiumData[1];
  const card3 = podiumData.find((p) => p.rank === 3) ?? podiumData[2];

  return (
    <section id="sprint" className="relative isolate overflow-hidden bg-black px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
      <BlurOrb variant="hero" size={900} opacity={0.3} position={{ left: "50%", top: "50%" }} />

      <Reveal className="relative mx-auto max-w-[1100px]">
        {/* ── Single Merged Board Container ── */}
        <div
          className="relative overflow-hidden rounded-2xl border border-[#0066ff]/25 bg-[#050917]/90 p-5 shadow-[0_0_60px_rgba(0,102,255,0.15)] backdrop-blur-xl sm:p-8 lg:p-10"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0, 102, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 102, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(circle at 50% 15%, rgba(0, 102, 255, 0.15), transparent 70%)",
            }}
          />

          {/* ── Top 3 Podium Cards ── */}
          <div className="relative z-10 grid grid-cols-1 items-end gap-5 sm:grid-cols-3 sm:gap-4 lg:gap-6">
            {/* #2 — Left Card */}
            <div className="order-2 flex flex-col items-center sm:order-1">
              <div className="relative mb-[-16px] z-20 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0066ff] bg-[#070e24] font-mono text-[12px] font-bold text-[#38bdf8] shadow-[0_0_15px_rgba(0,102,255,0.5)]">
                2
              </div>
              <div className="relative flex w-full flex-col items-center overflow-hidden rounded-xl border border-[#0066ff]/25 bg-[#08122c]/70 px-4 pb-5 pt-7 text-center backdrop-blur-md transition-all duration-300 hover:border-[#0066ff]/50 sm:h-[260px]">
                {/* Avatar */}
                <div className="relative h-16 w-16 shrink-0 rounded-full border-2 border-[#0066ff]/50 p-0.5 shadow-[0_0_20px_rgba(0,102,255,0.35)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card2.avatar} alt={card2.name} className="h-full w-full rounded-full object-cover" />
                </div>
                {/* Info */}
                <h3 className="mt-3 font-semibold text-white text-[15px] sm:text-[16px]">{card2.name}</h3>
                <p className="mt-0.5 text-[11px] font-medium text-[#38bdf8] sm:text-[12px]">{card2.role}</p>
                {/* Andro Points */}
                <div className="mt-auto pt-3">
                  <div className="font-mono text-[20px] font-bold text-white sm:text-[22px]">
                    <CountUp value={card2.points} /> <span className="text-[12px] font-medium text-[#38bdf8]">Andro Points</span>
                  </div>
                </div>
              </div>
            </div>

            {/* #1 — Center Card (Elevated) */}
            <div className="order-1 flex flex-col items-center sm:order-2">
              <div className="relative mb-[-18px] z-20 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#00d4ff] bg-[#071330] font-mono text-[14px] font-bold text-[#00d4ff] shadow-[0_0_20px_rgba(0,212,255,0.7)]">
                1
              </div>
              <div className="relative flex w-full flex-col items-center overflow-hidden rounded-xl border border-[#00d4ff]/40 bg-[#0a183c]/85 px-4 pb-6 pt-8 text-center shadow-[0_0_35px_rgba(0,102,255,0.25)] backdrop-blur-md transition-all duration-300 hover:border-[#00d4ff]/70 sm:h-[300px]">
                {/* Glowing Aura */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-28"
                  style={{ background: "radial-gradient(circle at 50% 0%, rgba(0,212,255,0.2), transparent 75%)" }}
                />

                {/* Avatar with Ring */}
                <div className="relative h-20 w-20 shrink-0 rounded-full border-2 border-[#00d4ff] p-0.5 shadow-[0_0_25px_rgba(0,212,255,0.5)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card1.avatar} alt={card1.name} className="h-full w-full rounded-full object-cover" />
                </div>

                {/* MVP Pill */}
                {card1.mvpBadge && (
                  <span className="mt-2 inline-block rounded-full border border-[#00d4ff]/40 bg-[#00d4ff]/10 px-2.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-[#00d4ff]">
                    {card1.mvpBadge}
                  </span>
                )}

                {/* Info */}
                <h3 className="mt-2 text-[17px] font-bold text-white sm:text-[18px]">{card1.name}</h3>
                <p className="mt-0.5 text-[12px] font-medium text-[#00d4ff] sm:text-[13px]">{card1.role}</p>

                {/* Andro Points */}
                <div className="mt-auto pt-3">
                  <div className="font-mono text-[24px] font-black text-[#00d4ff] sm:text-[26px]">
                    <CountUp value={card1.points} /> <span className="text-[13px] font-semibold text-white/70">Andro Points</span>
                  </div>
                </div>
              </div>
            </div>

            {/* #3 — Right Card */}
            <div className="order-3 flex flex-col items-center">
              <div className="relative mb-[-16px] z-20 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0066ff] bg-[#070e24] font-mono text-[12px] font-bold text-[#38bdf8] shadow-[0_0_15px_rgba(0,102,255,0.5)]">
                3
              </div>
              <div className="relative flex w-full flex-col items-center overflow-hidden rounded-xl border border-[#0066ff]/25 bg-[#08122c]/70 px-4 pb-5 pt-7 text-center backdrop-blur-md transition-all duration-300 hover:border-[#0066ff]/50 sm:h-[250px]">
                {/* Avatar */}
                <div className="relative h-16 w-16 shrink-0 rounded-full border-2 border-[#0066ff]/50 p-0.5 shadow-[0_0_20px_rgba(0,102,255,0.35)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card3.avatar} alt={card3.name} className="h-full w-full rounded-full object-cover" />
                </div>
                {/* Info */}
                <h3 className="mt-3 font-semibold text-white text-[15px] sm:text-[16px]">{card3.name}</h3>
                <p className="mt-0.5 text-[11px] font-medium text-[#38bdf8] sm:text-[12px]">{card3.role}</p>
                {/* Andro Points */}
                <div className="mt-auto pt-3">
                  <div className="font-mono text-[20px] font-bold text-white sm:text-[22px]">
                    <CountUp value={card3.points} /> <span className="text-[12px] font-medium text-[#38bdf8]">Andro Points</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Ranking Ledger Table with Andro Points Column and 5 Circles ── */}
          <div className="relative z-10 mt-8 overflow-hidden rounded-xl border border-[#0066ff]/20 bg-[#070e24]/80 backdrop-blur-md sm:mt-10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#0066ff]/20 bg-[#0066ff]/[0.06] px-4 py-3 sm:px-6">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#38bdf8] sm:text-[12px]">
                LIVE SPRINT {String(sprintNumber).padStart(2, "0")} RANKING LEDGER
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
                SYNCED VIA COMMIT MESH
              </span>
            </div>

            {/* Column Headers (Verified Commits & Guild XP removed, combined into Andro Points) */}
            <div className="grid grid-cols-[60px_1.5fr_1.2fr_130px] items-center gap-2 border-b border-white/5 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45 sm:px-6">
              <span>RANK</span>
              <span>CONTRIBUTOR</span>
              <span>DOMAIN TRACK</span>
              <span className="text-right">ANDRO POINTS</span>
            </div>

            {/* Rows with 5 Circles for Ranks */}
            <div className="divide-y divide-white/[0.04]">
              {ledgerData.map((row, idx) => (
                <div
                  key={row.rank + row.name}
                  className="grid grid-cols-[60px_1.5fr_1.2fr_130px] items-center gap-2 px-4 py-3 transition-colors hover:bg-white/[0.03] sm:px-6"
                >
                  {/* Rank Circle Badge */}
                  <div>
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-[12px] font-bold ${
                        idx === 0
                          ? "border-2 border-[#00d4ff] bg-[#00d4ff]/15 text-[#00d4ff] shadow-[0_0_12px_rgba(0,212,255,0.5)]"
                          : idx === 1
                          ? "border-2 border-[#38bdf8] bg-[#38bdf8]/15 text-[#38bdf8] shadow-[0_0_10px_rgba(56,189,248,0.4)]"
                          : idx === 2
                          ? "border-2 border-[#60a5fa] bg-[#60a5fa]/15 text-[#60a5fa] shadow-[0_0_10px_rgba(96,165,250,0.3)]"
                          : "border border-white/20 bg-white/5 text-white/60"
                      }`}
                    >
                      {row.rank}
                    </div>
                  </div>

                  {/* Contributor */}
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={row.avatar}
                      alt=""
                      className="h-7 w-7 shrink-0 rounded-full border border-white/15 object-cover"
                    />
                    <span className="truncate text-[13px] font-medium text-white">{row.name}</span>
                  </div>

                  {/* Domain */}
                  <span className="truncate text-[12px] font-medium text-[#38bdf8]">{row.domain}</span>

                  {/* Andro Points Single Column */}
                  <span className="text-right font-mono text-[13px] font-bold text-white sm:text-[14px]">
                    {row.points}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Recruitment call to action ── */}
          <div className="relative z-10 mt-8 flex flex-col items-center gap-3 text-center sm:mt-10">
            <p className="text-[13px] text-white/60 sm:text-[14px]">Want your name on this board? Recruitment is open.</p>
            <Link href="/join" className="btn-glow" data-cursor-text="Join">
              Join now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
