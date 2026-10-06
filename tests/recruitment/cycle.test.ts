import { describe, expect, it } from "vitest";
import { getCycleStatus } from "@/lib/recruitment/cycle";

const at = (iso: string) => new Date(iso);

describe("getCycleStatus", () => {
  it("is open when nothing is configured", () => {
    expect(getCycleStatus(at("2026-10-10T10:00:00Z"), {}).state).toBe("open");
  });

  it("closes with the manual kill switch", () => {
    const s = getCycleStatus(at("2026-10-10T10:00:00Z"), { RECRUITMENT_OPEN: "false" });
    expect(s.state).toBe("closed");
    expect(s.message).toMatch(/closed/i);
  });

  it("is upcoming before the open date and open after it", () => {
    const env = { RECRUITMENT_OPENS_AT: "2026-10-12T00:00:00Z" };
    expect(getCycleStatus(at("2026-10-11T23:59:59Z"), env).state).toBe("upcoming");
    expect(getCycleStatus(at("2026-10-12T00:00:00Z"), env).state).toBe("open");
  });

  it("closes exactly at the deadline", () => {
    const env = { RECRUITMENT_CLOSES_AT: "2026-10-20T18:29:00Z" };
    expect(getCycleStatus(at("2026-10-20T18:28:59Z"), env).state).toBe("open");
    expect(getCycleStatus(at("2026-10-20T18:29:00Z"), env).state).toBe("closed");
  });

  it("respects timezone offsets in dates", () => {
    const env = { RECRUITMENT_CLOSES_AT: "2026-10-20T23:59:00+05:30" }; // = 18:29:00Z
    expect(getCycleStatus(at("2026-10-20T18:00:00Z"), env).state).toBe("open");
    expect(getCycleStatus(at("2026-10-20T18:30:00Z"), env).state).toBe("closed");
  });

  it("kill switch wins over an open window", () => {
    const env = { RECRUITMENT_OPEN: "false", RECRUITMENT_OPENS_AT: "2026-01-01T00:00:00Z", RECRUITMENT_CLOSES_AT: "2027-01-01T00:00:00Z" };
    expect(getCycleStatus(at("2026-10-10T00:00:00Z"), env).state).toBe("closed");
  });

  it("fails open (and does not throw) on an invalid date", () => {
    const s = getCycleStatus(at("2026-10-10T00:00:00Z"), { RECRUITMENT_CLOSES_AT: "next friday" });
    expect(s.state).toBe("open");
  });

  it("treats empty variables as unset", () => {
    expect(getCycleStatus(at("2026-10-10T00:00:00Z"), { RECRUITMENT_OPEN: "", RECRUITMENT_CLOSES_AT: "" }).state).toBe("open");
  });
});
