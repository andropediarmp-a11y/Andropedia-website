import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin, issueLoginCode } from "@/lib/auth";
import { clientIp, jsonError, readJson } from "@/lib/http";
import { log } from "@/lib/logger";
import { checkRateLimit } from "@/lib/recruitment/rate-limit";

const bodySchema = z.object({ email: z.email().max(160) });

// Same answer whether or not the email belongs to a member, so the endpoint
// can't be used to discover who is in the club.
const GENERIC = { success: true, message: "If that email belongs to a club member, a login code has been sent." };

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("Cross-site request blocked.", 403);
  const body = await readJson(request, 2048);
  if (!body.ok) return body.response;
  const parsed = bodySchema.safeParse(body.data);
  if (!parsed.success) return jsonError("Enter a valid email address.", 400);

  const limit = checkRateLimit(`code-ip:${clientIp(request)}`, 10, 60 * 60 * 1000);
  if (limit.limited) {
    return jsonError("Too many attempts. Please try again later.", 429, { headers: { "Retry-After": String(limit.retryAfterSec) } });
  }

  try {
    const result = await issueLoginCode(parsed.data.email);
    if (result === "rate_limited") {
      return jsonError("A code was just sent. Please wait a minute before requesting another.", 429, {
        headers: { "Retry-After": "60" },
      });
    }
    return NextResponse.json(GENERIC);
  } catch (err) {
    log.error("Login code could not be sent", err);
    return jsonError("We couldn't send the login code right now. Please try again shortly.", 503);
  }
}
