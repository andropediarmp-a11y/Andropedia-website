import { describe, expect, it } from "vitest";
import { configProblems, readEnv } from "@/lib/env";

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

describe("configProblems with the Apps Script web app", () => {
  const base = { NODE_ENV: "production", DATABASE_URL: "postgres://x", AUTH_SECRET: "s", CRON_SECRET: "c" };
  it("treats the web app as both the sheet and the mail sender", () => {
    const p = configProblems({ ...base, RECRUITMENT_SHEET_WEBHOOK_URL: "https://script.google.com/x", RECRUITMENT_SHEET_WEBHOOK_SECRET: "s" });
    expect(p).toEqual([]);
  });
  it("warns about every missing piece when nothing is configured", () => {
    const p = configProblems({ NODE_ENV: "production", DATABASE_URL: "postgres://x", AUTH_SECRET: "s" }).join(" ");
    expect(p).toMatch(/No Google Sheet/);
    expect(p).toMatch(/No email sender/);
    expect(p).toMatch(/CRON_SECRET/);
  });
});
