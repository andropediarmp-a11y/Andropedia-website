import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin, loginWithPassword, setSessionCookie } from "@/lib/auth";
import { normalizeRegisterNo } from "@/lib/password";
import { clientIp, jsonError, readJson } from "@/lib/http";
import { log } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit-db";

const bodySchema = z.object({ registerNo: z.string().trim().min(4).max(30), password: z.string().min(1).max(60) });

const HOUR = 60 * 60 * 1000;
const WRONG = "Wrong register number or password.";

// Members log in with their register number and password. Every failure gets the same answer, so
// the endpoint can't be used to find out which register numbers belong to members.
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("Cross-site request blocked.", 403);
  const body = await readJson(request, 2048);
  if (!body.ok) return body.response;
  const parsed = bodySchema.safeParse(body.data);
  if (!parsed.success) return jsonError("Enter your register number and password.", 400);

  // One limit per address and one per account, so neither one machine nor a botnet can grind away.
  const [byIp, byAccount] = await Promise.all([
    rateLimit(`login-ip:${clientIp(request)}`, 30, HOUR),
    rateLimit(`login-reg:${normalizeRegisterNo(parsed.data.registerNo)}`, 20, HOUR),
  ]);
  const limit = byIp.limited ? byIp : byAccount.limited ? byAccount : null;
  if (limit) {
    return jsonError("Too many attempts. Please try again later.", 429, { headers: { "Retry-After": String(limit.retryAfterSec) } });
  }

  try {
    const result = await loginWithPassword(parsed.data.registerNo, parsed.data.password);
    if (!result) return jsonError(WRONG, 401);
    const res = NextResponse.json({ success: true, user: result.user });
    setSessionCookie(res, result.token, result.expires);
    return res;
  } catch (err) {
    log.error("Login failed", err);
    return jsonError("Login failed. Please try again.", 500);
  }
}
