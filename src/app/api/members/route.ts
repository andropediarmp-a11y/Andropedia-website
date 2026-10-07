import { NextResponse } from "next/server";
import { getPublicMembers } from "@/lib/data-store";
import { getLiveMembers } from "@/lib/live-members";
import { LEADERSHIP } from "@/content/leadership";
import { jsonError } from "@/lib/http";
import { log } from "@/lib/logger";

const CACHE = { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" };

// Members straight from the club's Google Form sheet, minus emails (never public).
async function membersFromSheet() {
  const live = await getLiveMembers();
  return live.map((m) => {
    const { email, ...publicFields } = m;
    return { ...publicFields, position: LEADERSHIP[email] ?? "member" };
  });
}

// Public directory: profile fields only, never emails.
// Source of truth is the database; if it is unreachable or still empty, fall back to the form sheet.
export async function GET() {
  try {
    const fromDb = await getPublicMembers();
    if (fromDb.length > 0) return NextResponse.json({ success: true, members: fromDb }, { headers: CACHE });
  } catch (error) {
    log.error("Members DB read failed, using the sheet", error);
  }
  try {
    return NextResponse.json({ success: true, members: await membersFromSheet() }, { headers: CACHE });
  } catch (error) {
    log.error("Members load failed", error);
    return jsonError("Could not load members", 500);
  }
}
