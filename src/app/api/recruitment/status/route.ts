import { NextResponse } from "next/server";
import { getCycleStatus } from "@/lib/recruitment/cycle";

// Lets the application form show the deadline, or a closed message, before anyone fills it in.
export async function GET() {
  return NextResponse.json(
    { success: true, ...getCycleStatus() },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60" } }
  );
}
