import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---- fakes for everything outside the route: Next's after(), the database, the sheet and email
const h = vi.hoisted(() => ({ afterTasks: [] as Array<Promise<unknown>> }));

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return { ...actual, after: (fn: () => unknown) => void h.afterTasks.push(Promise.resolve().then(fn)) };
});
vi.mock("@/lib/recruitment/sheets", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/recruitment/sheets")>();
  return { ...actual, appendApplication: vi.fn() };
});
vi.mock("@/lib/recruitment/email", () => ({ sendConfirmation: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { application: { create: vi.fn(), update: vi.fn() } },
}));

import { Prisma } from "@prisma/client";
import { POST } from "@/app/api/recruitment/route";
import { prisma } from "@/lib/prisma";
import { sendConfirmation } from "@/lib/recruitment/email";
import { resetRateLimits } from "@/lib/recruitment/rate-limit";
import { appendApplication, SheetsNotConfiguredError } from "@/lib/recruitment/sheets";

const payload = {
  name: "Priya K",
  registerNo: "RA2511026020025",
  department: "CSE AIML A",
  year: "second",
  phone: "9876543210",
  email: "priya@college.edu",
  profile: "https://github.com/priya",
  domain: "web",
  answers: {
    why_join: "Genuine passion for the craft",
    elevator: "Debugging the elevator's embedded firmware",
    web_center_div: "margin: auto, obviously. Or vibes.",
    web_faction: "Full-Stack",
    web_faction_reason: "I can blame myself for both halves.",
    web_deploy_fail: "My fault. Roll back to the previous release tag and do the post-mortem later.",
    web_showcase: "https://github.com/priya/realtime-leaderboard",
  },
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
  vi.mocked(prisma.application.create).mockResolvedValue({} as never);
  vi.mocked(prisma.application.update).mockResolvedValue({} as never);
  vi.mocked(appendApplication).mockResolvedValue(7);
  vi.mocked(sendConfirmation).mockResolvedValue(undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "log").mockImplementation(() => undefined);
});
afterEach(() => vi.clearAllMocks());

const duplicateError = () =>
  new Prisma.PrismaClientKnownRequestError("unique", { code: "P2002", clientVersion: "test" });

describe("POST /api/recruitment: happy path", () => {
  it("saves to the database, returns 201 with a reference, then emails and mirrors to the sheet", async () => {
    const res = await apply(payload);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.reference).toMatch(/^REC-[0-9A-F]{8}$/);

    expect(prisma.application.create).toHaveBeenCalledTimes(1);
    const { data } = vi.mocked(prisma.application.create).mock.calls[0][0];
    expect(data).toMatchObject({ email: "priya@college.edu", emailKey: "priya@college.edu", registerNo: "RA2511026020025", phone: "9876543210", domain: "web", consent: true, reference: body.reference });
    expect(data.answers).toMatchObject({ web_faction: "Full-Stack", why_join: "Genuine passion for the craft" });

    await settleAfter();
    expect(sendConfirmation).toHaveBeenCalledWith(expect.objectContaining({ reference: body.reference }));
    expect(appendApplication).toHaveBeenCalledWith(expect.objectContaining({ reference: body.reference }), "sent");
  });

  it("still accepts the application when the confirmation email fails, and mirrors it as failed", async () => {
    vi.mocked(sendConfirmation).mockRejectedValue(new Error("smtp down"));
    const res = await apply(payload);
    expect(res.status).toBe(201);
    await settleAfter();
    expect(appendApplication).toHaveBeenCalledWith(expect.anything(), "failed");
  });

  it("still returns 201 when the sheet is unconfigured or down: the database has the application", async () => {
    vi.mocked(appendApplication).mockRejectedValue(new SheetsNotConfiguredError("nope"));
    expect((await apply(payload)).status).toBe(201);
    await settleAfter();
    vi.mocked(appendApplication).mockRejectedValue({ status: 503 });
    expect((await apply({ ...payload, email: "other@college.edu" })).status).toBe(201);
    await settleAfter();
  });
});

describe("POST /api/recruitment: duplicates and failures", () => {
  it("rejects an email already in the database with 409 and sends nothing", async () => {
    vi.mocked(prisma.application.create).mockRejectedValue(duplicateError());
    const res = await apply(payload);
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/already been submitted/);
    await settleAfter();
    expect(appendApplication).not.toHaveBeenCalled();
    expect(sendConfirmation).not.toHaveBeenCalled();
  });

  it("returns 503 when the database is down", async () => {
    vi.mocked(prisma.application.create).mockRejectedValue(new Error("db down"));
    const res = await apply(payload);
    expect(res.status).toBe(503);
    expect((await res.json()).success).toBe(false);
  });
});

describe("POST /api/recruitment: one domain per application", () => {
  it("stores only the chosen domain's answers and ignores another domain's", async () => {
    const res = await apply({ ...payload, answers: { ...payload.answers, media_gear: "DSLR", tech_github: "https://github.com/x" } });
    expect(res.status).toBe(201);
    const { data } = vi.mocked(prisma.application.create).mock.calls[0][0];
    expect(data.domain).toBe("web");
    expect(Object.keys(data.answers as object)).not.toContain("media_gear");
    expect(Object.keys(data.answers as object)).not.toContain("tech_github");
  });

  it("requires the chosen domain's questions (400 with the question ids as field errors)", async () => {
    const res = await apply({ ...payload, domain: "media" }); // web answers do not satisfy media
    expect(res.status).toBe(400);
    expect(Object.keys((await res.json()).fieldErrors)).toEqual(expect.arrayContaining(["media_gear", "media_portfolio"]));
    expect(prisma.application.create).not.toHaveBeenCalled();
  });

  it("rejects an unknown domain", async () => {
    expect((await apply({ ...payload, domain: "cooking" })).status).toBe(400);
  });
});

describe("POST /api/recruitment: validation and abuse protection", () => {
  it("returns 400 with field errors for bad input and touches nothing", async () => {
    const res = await apply({ ...payload, email: "nope", answers: { ...payload.answers, web_faction: "Fullstack-ish" } });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(Object.keys(body.fieldErrors)).toEqual(expect.arrayContaining(["email", "web_faction"]));
    expect(prisma.application.create).not.toHaveBeenCalled();
  });

  it("gives friendly messages for missing fields", async () => {
    const res = await apply({});
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(JSON.stringify(body)).not.toMatch(/expected string|Invalid input/);
  });

  it("rejects malformed JSON and oversized bodies", async () => {
    expect((await apply("{not json")).status).toBe(400);
    const huge = JSON.stringify({ ...payload, profile: "x".repeat(64 * 1024) });
    expect((await apply(huge)).status).toBe(413);
  });

  it("pretends success for the honeypot but stores and sends nothing", async () => {
    const res = await apply({ ...payload, website: "http://spam.example" });
    expect(res.status).toBe(201);
    expect(prisma.application.create).not.toHaveBeenCalled();
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
    expect(prisma.application.create).not.toHaveBeenCalled();
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
