import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---- fakes for everything outside the route: Next's after(), the sheet, email and the outbox
const h = vi.hoisted(() => ({ afterTasks: [] as Array<Promise<unknown>> }));

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return { ...actual, after: (fn: () => unknown) => void h.afterTasks.push(Promise.resolve().then(fn)) };
});
vi.mock("@/lib/recruitment/sheets", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/recruitment/sheets")>();
  return { ...actual, appendApplication: vi.fn(), emailExists: vi.fn(), setEmailStatus: vi.fn() };
});
vi.mock("@/lib/recruitment/email", () => ({ sendConfirmation: vi.fn() }));
vi.mock("@/lib/recruitment/outbox", () => ({
  queueApplication: vi.fn(),
  outboxHasEmail: vi.fn(),
  markOutboxEmailSent: vi.fn(),
}));

import { POST } from "@/app/api/recruitment/route";
import { sendConfirmation } from "@/lib/recruitment/email";
import { markOutboxEmailSent, outboxHasEmail, queueApplication } from "@/lib/recruitment/outbox";
import { resetRateLimits } from "@/lib/recruitment/rate-limit";
import { appendApplication, emailExists, setEmailStatus, SheetsNotConfiguredError } from "@/lib/recruitment/sheets";

const payload = {
  name: "Priya K",
  email: "priya@college.edu",
  year: "second",
  domain: "web",
  skills: "Built two Next.js apps and a REST API in Node.",
  motivation: "I want to build real systems with a team and learn from the weekly sprint cycle.",
  domainAnswer: "A realtime leaderboard using SSE and Postgres; I would pick Next.js for shared types.",
  portfolioUrl: "",
  consent: true,
};

