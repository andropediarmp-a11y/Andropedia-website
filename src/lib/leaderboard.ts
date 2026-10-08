import type { DomainType, LeaderboardEntry } from "./types";

// Leaderboard maths, kept free of any database code so it can be tested directly.
// Everything is computed from graded evaluations: no stored point totals, no random values.

export interface BoardUser {
  id: string;
  name: string;
  avatar: string;
  domain: DomainType;
}

export interface BoardEvaluation {
  userId: string;
  weekId: string;
  weekNumber: number;
  score: number;
  evaluatedAt: Date;
}

export type BoardPeriod = "all-time" | "weekly" | "monthly";

export interface BoardInput {
  users: BoardUser[];
  evaluations: BoardEvaluation[];
  /** The week currently open for submissions, if any. Used for the "weekly" view. */
  activeWeekId?: string | null;
  now?: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const DOMAIN_BADGE: Partial<Record<DomainType, string>> = {
  Web: "Fullstack Pioneer",
  Technical: "Algo Titan",
  "R&D": "Deep Innovator",
  Design: "Visual Architect",
};

/**
 * Evaluations that count for a period:
 *  - all-time: everything
 *  - weekly:   the open week, or the most recent week with grades if none is open
 *  - monthly:  graded in the last 30 days
 */
export function evaluationsForPeriod(
  evaluations: BoardEvaluation[],
  period: BoardPeriod,
  activeWeekId: string | null | undefined,
  now: Date
): BoardEvaluation[] {
  if (period === "monthly") {
    const since = now.getTime() - 30 * DAY_MS;
    return evaluations.filter((e) => e.evaluatedAt.getTime() >= since);
  }
  if (period === "weekly") {
    let weekId = activeWeekId ?? null;
    if (!weekId && evaluations.length > 0) {
      weekId = evaluations.reduce((latest, e) => (e.weekNumber > latest.weekNumber ? e : latest)).weekId;
    }
    return weekId ? evaluations.filter((e) => e.weekId === weekId) : [];
  }
  return evaluations;
}

/**
 * Consecutive weeks with a graded task, ending at the latest graded week in the club (or the one
 * before it, so a member whose latest task simply hasn't been graded yet keeps their streak).
 */
export function streakWeeks(userWeekNumbers: number[], latestClubWeek: number): number {
  const weeks = new Set(userWeekNumbers);
  let cursor = weeks.has(latestClubWeek) ? latestClubWeek : weeks.has(latestClubWeek - 1) ? latestClubWeek - 1 : null;
  if (cursor === null) return 0;
  let streak = 0;
  while (weeks.has(cursor)) {
    streak++;
    cursor--;
  }
  return streak;
}

function rankEntries(users: BoardUser[], evaluations: BoardEvaluation[]) {
  const totals = new Map<string, { total: number; count: number }>();
  for (const e of evaluations) {
    const t = totals.get(e.userId) ?? { total: 0, count: 0 };
    t.total += e.score;
    t.count += 1;
    totals.set(e.userId, t);
  }
  return users
    .map((u) => ({ user: u, total: totals.get(u.id)?.total ?? 0, count: totals.get(u.id)?.count ?? 0 }))
    .sort((a, b) => b.total - a.total || a.user.name.localeCompare(b.user.name, undefined, { sensitivity: "base" }));
}

export function computeLeaderboard(input: BoardInput, domain: DomainType | "All" = "All", period: BoardPeriod = "all-time"): LeaderboardEntry[] {
  const now = input.now ?? new Date();
  const users = domain === "All" ? input.users : input.users.filter((u) => u.domain === domain);
  const inPeriod = evaluationsForPeriod(input.evaluations, period, input.activeWeekId, now);
  const ranked = rankEntries(users, inPeriod);

  // Rank change = places gained since before the latest graded week (all-time view only).
  const latestWeek = input.evaluations.reduce((m, e) => Math.max(m, e.weekNumber), 0);
  const previousRank = new Map<string, number>();
  if (period === "all-time" && latestWeek > 0) {
    const before = input.evaluations.filter((e) => e.weekNumber < latestWeek);
    if (before.length > 0) rankEntries(users, before).forEach((r, i) => previousRank.set(r.user.id, i + 1));
  }

  const weeksByUser = new Map<string, number[]>();
  for (const e of input.evaluations) weeksByUser.set(e.userId, [...(weeksByUser.get(e.userId) ?? []), e.weekNumber]);
  const allTime = new Map<string, number>();
  for (const e of input.evaluations) allTime.set(e.userId, (allTime.get(e.userId) ?? 0) + e.score);

  return ranked.map((r, index) => {
    const rank = index + 1;
    const streak = streakWeeks(weeksByUser.get(r.user.id) ?? [], latestWeek);
    const prev = previousRank.get(r.user.id);

    const badges: string[] = [];
    if ((allTime.get(r.user.id) ?? 0) >= 350) badges.push("Grandmaster");
    if (streak >= 4) badges.push("Streak Fire");
    const domainBadge = DOMAIN_BADGE[r.user.domain];
    if (domainBadge) badges.push(domainBadge);

    return {
      rank,
      userId: r.user.id,
      name: r.user.name,
      avatar: r.user.avatar,
      domain: r.user.domain,
      totalScore: r.total,
      avgScore: r.count > 0 ? Math.round(r.total / r.count) : 0,
      tasksCompleted: r.count,
      streakWeeks: streak,
      rankChange: prev === undefined ? 0 : prev - rank,
      badges,
    };
  });
}
