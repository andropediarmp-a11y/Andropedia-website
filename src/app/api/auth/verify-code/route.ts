import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin, setSessionCookie, verifyLoginCode } from "@/lib/auth";
import { rateLimited } from "@/lib/recruitment/rate-limit";

const bodySchema = z.object({ email: z.email().max(160), code: z.string().regex(/^\d{6}$/) });

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Cross-site request blocked." }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Enter the 6-digit code from your email." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(`verify-ip:${ip}`, 30, 60 * 60 * 1000)) {
    return NextResponse.json({ success: false, error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  try {
    const result = await verifyLoginCode(parsed.data.email, parsed.data.code);
    if (!result) {
      return NextResponse.json({ success: false, error: "That code is invalid or has expired." }, { status: 401 });
    }
    const res = NextResponse.json({ success: true, user: result.user });
    setSessionCookie(res, result.token, result.expires);
    return res;
  } catch (err) {
    console.error("Code verification failed:", err);
    return NextResponse.json({ success: false, error: "Login failed. Please try again." }, { status: 500 });
  }
}
