import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, jsonError, readJson } from "@/lib/http";
import { log } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { PUBLIC_STATUS_LABEL, type ApplicationStatus } from "@/lib/recruitment/decision";
import { emailKey } from "@/lib/recruitment/email-key";
import { rateLimit } from "@/lib/rate-limit-db";

const bodySchema = z.object({ reference: z.string().trim().min(4).max(32), email: z.email().max(160) });
const NOT_FOUND = "We couldn't find an application with those details.";

// Applicant self-service: reference ID + email returns the status only. A wrong reference and a
// wrong email look the same, so this can't be used to find out who applied.
export async function POST(request: NextRequest) {
  const body = await readJson(request, 1024);
  if (!body.ok) return body.response;
  const parsed = bodySchema.safeParse(body.data);
  if (!parsed.success) return jsonError("Enter your reference ID and the email you applied with.", 400);

  const limit = await rateLimit(`lookup-ip:${clientIp(request)}`, 10, 60 * 60 * 1000);
  if (limit.limited) {
    return jsonError("Too many attempts. Please try again later.", 429, { headers: { "Retry-After": String(limit.retryAfterSec) } });
  }

  try {
    const app = await prisma.application.findUnique({
      where: { reference: parsed.data.reference.toUpperCase() },
      select: { emailKey: true, status: true, domain: true, createdAt: true },
    });
    if (!app || app.emailKey !== emailKey(parsed.data.email)) return jsonError(NOT_FOUND, 404);
    const status = (app.status in PUBLIC_STATUS_LABEL ? app.status : "new") as ApplicationStatus;
    return NextResponse.json(
      { success: true, status, message: PUBLIC_STATUS_LABEL[status], domain: app.domain, appliedAt: app.createdAt.toISOString() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    log.error("Application lookup failed", err);
    return jsonError("We couldn't check that right now. Please try again shortly.", 503);
  }
}
