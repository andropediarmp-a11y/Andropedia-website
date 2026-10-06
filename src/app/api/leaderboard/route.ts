import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLeaderboard } from "@/lib/data-store";
import { jsonError } from "@/lib/http";
import { log } from "@/lib/logger";

const querySchema = z.object({
  domain: z.string().trim().max(20).default("All"),
  period: z.enum(["all-time", "weekly", "monthly"]).default("all-time"),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    domain: searchParams.get("domain") ?? undefined,
    period: searchParams.get("period") ?? undefined,
  });
  if (!parsed.success) return jsonError("Invalid filter.", 400);

  try {
    const leaderboard = await getLeaderboard(parsed.data.domain, parsed.data.period);
    return NextResponse.json(
      { success: true, leaderboard },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } }
    );
  } catch (err) {
    log.error("Leaderboard load failed", err);
    return jsonError("Could not load the leaderboard.", 500);
  }
}
