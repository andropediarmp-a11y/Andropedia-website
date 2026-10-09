import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ findMany: vi.fn(), update: vi.fn() }));

vi.mock("@/lib/prisma", () => ({ prisma: { application: db } }));
vi.mock("@/lib/recruitment/sheets", () => {
  class SheetsNotConfiguredError extends Error {}
  return {
    appendApplication: vi.fn(),
    findRowByReference: vi.fn(),
    sheetMirrorConfigured: vi.fn(),
    mirrorNeedsLookup: vi.fn(),
    SheetsNotConfiguredError,
  };
});
vi.mock("@/lib/recruitment/email", () => ({ sendConfirmation: vi.fn() }));

import { sendConfirmation } from "@/lib/recruitment/email";
import { syncPending } from "@/lib/recruitment/retry";
import { appendApplication, findRowByReference, mirrorNeedsLookup, sheetMirrorConfigured } from "@/lib/recruitment/sheets";

const row = (over = {}) => ({
  reference: "REC-AAAA1111", createdAt: new Date("2026-10-06T10:00:00Z"), name: "Priya", registerNo: "RA2511026020025",
  department: "CSE", year: "second", phone: "9876543210", email: "priya@college.edu", profile: "https://github.com/priya",
  domain: "web", answers: { why_join: "x" }, consent: true, sheetSyncedAt: null, emailSentAt: null, ...over,
});

beforeEach(() => {
  vi.mocked(sheetMirrorConfigured).mockReturnValue(true);
  vi.mocked(mirrorNeedsLookup).mockReturnValue(true);
  vi.mocked(findRowByReference).mockResolvedValue(null);
  vi.mocked(appendApplication).mockResolvedValue(5);
  vi.mocked(sendConfirmation).mockResolvedValue(undefined);
  db.update.mockResolvedValue({});
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});
afterEach(() => vi.clearAllMocks());

describe("syncPending", () => {
  it("only looks at rows older than the grace period and missing a sheet row or an email", async () => {
    db.findMany.mockResolvedValue([]);
    const now = new Date("2026-10-06T10:10:00Z");
    await syncPending(100, now);
    const where = db.findMany.mock.calls[0][0].where;
    expect(where.AND[0]).toEqual({ OR: [{ sheetSyncedAt: null }, { emailSentAt: null }] });
    expect(where.AND[1].createdAt.lt.getTime()).toBe(now.getTime() - 2 * 60 * 1000);
  });

  it("adds the sheet row and sends the email, recording both", async () => {
    db.findMany.mockResolvedValue([row()]);
    const r = await syncPending();
    expect(r).toEqual({ waiting: 1, sheetSynced: 1, emailsSent: 1, failed: 0 });
    expect(appendApplication).toHaveBeenCalledWith(expect.objectContaining({ reference: "REC-AAAA1111" }), "sent");
    const fields = db.update.mock.calls.map((c) => Object.keys(c[0].data)[0]);
    expect(fields).toEqual(["emailSentAt", "sheetSyncedAt"]);
  });

  it("does not write a second sheet row when the reference is already there", async () => {
    db.findMany.mockResolvedValue([row({ emailSentAt: new Date() })]);
    vi.mocked(findRowByReference).mockResolvedValue(9);
    const r = await syncPending();
    expect(appendApplication).not.toHaveBeenCalled();
    expect(sendConfirmation).not.toHaveBeenCalled();
    expect(r.sheetSynced).toBe(1);
  });

  it("keeps the row pending when the email fails, and still copies it to the sheet as failed", async () => {
    db.findMany.mockResolvedValue([row()]);
    vi.mocked(sendConfirmation).mockRejectedValue(new Error("smtp down"));
    const r = await syncPending();
    expect(r.failed).toBe(1);
    expect(r.emailsSent).toBe(0);
    expect(appendApplication).toHaveBeenCalledWith(expect.anything(), "failed");
    expect(db.update.mock.calls.map((c) => Object.keys(c[0].data)[0])).toEqual(["sheetSyncedAt"]);
  });

  it("leaves sheetSyncedAt empty when the sheet fails, and carries on with the next row", async () => {
    db.findMany.mockResolvedValue([row(), row({ reference: "REC-BBBB2222" })]);
    vi.mocked(appendApplication).mockRejectedValueOnce(new Error("503")).mockResolvedValueOnce(6);
    const r = await syncPending();
    expect(r.failed).toBe(1);
    expect(r.sheetSynced).toBe(1);
  });

  it("with no sheet configured, only looks for missing emails and never touches the sheet", async () => {
    vi.mocked(sheetMirrorConfigured).mockReturnValue(false);
    db.findMany.mockResolvedValue([row()]);
    const r = await syncPending();
    expect(db.findMany.mock.calls[0][0].where.AND[0]).toEqual({ emailSentAt: null });
    expect(findRowByReference).not.toHaveBeenCalled();
    expect(appendApplication).not.toHaveBeenCalled();
    expect(r).toEqual({ waiting: 1, sheetSynced: 0, emailsSent: 1, failed: 0 });
  });

  it("with the Apps Script web app, appends without a lookup (the script de-duplicates by reference)", async () => {
    vi.mocked(mirrorNeedsLookup).mockReturnValue(false);
    db.findMany.mockResolvedValue([row()]);
    const r = await syncPending();
    expect(findRowByReference).not.toHaveBeenCalled();
    expect(appendApplication).toHaveBeenCalledTimes(1);
    expect(r.sheetSynced).toBe(1);
  });
});
