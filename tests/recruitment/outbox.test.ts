import { Prisma } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  create: vi.fn(),
  count: vi.fn(),
  updateMany: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { recruitmentOutbox: db } }));
vi.mock("@/lib/recruitment/sheets", () => ({
  appendApplication: vi.fn(),
  emailExists: vi.fn(),
  findRowByReference: vi.fn(),
  setEmailStatus: vi.fn(),
}));
vi.mock("@/lib/recruitment/email", () => ({ sendConfirmation: vi.fn() }));

import { sendConfirmation } from "@/lib/recruitment/email";
import { flushOutbox, queueApplication } from "@/lib/recruitment/outbox";
import { appendApplication, emailExists, findRowByReference, setEmailStatus } from "@/lib/recruitment/sheets";
import type { StoredApplication } from "@/lib/recruitment/schema";

const app: StoredApplication = {
  reference: "REC-AAAA1111", submittedAt: "2026-10-06T10:00:00.000Z", name: "Priya", registerNo: "RA2511026020025",
  department: "CSE AIML A", year: "second", phone: "9876543210", email: "priya@college.edu",
  profile: "https://github.com/priya", domain: "web",
  answers: { why_join: "Genuine passion for the craft", web_faction: "Full-Stack" }, consent: true,
};
const queued = (over = {}) => ({ id: "o1", reference: app.reference, payload: app, emailSentAt: null, ...over });

beforeEach(() => {
  vi.mocked(findRowByReference).mockResolvedValue(null);
  vi.mocked(emailExists).mockResolvedValue(false);
  vi.mocked(appendApplication).mockResolvedValue(12);
  vi.mocked(sendConfirmation).mockResolvedValue(undefined);
  vi.mocked(setEmailStatus).mockResolvedValue(undefined);
  db.update.mockResolvedValue({});
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});
afterEach(() => vi.clearAllMocks());

describe("queueApplication", () => {
  it("stores the application keyed by a hash of the email, not the address", async () => {
    db.create.mockResolvedValue({});
    expect(await queueApplication(app)).toBe("queued");
    const data = db.create.mock.calls[0][0].data;
    expect(data.reference).toBe(app.reference);
    expect(data.emailHash).toMatch(/^[0-9a-f]{64}$/);
    expect(data.emailHash).not.toContain("priya");
  });

  it("reports a duplicate when the unique constraint trips", async () => {
    db.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError("dup", { code: "P2002", clientVersion: "7" }));
    expect(await queueApplication(app)).toBe("duplicate");
  });

  it("rethrows other database errors", async () => {
    db.create.mockRejectedValue(new Error("connection lost"));
    await expect(queueApplication(app)).rejects.toThrow("connection lost");
  });
});

describe("flushOutbox", () => {
  it("writes a waiting application to the sheet, sends the email, and clears the stored answers", async () => {
    db.findMany.mockResolvedValue([queued()]);
    const r = await flushOutbox();
    expect(r).toEqual({ waiting: 1, flushed: 1, duplicates: 0, failed: 0 });
    expect(appendApplication).toHaveBeenCalledWith(app, "pending");
    expect(sendConfirmation).toHaveBeenCalledTimes(1);
    expect(setEmailStatus).toHaveBeenCalledWith(12, "sent");
    const update = db.update.mock.calls[0][0].data;
    expect(update.payload).toEqual({});
    expect(update.sentAt).toBeInstanceOf(Date);
  });

  it("does not email again when the confirmation already went out", async () => {
    db.findMany.mockResolvedValue([queued({ emailSentAt: new Date() })]);
    await flushOutbox();
    expect(appendApplication).toHaveBeenCalledWith(app, "sent");
    expect(sendConfirmation).not.toHaveBeenCalled();
  });

  it("is idempotent: a reference already in the sheet is not written twice", async () => {
    vi.mocked(findRowByReference).mockResolvedValue(30);
    db.findMany.mockResolvedValue([queued({ emailSentAt: new Date() })]);
    const r = await flushOutbox();
    expect(appendApplication).not.toHaveBeenCalled();
    expect(r.flushed).toBe(1);
  });

  it("skips and reports an email that reached the sheet first", async () => {
    vi.mocked(emailExists).mockResolvedValue(true);
    db.findMany.mockResolvedValue([queued()]);
    const r = await flushOutbox();
    expect(appendApplication).not.toHaveBeenCalled();
    expect(r).toMatchObject({ duplicates: 1, flushed: 0 });
    expect(db.update.mock.calls[0][0].data.lastError).toMatch(/duplicate/);
  });

  it("keeps the application for the next run when the sheet is still down", async () => {
    vi.mocked(appendApplication).mockRejectedValue({ status: 503, message: "unavailable" });
    db.findMany.mockResolvedValue([queued()]);
    const r = await flushOutbox();
    expect(r.failed).toBe(1);
    const data = db.update.mock.calls[0][0].data;
    expect(data.attempts).toEqual({ increment: 1 });
    expect(data.sentAt).toBeUndefined();
    expect(data.payload).toBeUndefined(); // answers are kept until they reach the sheet
  });

  it("still marks the row done when only the email fails, and flags it for the resend script", async () => {
    vi.mocked(sendConfirmation).mockRejectedValue(new Error("smtp down"));
    db.findMany.mockResolvedValue([queued()]);
    const r = await flushOutbox();
    expect(r.flushed).toBe(1);
    expect(setEmailStatus).toHaveBeenCalledWith(12, "failed");
  });

  it("handles an empty outbox", async () => {
    db.findMany.mockResolvedValue([]);
    expect(await flushOutbox()).toEqual({ waiting: 0, flushed: 0, duplicates: 0, failed: 0 });
  });
});
