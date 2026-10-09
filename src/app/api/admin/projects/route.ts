import { NextRequest, NextResponse } from "next/server";
import { handleDataError } from "@/lib/api-errors";
import { requireUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { createProject, listAdminProjects, projectCreateSchema } from "@/lib/projects";

// Projects for super admins: list everything (including drafts) and create.
export async function GET(request: NextRequest) {
  const auth = await requireUser(request, ["super_admin"]);
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ success: true, projects: await listAdminProjects() });
  } catch (err) {
    return handleDataError(err, "Listing projects");
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(request, ["super_admin"]);
  if (!auth.ok) return auth.response;

  const body = await readJson(request, 8 * 1024);
  if (!body.ok) return body.response;
  const parsed = projectCreateSchema.safeParse(body.data);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid project.", 400);

  try {
    return NextResponse.json({ success: true, project: await createProject(parsed.data, auth.user.id) }, { status: 201 });
  } catch (err) {
    return handleDataError(err, "Creating a project");
  }
}
