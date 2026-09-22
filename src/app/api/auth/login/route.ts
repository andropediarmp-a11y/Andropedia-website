import { NextRequest, NextResponse } from "next/server";
import { getUsers } from "@/lib/data-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role } = body;

    const users = getUsers();
    
    // If specific email is provided, find that user
    let user = users.find((u) => u.email.toLowerCase() === email?.toLowerCase());

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
