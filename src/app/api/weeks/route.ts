import { NextResponse } from "next/server";
import { getWeeks } from "@/lib/data-store";
import { jsonError } from "@/lib/http";
import { log } from "@/lib/logger";

export async function GET() {
  try {
    const weeks = await getWeeks();
    return NextResponse.json(
      { success: true, weeks },
      { headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (err) {
    log.error("Weeks load failed", err);
    return jsonError("Could not load the sprint weeks.", 500);
  }
}
