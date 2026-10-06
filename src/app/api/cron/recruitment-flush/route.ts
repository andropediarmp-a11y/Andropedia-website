import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { flushOutbox } from "@/lib/recruitment/outbox";

function authorised(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  return given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

// Call this from a scheduler (e.g. every 15 minutes) with `Authorization: Bearer $CRON_SECRET`.
export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) return jsonError("Not enabled: set CRON_SECRET.", 503);
  if (!authorised(request)) return jsonError("Unauthorised.", 401);
  const result = await flushOutbox();
  return NextResponse.json({ success: true, ...result }, { headers: { "Cache-Control": "no-store" } });
}
