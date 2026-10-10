import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin } from "@/lib/auth";
import { clientIp, jsonError, readJson } from "@/lib/http";
import { log } from "@/lib/logger";
import { hashChosenPassword } from "@/lib/password";
import { consumePasswordReset, newPasswordSchema } from "@/lib/password-reset";
import { rateLimit } from "@/lib/rate-limit-db";

const bodySchema = z.object({ token: z.string().min(20).max(100), newPassword: newPasswordSchema });

// Sets a new password from the emailed link. Every session is signed out afterwards.
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("Cross-site request blocked.", 403);
  const body = await readJson(request, 2048);
  if (!body.ok) return body.response;
  const parsed = bodySchema.safeParse(body.data);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "This reset link is not valid.", 400);

  const limit = await rateLimit(`reset-ip:${clientIp(request)}`, 20, 60 * 60 * 1000);
  if (limit.limited) {
    return jsonError("Too many attempts. Please try again later.", 429, { headers: { "Retry-After": String(limit.retryAfterSec) } });
  }

  try {
    const ok = await consumePasswordReset(parsed.data.token, hashChosenPassword(parsed.data.newPassword));
    if (!ok) return jsonError("This reset link has expired or was already used. Request a new one.", 400);
    return NextResponse.json({ success: true });
  } catch (err) {
    log.error("Password reset failed", err);
    return jsonError("Could not reset the password. Please try again.", 500);
  }
}
