import { describe, expect, it } from "vitest";
import { checkMemberChange, checkWeekDates, decideSubmission } from "@/lib/rules";

describe("decideSubmission", () => {
  it("creates a first submission in an open week", () => {
    expect(decideSubmission({ isActive: true }, null)).toEqual({ ok: true, action: "create" });
  });
  it("lets a member edit their submission while the week is open and it is not graded", () => {
    expect(decideSubmission({ isActive: true }, { status: "SUBMITTED" })).toEqual({ ok: true, action: "update" });
  });
  it("refuses a closed week", () => {
    expect(decideSubmission({ isActive: false }, null)).toMatchObject({ ok: false, status: 409 });
    expect(decideSubmission({ isActive: false }, { status: "SUBMITTED" })).toMatchObject({ ok: false, status: 409 });
  });
  it("locks a graded submission", () => {
    const d = decideSubmission({ isActive: true }, { status: "EVALUATED" });
    expect(d).toMatchObject({ ok: false, status: 409 });
    if (!d.ok) expect(d.error).toMatch(/already been graded/);
  });
  it("reports a missing week as 404", () => {
    expect(decideSubmission(null, null)).toMatchObject({ ok: false, status: 404 });
  });
});

describe("checkMemberChange", () => {
  const admin = { id: "root", role: "super_admin" as const, isActive: true };
  const member = { id: "m1", role: "member" as const, isActive: true };

  it("allows promoting a member", () => {
    expect(checkMemberChange({ actorId: "root", target: member, patch: { role: "domain_admin" }, activeSuperAdmins: 1 })).toBeNull();
  });
  it("rejects an empty change", () => {
    expect(checkMemberChange({ actorId: "root", target: member, patch: {}, activeSuperAdmins: 1 })).toMatch(/Nothing to change/);
  });
  it("blocks changing your own role or deactivating yourself", () => {
    expect(checkMemberChange({ actorId: "root", target: admin, patch: { role: "member" }, activeSuperAdmins: 3 })).toMatch(/your own/);
    expect(checkMemberChange({ actorId: "root", target: admin, patch: { isActive: false }, activeSuperAdmins: 3 })).toMatch(/your own/);
  });
  it("lets you change your own team position or domain", () => {
    expect(checkMemberChange({ actorId: "root", target: admin, patch: { position: "president" }, activeSuperAdmins: 1 })).toBeNull();
  });
  it("never removes the last active super admin", () => {
    expect(checkMemberChange({ actorId: "other", target: admin, patch: { role: "member" }, activeSuperAdmins: 1 })).toMatch(/At least one active super admin/);
    expect(checkMemberChange({ actorId: "other", target: admin, patch: { isActive: false }, activeSuperAdmins: 1 })).toMatch(/At least one active super admin/);
  });
  it("allows removing a super admin when another one remains", () => {
    expect(checkMemberChange({ actorId: "other", target: admin, patch: { role: "domain_admin" }, activeSuperAdmins: 2 })).toBeNull();
  });
  it("allows reactivating an inactive account", () => {
    expect(checkMemberChange({ actorId: "root", target: { ...member, isActive: false }, patch: { isActive: true }, activeSuperAdmins: 1 })).toBeNull();
  });
});

describe("checkWeekDates", () => {
  it("accepts a normal range and a single-day week", () => {
    expect(checkWeekDates(new Date("2026-10-01"), new Date("2026-10-08"))).toBeNull();
    expect(checkWeekDates(new Date("2026-10-01"), new Date("2026-10-01"))).toBeNull();
  });
  it("rejects an end before the start and invalid dates", () => {
    expect(checkWeekDates(new Date("2026-10-08"), new Date("2026-10-01"))).toMatch(/on or after/);
    expect(checkWeekDates(new Date("nope"), new Date("2026-10-01"))).toMatch(/valid/);
  });
});
