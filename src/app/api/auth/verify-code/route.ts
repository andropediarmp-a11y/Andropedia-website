import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin, setSessionCookie, verifyLoginCode } from "@/lib/auth";
import { clientIp, jsonError, readJson } from "@/lib/http";
import { log } from "@/lib/logger";
import { checkRateLimit } from "@/lib/recruitment/rate-limit";

const bodySchema = z.object({ email: z.email().max(160), code: z.string().regex(/^\d{6}$/) });

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("Cross-site request blocked.", 403);
  const body = await readJson(request, 2048);
  if (!body.ok) return body.response;
  const parsed = bodySchema.safeParse(body.data);
  if (!parsed.success) return jsonError("Enter the 6-digit code from your email.", 400);

  const limit = checkRateLimit(`verify-ip:${clientIp(request)}`, 30, 60 * 60 * 1000);
  if (limit.limited) {
    return jsonError("Too many attempts. Please try again later.", 429, { headers: { "Retry-After": String(limit.retryAfterSec) } });
  }

  try {
    const result = await verifyLoginCode(parsed.data.email, parsed.data.code);
    if (!result) {
      return jsonError("That code is invalid or has expired.", 401);
    }
    const res = NextResponse.json({ success: true, user: result.user });
    setSessionCookie(res, result.token, result.expires);
    return res;
  } catch (err) {
    log.error("Code verification failed", err);
    return jsonError("Login failed. Please try again.", 500);
  }
}
