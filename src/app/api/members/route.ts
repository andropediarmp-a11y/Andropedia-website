import { NextResponse } from "next/server";
import { getPublicMembers } from "@/lib/data-store";
import { jsonError } from "@/lib/http";
import { log } from "@/lib/logger";

// Public directory: profile fields only, never emails.
export async function GET() {
  try {
    return NextResponse.json(
      { success: true, members: await getPublicMembers() },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    log.error("Members load failed", error);
    return jsonError("Could not load members", 500);
  }
}
