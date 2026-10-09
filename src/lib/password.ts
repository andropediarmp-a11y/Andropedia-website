import crypto from "node:crypto";

// Member passwords. A member's password is their register number, so it is low-entropy by design:
// it is mixed with a server secret and hashed with scrypt, and logins are rate-limited.
// No "server-only" import, so the import and admin scripts can use this too.

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 32 } as const;

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is not set.");
  return "dev-only-insecure-secret";
}

/** Register numbers are compared without spaces and in capitals, so "ra 2511..." and "RA2511..." match. */
export const normalizeRegisterNo = (value: string) => value.replace(/\s+/g, "").toUpperCase();

// The secret is mixed in first, so a leaked database alone does not let anyone test guesses offline.
const prehash = (password: string) => crypto.createHmac("sha256", authSecret()).update(normalizeRegisterNo(password)).digest();

/** "scrypt$<salt>$<hash>" for a password. */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(prehash(password), salt, SCRYPT.keylen, SCRYPT);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  const [scheme, saltText, hashText] = (stored ?? "").split("$");
  if (scheme !== "scrypt" || !saltText || !hashText) return false;
  const expected = Buffer.from(hashText, "base64url");
  const actual = crypto.scryptSync(prehash(password), Buffer.from(saltText, "base64url"), expected.length, SCRYPT);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}
