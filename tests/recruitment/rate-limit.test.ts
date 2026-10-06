import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimits } from "@/lib/recruitment/rate-limit";

beforeEach(() => resetRateLimits());

describe("checkRateLimit", () => {
  it("allows up to the limit then blocks with a retry time", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 3; i++) expect(checkRateLimit("k", 3, 60_000, t0 + i).limited).toBe(false);
    const blocked = checkRateLimit("k", 3, 60_000, t0 + 10);
    expect(blocked.limited).toBe(true);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
    expect(blocked.retryAfterSec).toBeLessThanOrEqual(60);
  });
  it("frees the slot after the window passes", () => {
    const t0 = 5_000_000;
    checkRateLimit("k", 1, 1000, t0);
    expect(checkRateLimit("k", 1, 1000, t0 + 500).limited).toBe(true);
    expect(checkRateLimit("k", 1, 1000, t0 + 1001).limited).toBe(false);
  });
  it("tracks keys independently", () => {
    checkRateLimit("a", 1, 60_000, 1);
    expect(checkRateLimit("b", 1, 60_000, 2).limited).toBe(false);
  });
});