let ipCounter = 0;
function apply(body: unknown, headers: Record<string, string> = {}) {
  return POST(
    new NextRequest("http://localhost/api/recruitment", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
      headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${++ipCounter}`, ...headers },
    })
  );
}
const settleAfter = () => Promise.all(h.afterTasks.splice(0));

beforeEach(() => {
  resetRateLimits();
  h.afterTasks.length = 0;
  for (const k of ["RECRUITMENT_OPEN", "RECRUITMENT_OPENS_AT", "RECRUITMENT_CLOSES_AT", "RECRUITMENT_ALLOWED_EMAIL_DOMAINS"]) delete process.env[k];
  vi.mocked(emailExists).mockResolvedValue(false);
  vi.mocked(outboxHasEmail).mockResolvedValue(false);
  vi.mocked(appendApplication).mockResolvedValue(7);
  vi.mocked(queueApplication).mockResolvedValue("queued");
  vi.mocked(sendConfirmation).mockResolvedValue(undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "log").mockImplementation(() => undefined);
});
afterEach(() => vi.clearAllMocks());

describe("POST /api/recruitment: happy path", () => {
  it("saves to the sheet, returns 201 with a reference, then emails and marks the row", async () => {
    const res = await apply(payload);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.reference).toMatch(/^REC-[0-9A-F]{8}$/);

    expect(appendApplication).toHaveBeenCalledTimes(1);
    const saved = vi.mocked(appendApplication).mock.calls[0][0];
    expect(saved).toMatchObject({ email: "priya@college.edu", domain: "web", consent: true, reference: body.reference });
    expect(saved.domainAnswer).toContain("realtime leaderboard");

    await settleAfter();
    expect(sendConfirmation).toHaveBeenCalledWith(expect.objectContaining({ reference: body.reference }));
    expect(setEmailStatus).toHaveBeenCalledWith(7, "sent");
    expect(queueApplication).not.toHaveBeenCalled();
  });

  it("still accepts the application when the confirmation email fails, and marks it failed", async () => {
    vi.mocked(sendConfirmation).mockRejectedValue(new Error("smtp down"));
    const res = await apply(payload);
    expect(res.status).toBe(201);
    await settleAfter();
    expect(setEmailStatus).toHaveBeenCalledWith(7, "failed");
  });
});

describe("POST /api/recruitment: duplicates", () => {
  it("rejects an email already in the sheet with 409 and writes nothing", async () => {
    vi.mocked(emailExists).mockResolvedValue(true);
    const res = await apply(payload);
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/already been submitted/);
    expect(appendApplication).not.toHaveBeenCalled();
    expect(queueApplication).not.toHaveBeenCalled();
    await settleAfter();
    expect(sendConfirmation).not.toHaveBeenCalled();
  });

  it("rejects an email already waiting in the outbox", async () => {
    vi.mocked(outboxHasEmail).mockResolvedValue(true);
    expect((await apply(payload)).status).toBe(409);
    expect(appendApplication).not.toHaveBeenCalled();
  });

  it("blocks two simultaneous submissions for the same email", async () => {
    let release!: (v: boolean) => void;
    vi.mocked(emailExists).mockImplementationOnce(() => new Promise<boolean>((r) => (release = r)));
    const first = apply(payload);
    await Promise.resolve();
    const second = await apply({ ...payload, name: "Priya Again" });
    expect(second.status).toBe(409);
    release(false);
    expect((await first).status).toBe(201);
    expect(appendApplication).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/recruitment: validation and abuse protection", () => {
  it("returns 400 with field errors for bad input and touches nothing", async () => {
    const res = await apply({ ...payload, email: "nope", domainAnswer: "short" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(Object.keys(body.fieldErrors)).toEqual(expect.arrayContaining(["email", "domainAnswer"]));
    expect(appendApplication).not.toHaveBeenCalled();
  });

  it("gives friendly messages for missing fields", async () => {
    const res = await apply({});
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(JSON.stringify(body)).not.toMatch(/expected string|Invalid input/);
  });

  it("rejects malformed JSON and oversized bodies", async () => {
    expect((await apply("{not json")).status).toBe(400);
    const huge = JSON.stringify({ ...payload, motivation: "x".repeat(64 * 1024) });
    expect((await apply(huge)).status).toBe(413);
  });

  it("pretends success for the honeypot but stores and sends nothing", async () => {
    const res = await apply({ ...payload, website: "http://spam.example" });
    expect(res.status).toBe(201);
    expect(appendApplication).not.toHaveBeenCalled();
    expect(queueApplication).not.toHaveBeenCalled();
    await settleAfter();
    expect(sendConfirmation).not.toHaveBeenCalled();
  });

  it("rate limits one IP after 5 submissions, with Retry-After", async () => {
    const same = { "x-forwarded-for": "203.0.113.9" };
    for (let i = 0; i < 5; i++) {
      await apply({ ...payload, email: `p${i}@college.edu` }, same);
    }
    const res = await apply({ ...payload, email: "p6@college.edu" }, same);
    expect(res.status).toBe(429);
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
  });

  it("enforces the optional email-domain allow-list", async () => {
    process.env.RECRUITMENT_ALLOWED_EMAIL_DOMAINS = "college.edu";
    const bad = await apply({ ...payload, email: "priya@gmail.com" });
    expect(bad.status).toBe(400);
    expect((await bad.json()).fieldErrors.email[0]).toMatch(/college email/i);
    expect((await apply(payload)).status).toBe(201);
  });
});

describe("POST /api/recruitment: deadline and open/close are enforced on the server", () => {
  it("returns 403 when closed by the kill switch", async () => {
    process.env.RECRUITMENT_OPEN = "false";
    const res = await apply(payload);
    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/closed/i);
    expect(appendApplication).not.toHaveBeenCalled();
  });

  it("returns 403 after the deadline", async () => {
    process.env.RECRUITMENT_CLOSES_AT = "2020-01-01T00:00:00Z";
    const res = await apply(payload);
    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/deadline/i);
  });

  it("returns 403 before the opening date", async () => {
    process.env.RECRUITMENT_OPENS_AT = "2999-01-01T00:00:00Z";
    expect((await apply(payload)).status).toBe(403);
  });

  it("accepts applications inside the window", async () => {
    process.env.RECRUITMENT_OPENS_AT = "2020-01-01T00:00:00Z";
    process.env.RECRUITMENT_CLOSES_AT = "2999-01-01T00:00:00Z";
    expect((await apply(payload)).status).toBe(201);
  });
});

describe("POST /api/recruitment: no lost applications when the sheet is unavailable", () => {
  it("queues in the outbox (202) when the sheet write fails, then emails and records it", async () => {
    vi.mocked(appendApplication).mockRejectedValue({ status: 503 });
    const res = await apply(payload);
    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body).toMatchObject({ success: true, queued: true });
    expect(queueApplication).toHaveBeenCalledWith(expect.objectContaining({ reference: body.reference, email: "priya@college.edu" }));
    await settleAfter();
    expect(sendConfirmation).toHaveBeenCalled();
    expect(markOutboxEmailSent).toHaveBeenCalledWith(body.reference);
    expect(setEmailStatus).not.toHaveBeenCalled();
  });

  it("queues without trying to write when the sheet is not configured", async () => {
    vi.mocked(emailExists).mockRejectedValue(new SheetsNotConfiguredError("nope"));
    const res = await apply(payload);
    expect(res.status).toBe(202);
    expect(appendApplication).not.toHaveBeenCalled();
    expect(queueApplication).toHaveBeenCalledTimes(1);
  });

  it("reports a duplicate found by the outbox's unique constraint", async () => {
    vi.mocked(appendApplication).mockRejectedValue({ status: 500 });
    vi.mocked(queueApplication).mockResolvedValue("duplicate");
    expect((await apply(payload)).status).toBe(409);
  });

  it("only returns 503 when both the sheet and the database fail", async () => {
    vi.mocked(appendApplication).mockRejectedValue({ status: 500 });
    vi.mocked(queueApplication).mockRejectedValue(new Error("db down"));
    const res = await apply(payload);
    expect(res.status).toBe(503);
    expect((await res.json()).success).toBe(false);
  });
});
