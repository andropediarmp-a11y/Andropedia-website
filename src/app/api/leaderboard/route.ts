import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/data-store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain") || "All";
  const period = searchParams.get("period") || "all-time";

  const leaderboard = getLeaderboard(domain, period);
  return NextResponse.json({ success: true, leaderboard });
}
