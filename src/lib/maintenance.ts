import { prisma } from "./prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Deletes expired sessions and login codes and rate-limit counters older than a day. Safe to run as often as you like. */
export async function purgeExpired(now = new Date()) {
  const [sessions, codes, limits] = await Promise.all([
    prisma.session.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.loginCode.deleteMany({ where: { createdAt: { lt: new Date(now.getTime() - DAY_MS) } } }),
    prisma.rateLimit.deleteMany({ where: { windowStart: { lt: new Date(now.getTime() - DAY_MS) } } }),
  ]);
  return { expiredSessions: sessions.count, oldLoginCodes: codes.count, oldRateLimits: limits.count };
}
