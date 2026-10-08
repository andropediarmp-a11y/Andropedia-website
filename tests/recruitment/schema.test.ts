import { describe, expect, it } from "vitest";
import { applicationSchema } from "@/lib/recruitment/schema";

const valid = {
  name: "  Priya K  ",
  email: "  Priya@College.EDU ",
  year: "second",
  domain: "web",
  skills: "Built two Next.js apps and a REST API in Node.",
  motivation: "I want to build real systems with a team and learn from the weekly sprint cycle.",
  domainAnswer: "A realtime leaderboard using SSE and Postgres; I would pick Next.js for shared types.",
  consent: true,
};

describe("applicationSchema", () => {
  it("accepts a valid application and normalises name and email", () => {
    const r = applicationSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Priya K");
      expect(r.data.email).toBe("priya@college.edu");
      expect(r.data.portfolioUrl).toBe("");
      expect(r.data.website).toBe("");
    }
  });

  it.each([
    ["name too short", { name: "P" }, "name"],
    ["bad email", { email: "nope" }, "email"],
    ["unknown year", { year: "fifth" }, "year"],
    ["unknown domain", { domain: "cooking" }, "domain"],
    ["short experience", { skills: "too short" }, "skills"],
    ["short motivation", { motivation: "too short to count" }, "motivation"],
    ["short domain answer", { domainAnswer: "short" }, "domainAnswer"],
    ["no consent", { consent: false }, "consent"],
    ["javascript: link", { portfolioUrl: "javascript:alert(1)" }, "portfolioUrl"],
    ["ftp link", { portfolioUrl: "ftp://x.com/file" }, "portfolioUrl"],
  ])("rejects %s", (_label, patch, field) => {
    const r = applicationSchema.safeParse({ ...valid, ...patch });
    expect(r.success).toBe(false);
    if (!r.success) expect(Object.keys(r.error.flatten().fieldErrors)).toContain(field);
  });

  it("accepts an https portfolio link and an empty one", () => {
    expect(applicationSchema.safeParse({ ...valid, portfolioUrl: "https://github.com/priya" }).success).toBe(true);
    expect(applicationSchema.safeParse({ ...valid, portfolioUrl: "" }).success).toBe(true);
  });

  it("uses friendly messages for missing fields (no raw zod text)", () => {
    const r = applicationSchema.safeParse({});
    expect(r.success).toBe(false);
    if (!r.success) {
      const all = Object.values(r.error.flatten().fieldErrors).flat().join(" ");
      expect(all).not.toMatch(/expected string|Invalid input/i);
      expect(r.error.flatten().fieldErrors.name?.[0]).toBe("This field is required.");
    }
  });

  it("enforces length ceilings", () => {
    expect(applicationSchema.safeParse({ ...valid, skills: "x".repeat(801) }).success).toBe(false);
    expect(applicationSchema.safeParse({ ...valid, motivation: "x".repeat(1201) }).success).toBe(false);
  });
});
