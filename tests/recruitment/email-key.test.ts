import { describe, expect, it } from "vitest";
import { emailHash, emailKey, isAllowedDomain } from "@/lib/recruitment/email-key";

describe("emailKey", () => {
  it("lower-cases and trims", () => {
    expect(emailKey("  Priya@College.EDU ")).toBe("priya@college.edu");
  });
  it("treats Gmail dots and +tags as the same inbox", () => {
    const base = emailKey("priya@gmail.com");
    expect(emailKey("P.riya@gmail.com")).toBe(base);
    expect(emailKey("priya+club@gmail.com")).toBe(base);
    expect(emailKey("p.r.i.y.a+x+y@googlemail.com")).toBe(base);
  });
  it("does not collapse dots or tags on other domains", () => {
    expect(emailKey("a.b@college.edu")).not.toBe(emailKey("ab@college.edu"));
    expect(emailKey("a+x@college.edu")).not.toBe(emailKey("a@college.edu"));
  });
  it("hashes equal keys equally and never contains the address", () => {
    expect(emailHash("P.riya@gmail.com")).toBe(emailHash("priya@gmail.com"));
    expect(emailHash("priya@gmail.com")).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("isAllowedDomain", () => {
  it("allows everything when the list is empty", () => {
    expect(isAllowedDomain("x@anything.com", [])).toBe(true);
  });
  it("matches exact domains and subdomains only", () => {
    const allowed = ["college.edu"];
    expect(isAllowedDomain("a@college.edu", allowed)).toBe(true);
    expect(isAllowedDomain("a@student.college.edu", allowed)).toBe(true);
    expect(isAllowedDomain("a@notcollege.edu", allowed)).toBe(false);
    expect(isAllowedDomain("a@college.edu.evil.com", allowed)).toBe(false);
    expect(isAllowedDomain("a@gmail.com", allowed)).toBe(false);
  });
});
