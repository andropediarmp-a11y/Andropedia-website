import { NextResponse } from "next/server";
import { getPublicMembers } from "@/lib/data-store";

// Public directory: profile fields only, never emails.
export async function GET() {
  try {
    return NextResponse.json({ success: true, members: await getPublicMembers() });
  } catch (error) {
    console.error("Members load error:", error);
    return NextResponse.json({ success: false, error: "Could not load members" }, { status: 500 });
  }
}
