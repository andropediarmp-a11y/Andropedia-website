import { NextRequest, NextResponse } from "next/server";
import { handleDataError } from "@/lib/api-errors";
import { requireUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { deleteProject, projectPatchSchema, updateProject } from "@/lib/projects";

// Edit a project, or publish/unpublish it with { "isPublished": true | false }.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request, ["super_admin"]);
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const body = await readJson(request, 8 * 1024);
  if (!body.ok) return body.response;
  const parsed = projectPatchSchema.safeParse(body.data);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid project.", 400);
  if (Object.keys(parsed.data).length === 0) return jsonError("Nothing to change.", 400);

  try {
    return NextResponse.json({ success: true, project: await updateProject(id, parsed.data, auth.user.id) });
  } catch (err) {
    return handleDataError(err, "Updating a project");
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request, ["super_admin"]);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    await deleteProject(id, auth.user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleDataError(err, "Deleting a project");
  }
}
