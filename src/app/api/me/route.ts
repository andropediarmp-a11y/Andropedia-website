import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser().catch((err) => {
    console.error("Session lookup failed:", err);
    return null;
  });
  return NextResponse.json({ success: true, user }, { headers: { "Cache-Control": "no-store" } });
}
