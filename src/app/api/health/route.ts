import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { configProblems } from "@/lib/env";
import { prisma } from "@/lib/prisma";

function hasSecret(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  return given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

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
  if (hasSecret(request)) {
    body.problems = problems;
    body.queuedApplications = waiting;
  }
  return NextResponse.json(body, { status: database ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
