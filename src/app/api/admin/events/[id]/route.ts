import { NextRequest, NextResponse } from "next/server";
import { handleDataError } from "@/lib/api-errors";
import { requireUser } from "@/lib/auth";
import { deleteEvent, updateEvent } from "@/lib/events";
import { eventPatchSchema } from "@/lib/events-schema";
import { jsonError, readJson } from "@/lib/http";

// Edit an event, publish/unpublish it ({ "isPublished": true }) or open/close reservations.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request, ["super_admin"]);
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const body = await readJson(request, 8 * 1024);
  if (!body.ok) return body.response;
  const parsed = eventPatchSchema.safeParse(body.data);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid event.", 400);
  if (Object.keys(parsed.data).length === 0) return jsonError("Nothing to change.", 400);

  try {
    return NextResponse.json({ success: true, event: await updateEvent(id, parsed.data, auth.user.id) });
  } catch (err) {
    return handleDataError(err, "Updating an event");
  }
}

// Deletes the event and all of its reservations.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request, ["super_admin"]);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    await deleteEvent(id, auth.user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleDataError(err, "Deleting an event");
  }
}
