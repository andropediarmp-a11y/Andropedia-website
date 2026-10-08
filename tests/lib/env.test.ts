import { describe, expect, it } from "vitest";
import { allowedEmailDomains, configProblems, readEnv } from "@/lib/env";

describe("readEnv", () => {
  it("accepts an empty environment", () => {
    expect(() => readEnv({})).not.toThrow();
  });
  it("names every invalid variable", () => {
    let message = "";
    try {
      readEnv({ RECRUITMENT_CLOSES_AT: "soon", SMTP_PORT: "abc" });
    } catch (e) {
      message = (e as Error).message;
    }
    expect(message).toContain("RECRUITMENT_CLOSES_AT");
    expect(message).toContain("SMTP_PORT");
  });
});

describe("configProblems", () => {
  it("is quiet in development with nothing set", () => {
    expect(configProblems({})).toEqual([]);
  });
  it("flags half-configured services", () => {
    const p = configProblems({ GOOGLE_SERVICE_ACCOUNT_EMAIL: "a@b.iam", SMTP_HOST: "smtp.x" });
    expect(p.join(" ")).toMatch(/Google Sheets settings are incomplete/);
    expect(p.join(" ")).toMatch(/SMTP settings are incomplete/);
  });
  it("flags an open window that ends before it starts", () => {
    const p = configProblems({ RECRUITMENT_OPENS_AT: "2026-10-20T00:00:00Z", RECRUITMENT_CLOSES_AT: "2026-10-10T00:00:00Z" });
    expect(p.join(" ")).toMatch(/must be before/);
  });
  it("requires secrets in production", () => {
    const p = configProblems({ NODE_ENV: "production" });
    expect(p.join(" ")).toMatch(/DATABASE_URL/);
    expect(p.join(" ")).toMatch(/AUTH_SECRET/);
  });
});

describe("allowedEmailDomains", () => {
  it("parses a comma list", () => {
    expect(allowedEmailDomains({ RECRUITMENT_ALLOWED_EMAIL_DOMAINS: " College.edu , @student.college.edu " })).toEqual([
      "college.edu",
      "student.college.edu",
    ]);
    expect(allowedEmailDomains({})).toEqual([]);
  });
});
