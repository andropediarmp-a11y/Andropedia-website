import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin, issueLoginCode } from "@/lib/auth";
import { rateLimited } from "@/lib/recruitment/rate-limit";

const bodySchema = z.object({ email: z.email().max(160) });

// Same answer whether or not the email belongs to a member, so the endpoint
// can't be used to discover who is in the club.
const GENERIC = { success: true, message: "If that email belongs to a club member, a login code has been sent." };

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Cross-site request blocked." }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Enter a valid email address." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(`code-ip:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ success: false, error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  try {
    const result = await issueLoginCode(parsed.data.email);
    if (result === "rate_limited") {
      return NextResponse.json(
        { success: false, error: "A code was just sent. Please wait a minute before requesting another." },
        { status: 429 }
      );
    }
    return NextResponse.json(GENERIC);
  } catch (err) {
    console.error("Login code failed:", err);
    return NextResponse.json(
      { success: false, error: "We couldn't send the login code right now. Please try again shortly." },
      { status: 503 }
    );
  }
}
