import { NextRequest, NextResponse } from "next/server";
import { hasCronSecret } from "@/lib/cron-auth";
import { jsonError } from "@/lib/http";
import { purgeExpired } from "@/lib/maintenance";

// Housekeeping: call daily with `Authorization: Bearer $CRON_SECRET`.
export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) return jsonError("Not enabled: set CRON_SECRET.", 503);
  if (!hasCronSecret(request)) return jsonError("Unauthorised.", 401);
  return NextResponse.json({ success: true, ...(await purgeExpired()) }, { headers: { "Cache-Control": "no-store" } });
}
