import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ $queryRaw: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));

import { rateLimit } from "@/lib/rate-limit-db";
import { resetRateLimits } from "@/lib/recruitment/rate-limit";

const NOW = 10_000_000;
beforeEach(() => {
  resetRateLimits();
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});
afterEach(() => vi.clearAllMocks());

describe("rateLimit (shared, database-backed)", () => {
  it("allows requests up to the limit", async () => {
    db.$queryRaw.mockResolvedValue([{ count: 3, windowStart: new Date(NOW) }]);
    expect((await rateLimit("k", 3, 60_000, NOW)).limited).toBe(false);
  });

  it("blocks beyond the limit and says when the window ends", async () => {
    db.$queryRaw.mockResolvedValue([{ count: 4, windowStart: new Date(NOW - 20_000) }]);
    const r = await rateLimit("k", 3, 60_000, NOW);
    expect(r.limited).toBe(true);
    expect(r.retryAfterSec).toBe(40);
  });

  it("falls back to the in-memory limit when the database is down, instead of failing open", async () => {
    db.$queryRaw.mockRejectedValue(new Error("connection refused"));
    expect((await rateLimit("k", 1, 60_000, NOW)).limited).toBe(false);
    expect((await rateLimit("k", 1, 60_000, NOW + 1)).limited).toBe(true);
  });
});
