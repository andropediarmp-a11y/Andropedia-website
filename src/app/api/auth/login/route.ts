import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/data-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role } = body;

    const user = typeof email === "string" ? await getUserByEmail(email) : null;

    if (!user) {
      return NextResponse.json({ success: false, error: "Club member account not found" }, { status: 401 });
    }

    if (role && user.role !== role) {
      return NextResponse.json({ success: false, error: "This account does not have that role" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      user,
      token: `demo_token_${user.id}_${Date.now()}`,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500 });
  }
}
