import { describe, expect, it } from "vitest";
import {
  computeLeaderboard,
  evaluationsForPeriod,
  streakWeeks,
  type BoardEvaluation,
  type BoardUser,
} from "@/lib/leaderboard";

const users: BoardUser[] = [
  { id: "a", name: "Asha", avatar: "", domain: "Web" },
  { id: "b", name: "Bilal", avatar: "", domain: "Web" },
  { id: "c", name: "Chitra", avatar: "", domain: "Design" },
  { id: "d", name: "Dev", avatar: "", domain: "Technical" },
];

const NOW = new Date("2026-10-20T12:00:00Z");
const ev = (userId: string, weekNumber: number, score: number, evaluatedAt: string): BoardEvaluation => ({
  userId, weekId: `w${weekNumber}`, weekNumber, score, evaluatedAt: new Date(evaluatedAt),
});

const evaluations: BoardEvaluation[] = [
  ev("a", 1, 80, "2026-09-05T00:00:00Z"),
  ev("a", 2, 90, "2026-09-12T00:00:00Z"),
  ev("a", 3, 70, "2026-10-15T00:00:00Z"),
  ev("b", 1, 95, "2026-09-05T00:00:00Z"),
  ev("b", 3, 85, "2026-10-15T00:00:00Z"),
  ev("c", 3, 60, "2026-10-16T00:00:00Z"),
];

describe("computeLeaderboard (all time)", () => {
  const board = computeLeaderboard({ users, evaluations, activeWeekId: "w3", now: NOW });
  const by = (id: string) => board.find((e) => e.userId === id)!;

  it("ranks by total score, highest first, with distinct ranks", () => {
    expect(board.map((e) => [e.userId, e.totalScore, e.rank])).toEqual([
      ["a", 240, 1],
      ["b", 180, 2],
      ["c", 60, 3],
      ["d", 0, 4],
    ]);
  });

  it("computes tasks completed and average from real evaluations", () => {
    expect(by("a")).toMatchObject({ tasksCompleted: 3, avgScore: 80 });
    expect(by("d")).toMatchObject({ tasksCompleted: 0, avgScore: 0, totalScore: 0 });
  });

  it("is deterministic: the same input always gives the same board (no random rank arrows)", () => {
    const again = computeLeaderboard({ users, evaluations, activeWeekId: "w3", now: NOW });
    expect(again).toEqual(board);
  });

  it("breaks ties alphabetically", () => {
    const tied = computeLeaderboard({ users: users.slice(0, 2), evaluations: [ev("a", 1, 50, "2026-09-01T00:00:00Z"), ev("b", 1, 50, "2026-09-01T00:00:00Z")], now: NOW });
    expect(tied.map((e) => e.name)).toEqual(["Asha", "Bilal"]);
  });

  it("calculates rank change against the standings before the latest graded week", () => {
    // Before week 3: a=170, b=95 (a first, b second). After week 3: a=240, b=180 (same order).
    expect(by("a").rankChange).toBe(0);
    // c had nothing before week 3 (rank 3 of 4 among zeros/alphabetical), so compare explicit moves:
    const moved = computeLeaderboard({
      users: users.slice(0, 2),
      evaluations: [ev("a", 1, 50, "2026-09-01T00:00:00Z"), ev("b", 1, 40, "2026-09-01T00:00:00Z"), ev("b", 2, 60, "2026-09-08T00:00:00Z")],
      now: NOW,
    });
    // After week 2 b leads (100 vs 50); before it a led (50 vs 40).
    expect(moved.find((e) => e.userId === "b")!.rankChange).toBe(1);
    expect(moved.find((e) => e.userId === "a")!.rankChange).toBe(-1);
  });

  it("reports no rank change when nothing was graded before the latest week", () => {
    const single = computeLeaderboard({ users, evaluations: [ev("a", 1, 50, "2026-09-01T00:00:00Z")], now: NOW });
    expect(single.every((e) => e.rankChange === 0)).toBe(true);
  });
});

describe("filters", () => {
  it("filters by domain and re-ranks within it", () => {
    const web = computeLeaderboard({ users, evaluations, now: NOW }, "Web");
    expect(web.map((e) => [e.userId, e.rank])).toEqual([["a", 1], ["b", 2]]);
  });

  it("weekly shows only the open week", () => {
    const weekly = computeLeaderboard({ users, evaluations, activeWeekId: "w3", now: NOW }, "All", "weekly");
    expect(weekly.map((e) => [e.userId, e.totalScore])).toEqual([["b", 85], ["a", 70], ["c", 60], ["d", 0]]);
  });

  it("weekly falls back to the latest graded week when none is open", () => {
    const weekly = computeLeaderboard({ users, evaluations, activeWeekId: null, now: NOW }, "All", "weekly");
    expect(weekly[0]).toMatchObject({ userId: "b", totalScore: 85 });
  });

  it("monthly counts only evaluations from the last 30 days", () => {
    const monthly = computeLeaderboard({ users, evaluations, now: NOW }, "All", "monthly");
    expect(monthly.map((e) => [e.userId, e.totalScore])).toEqual([["b", 85], ["a", 70], ["c", 60], ["d", 0]]);
  });

  it("evaluationsForPeriod returns nothing for 'weekly' when there are no grades", () => {
    expect(evaluationsForPeriod([], "weekly", null, NOW)).toEqual([]);
  });
});

describe("streakWeeks", () => {
  it("counts consecutive weeks ending at the latest club week", () => {
    expect(streakWeeks([1, 2, 3, 4], 4)).toBe(4);
    expect(streakWeeks([1, 3, 4], 4)).toBe(2);
  });
  it("keeps the streak if the latest week simply isn't graded yet", () => {
    expect(streakWeeks([2, 3, 4], 5)).toBe(3);
  });
  it("is zero when the member missed the last two weeks", () => {
    expect(streakWeeks([1, 2], 5)).toBe(0);
    expect(streakWeeks([], 3)).toBe(0);
  });
});

describe("badges", () => {
  it("awards Grandmaster at 350 all-time points and Streak Fire at 4 weeks, plus the domain badge", () => {
    const many = [1, 2, 3, 4].map((w) => ev("a", w, 90, `2026-10-0${w}T00:00:00Z`));
    const entry = computeLeaderboard({ users, evaluations: many, now: NOW })[0];
    expect(entry.badges).toEqual(expect.arrayContaining(["Grandmaster", "Streak Fire", "Fullstack Pioneer"]));
  });
  it("does not award Grandmaster below 350", () => {
    expect(computeLeaderboard({ users, evaluations, now: NOW })[0].badges).not.toContain("Grandmaster");
  });
});
