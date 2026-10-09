import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { log } from "@/lib/logger";
import { listPublicProjects } from "@/lib/projects";

// Public: published club projects.
export async function GET() {
  try {
    return NextResponse.json(
      { success: true, projects: await listPublicProjects() },
      { headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    log.error("Projects load failed", error);
    return jsonError("Could not load projects", 500);
  }
}
