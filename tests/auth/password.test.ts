import { describe, expect, it } from "vitest";
import { hashPassword, normalizeRegisterNo, verifyPassword } from "@/lib/password";

describe("password hashing", () => {
  it("verifies the right password, in any case and spacing", () => {
    const stored = hashPassword("RA2511026020025");
    expect(verifyPassword("RA2511026020025", stored)).toBe(true);
    expect(verifyPassword("ra 2511026020025", stored)).toBe(true);
  });
  it("rejects a different password", () => {
    expect(verifyPassword("RA2511026020026", hashPassword("RA2511026020025"))).toBe(false);
  });
  it("never stores the password, and salts every hash", () => {
    const a = hashPassword("RA2511026020025");
    expect(a).not.toContain("RA2511026020025");
    expect(a).not.toBe(hashPassword("RA2511026020025"));
  });
  it("rejects missing or malformed stored values", () => {
    for (const bad of [null, undefined, "", "plain", "scrypt$only", "bcrypt$a$b"]) expect(verifyPassword("x", bad)).toBe(false);
  });
  it("normalises register numbers", () => {
    expect(normalizeRegisterNo(" ra 2511 026020025 ")).toBe("RA2511026020025");
  });
});
