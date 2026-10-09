import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { log } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

// Recruitment applicants, newest first. Contains personal data: super admins only.
export async function GET(request: NextRequest) {
  const auth = await requireUser(request, ["super_admin"]);
  if (!auth.ok) return auth.response;
  try {
    const applications = await prisma.application.findMany({ orderBy: { createdAt: "desc" }, take: 1000 });
    return NextResponse.json({ success: true, applications });
  } catch (error) {
    log.error("Applications load failed", error);
    return jsonError("Could not load applications", 500);
  }
}
