import { prisma } from "./prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Deletes expired sessions and login codes older than a day. Safe to run as often as you like. */
export async function purgeExpired(now = new Date()) {
  const [sessions, codes] = await Promise.all([
    prisma.session.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.loginCode.deleteMany({ where: { createdAt: { lt: new Date(now.getTime() - DAY_MS) } } }),
  ]);
  return { expiredSessions: sessions.count, oldLoginCodes: codes.count };
}
