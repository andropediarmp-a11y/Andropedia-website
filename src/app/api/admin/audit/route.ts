import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { listAudit } from "@/lib/audit";

// Recent admin actions (grading, week and member changes), newest first. Super admins only.
export async function GET(request: NextRequest) {
  const auth = await requireUser(request, ["super_admin"]);
  if (!auth.ok) return auth.response;
  const limit = Number(new URL(request.url).searchParams.get("limit")) || 100;
  return NextResponse.json({ success: true, entries: await listAudit(limit) }, { headers: { "Cache-Control": "no-store" } });
}
