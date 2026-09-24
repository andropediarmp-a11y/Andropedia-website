import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/data-store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain") || "All";
  if (searchParams.get("scope") === "public") return NextResponse.json({ success: true, leaderboard: [], source: "awaiting-verification" });
  const leaderboard = getLeaderboard(domain);
  return NextResponse.json({ success: true, leaderboard });
}
