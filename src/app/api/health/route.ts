import { NextRequest, NextResponse } from "next/server";
import { hasCronSecret } from "@/lib/cron-auth";
import { configProblems } from "@/lib/env";
import { prisma } from "@/lib/prisma";

// Uptime/health check. Public callers only learn ok/degraded; the detailed list of
// configuration problems is shown only with `Authorization: Bearer $CRON_SECRET`.
export async function GET(request: NextRequest) {
  let database = true;
  let waiting: number | null = null;
  try {
    waiting = await prisma.recruitmentOutbox.count({ where: { sentAt: null } });
  } catch {
    database = false;
  }
  const problems = configProblems();
  const ok = database && problems.length === 0;
  const body: Record<string, unknown> = { status: ok ? "ok" : "degraded", database };
  if (hasCronSecret(request)) {
    body.problems = problems;
    body.queuedApplications = waiting;
  }
  return NextResponse.json(body, { status: database ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
