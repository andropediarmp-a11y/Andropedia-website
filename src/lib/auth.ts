import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";
import { mapUser } from "./data-store";
import { escapeHtml, isMailConfigured, sendMail } from "./mailer";
import type { RoleType, User } from "./types";

export const SESSION_COOKIE = "andropedia_session";
const SESSION_DAYS = 14;
const SESSION_TOUCH_MS = 5 * 60 * 1000;
const CODE_TTL_MS = 10 * 60 * 1000;
const CODE_MAX_ATTEMPTS = 5;

const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is not set.");
  return "dev-only-insecure-secret";
}

const hashCode = (email: string, code: string) =>
  crypto.createHmac("sha256", authSecret()).update(`${email}:${code}`).digest("hex");

// ---------------------------------------------------------------- sessions

export async function createSession(userId: string): Promise<{ token: string; expires: Date }> {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { tokenHash: sha256(token), userId, expiresAt: expires } });
  return { token, expires };
}

export function setSessionCookie(res: NextResponse, token: string, expires: Date) {
  res.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set({ name: SESSION_COOKIE, value: "", path: "/", maxAge: 0 });
}

/** The logged-in user from the session cookie, or null. */
export async function getSessionUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt <= new Date() || !session.user.isActive) {
    await prisma.session.deleteMany({ where: { id: session.id } });
    return null;
  }
  if (Date.now() - session.lastUsedAt.getTime() > SESSION_TOUCH_MS) {
    await prisma.session.update({ where: { id: session.id }, data: { lastUsedAt: new Date() } });
  }
  return mapUser(session.user);
}

export async function destroyCurrentSession(): Promise<void> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } });
}

// ------------------------------------------------------------- route guard

type AuthResult = { ok: true; user: User } | { ok: false; response: NextResponse };

const deny = (error: string, status: number): AuthResult => ({
  ok: false,
  response: NextResponse.json({ success: false, error }, { status }),
});

/** Blocks cross-site form posts: a browser-sent Origin must match this host. */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients (curl, server-to-server)
  try {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * Use at the top of every protected route:
 *   const auth = await requireUser(request, ["super_admin"]);
 *   if (!auth.ok) return auth.response;
 */
export async function requireUser(request: NextRequest, roles?: RoleType[]): Promise<AuthResult> {
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && !isSameOrigin(request)) {
    return deny("Cross-site request blocked.", 403);
  }
  const user = await getSessionUser();
  if (!user) return deny("Please log in to continue.", 401);
  if (roles && !roles.includes(user.role)) return deny("Your club role does not have access to this.", 403);
  return { ok: true, user };
}

// ------------------------------------------------------------- login codes

export type IssueResult = "sent" | "unknown" | "rate_limited";

/** Emails a one-time code to an active member. Unknown emails are silently ignored. */
export async function issueLoginCode(rawEmail: string): Promise<IssueResult> {
  const email = rawEmail.trim().toLowerCase();

  const now = Date.now();
  const [lastMinute, lastHour] = await Promise.all([
    prisma.loginCode.count({ where: { email, createdAt: { gt: new Date(now - 60_000) } } }),
    prisma.loginCode.count({ where: { email, createdAt: { gt: new Date(now - 3_600_000) } } }),
  ]);
  if (lastMinute >= 1 || lastHour >= 5) return "rate_limited";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return "unknown";

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  await prisma.loginCode.updateMany({ where: { email, usedAt: null }, data: { usedAt: new Date() } });
  const record = await prisma.loginCode.create({
    data: { email, codeHash: hashCode(email, code), expiresAt: new Date(now + CODE_TTL_MS) },
  });

  if (!isMailConfigured() && process.env.NODE_ENV !== "production") {
    console.log(`[dev] Login code for ${email}: ${code}`);
    return "sent";
  }

  try {
    await sendMail({
      to: email,
      subject: `Your Andropedia login code: ${code}`,
      text: `Hi ${user.name},\n\nYour Andropedia login code is ${code}\nIt expires in 10 minutes. If you didn't request it, you can ignore this email.\n\n- Team Andropedia`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;max-width:480px"><p>Hi ${escapeHtml(user.name)},</p><p>Your Andropedia login code is</p><p style="font-size:28px;letter-spacing:6px;font-weight:bold">${code}</p><p>It expires in 10 minutes. If you didn't request it, you can ignore this email.</p><p>- Team Andropedia</p></div>`,
    });
  } catch (err) {
    await prisma.loginCode.deleteMany({ where: { id: record.id } });
    throw err;
  }
  return "sent";
}

/** Checks a code; on success returns the user and a fresh session. */
export async function verifyLoginCode(
  rawEmail: string,
  code: string
): Promise<{ user: User; token: string; expires: Date } | null> {
  const email = rawEmail.trim().toLowerCase();

  const record = await prisma.loginCode.findFirst({
    where: { email, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return null;

  // Count the attempt first so parallel guesses can't exceed the limit.
  const claimed = await prisma.loginCode.updateMany({
    where: { id: record.id, usedAt: null, attempts: { lt: CODE_MAX_ATTEMPTS } },
    data: { attempts: { increment: 1 } },
  });
  if (claimed.count === 0) return null;

  const expected = Buffer.from(record.codeHash);
  const actual = Buffer.from(hashCode(email, code));
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;

  // Single use: only one request can flip usedAt from null.
  const used = await prisma.loginCode.updateMany({
    where: { id: record.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (used.count === 0) return null;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return null;

  const session = await createSession(user.id);
  return { user: mapUser(user), ...session };
}
