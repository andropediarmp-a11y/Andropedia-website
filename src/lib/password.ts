import crypto from "node:crypto";

// Member passwords. A password starts as the member's register number (low-entropy by design) until
// they change it. Either way it is mixed with a server secret and hashed with scrypt, and logins are rate-limited.
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
// "scrypt" hashes (register-number passwords) are normalised first; "scrypt2" hashes (passwords a
// member chose) are used exactly as typed, so case and spaces count.
const prehash = (password: string, scheme: "scrypt" | "scrypt2") =>
  crypto.createHmac("sha256", authSecret()).update(scheme === "scrypt" ? normalizeRegisterNo(password) : password).digest();

function hashWith(scheme: "scrypt" | "scrypt2", password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(prehash(password, scheme), salt, SCRYPT.keylen, SCRYPT);
  return `${scheme}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

/** "scrypt$<salt>$<hash>" for a register-number password. */
export const hashPassword = (password: string) => hashWith("scrypt", password);

/** "scrypt2$<salt>$<hash>" for a password the member chose. */
export const hashChosenPassword = (password: string) => hashWith("scrypt2", password);

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  const [scheme, saltText, hashText] = (stored ?? "").split("$");
  if ((scheme !== "scrypt" && scheme !== "scrypt2") || !saltText || !hashText) return false;
  const expected = Buffer.from(hashText, "base64url");
  const actual = crypto.scryptSync(prehash(password, scheme), Buffer.from(saltText, "base64url"), expected.length, SCRYPT);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}
