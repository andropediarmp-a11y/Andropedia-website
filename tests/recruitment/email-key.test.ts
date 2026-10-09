import { describe, expect, it } from "vitest";
import { emailKey } from "@/lib/recruitment/email-key";

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
});
