import { describe, expect, it, vi } from "vitest";
import { isTransient, safe, SheetsNotConfiguredError, toRow, withRetry } from "@/lib/recruitment/sheets";
import type { StoredApplication } from "@/lib/recruitment/schema";

const app: StoredApplication = {
  reference: "REC-ABCD1234", submittedAt: "2026-10-06T10:00:00.000Z", name: "Priya", email: "priya@college.edu",
  year: "second", domain: "web", skills: "skills text here", motivation: "motivation", domainAnswer: "answer",
  portfolioUrl: "", consent: true,
};

describe("safe (spreadsheet formula injection)", () => {
  it.each(["=SUM(A1)", "+1", "-1", "@cmd"])("prefixes %s", (v) => expect(safe(v)).toBe(`'${v}`));
  it("leaves normal text alone", () => expect(safe("Priya K")).toBe("Priya K"));
});

describe("toRow", () => {
  it("matches the 12-column contract in order", () => {
    const row = toRow(app, "pending");
    expect(row).toHaveLength(12);
    expect(row[0]).toBe("REC-ABCD1234");
    expect(row[9]).toBe("TRUE");
    expect(row[10]).toBe("pending");
    expect(row[11]).toBe("answer");
  });
  it("neutralises formulas in free-text columns", () => {
    const row = toRow({ ...app, name: '=HYPERLINK("x")', motivation: "+evil", domainAnswer: "@x" }, "sent");
    expect(row[2].startsWith("'")).toBe(true);
    expect(row[7].startsWith("'")).toBe(true);
    expect(row[11].startsWith("'")).toBe(true);
  });
});

describe("isTransient", () => {
  it("retries rate limits, timeouts and server errors", () => {
    expect(isTransient({ status: 429 })).toBe(true);
    expect(isTransient({ response: { status: 503 } })).toBe(true);
    expect(isTransient({ code: "ETIMEDOUT" })).toBe(true);
    expect(isTransient({ code: "ECONNRESET" })).toBe(true);
  });
  it("does not retry client errors or missing configuration", () => {
    expect(isTransient({ status: 400 })).toBe(false);
    expect(isTransient({ status: 403 })).toBe(false);
    expect(isTransient(new SheetsNotConfiguredError("x"))).toBe(false);
    expect(isTransient(new Error("boom"))).toBe(false);
  });
});

describe("withRetry", () => {
  const noSleep = { sleep: async () => undefined };

  it("returns after a transient failure succeeds", async () => {
    const fn = vi.fn().mockRejectedValueOnce({ status: 503 }).mockResolvedValueOnce("ok");
    await expect(withRetry(fn, noSleep)).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });
  it("gives up after the attempt limit and rethrows", async () => {
    const fn = vi.fn().mockRejectedValue({ status: 500 });
    await expect(withRetry(fn, { ...noSleep, attempts: 3 })).rejects.toEqual({ status: 500 });
    expect(fn).toHaveBeenCalledTimes(3);
  });
  it("does not retry permanent errors", async () => {
    const fn = vi.fn().mockRejectedValue({ status: 403 });
    await expect(withRetry(fn, noSleep)).rejects.toBeDefined();
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it("backs off exponentially", async () => {
    const sleep = vi.fn(async (_ms: number) => undefined);
    const fn = vi.fn().mockRejectedValue({ status: 503 });
    await withRetry(fn, { attempts: 3, baseMs: 100, sleep }).catch(() => undefined);
    expect(sleep.mock.calls.map((c) => c[0])).toEqual([100, 200]);
  });
});
