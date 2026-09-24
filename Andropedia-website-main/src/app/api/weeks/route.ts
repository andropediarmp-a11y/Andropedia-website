import { NextResponse } from "next/server";
import { getWeeks } from "@/lib/data-store";

export async function GET() {
  const weeks = getWeeks();
  return NextResponse.json({ success: true, weeks });
}
