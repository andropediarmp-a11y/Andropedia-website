import { NextRequest, NextResponse } from "next/server";
import { hasCronSecret } from "@/lib/cron-auth";
import { jsonError } from "@/lib/http";
import { syncPending } from "@/lib/recruitment/retry";

// Call this from a scheduler (e.g. every 15 minutes) with `Authorization: Bearer $CRON_SECRET`.
export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) return jsonError("Not enabled: set CRON_SECRET.", 503);
  if (!hasCronSecret(request)) return jsonError("Unauthorised.", 401);
  const result = await syncPending();
  return NextResponse.json({ success: true, ...result }, { headers: { "Cache-Control": "no-store" } });
}
