import { NextResponse } from "next/server";
import { listPublicEvents } from "@/lib/events";
import { jsonError } from "@/lib/http";
import { log } from "@/lib/logger";

// Public: published events with seat counts. No attendee details.
export async function GET() {
  try {
    return NextResponse.json(
      { success: true, events: await listPublicEvents() },
      { headers: { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=120" } }
    );
  } catch (error) {
    log.error("Events load failed", error);
    return jsonError("Could not load events", 500);
  }
}
