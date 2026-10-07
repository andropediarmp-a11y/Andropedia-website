import { NextRequest, NextResponse } from "next/server";
import { handleDataError } from "@/lib/api-errors";
import { requireUser } from "@/lib/auth";
import { createEvent, listAdminEvents } from "@/lib/events";
import { eventCreateSchema } from "@/lib/events-schema";
import { jsonError, readJson } from "@/lib/http";

// Events, for super admins: list everything (including drafts) and create.
export async function GET(request: NextRequest) {
  const auth = await requireUser(request, ["super_admin"]);
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ success: true, events: await listAdminEvents() });
  } catch (err) {
    return handleDataError(err, "Listing events");
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(request, ["super_admin"]);
  if (!auth.ok) return auth.response;

  const body = await readJson(request, 8 * 1024);
  if (!body.ok) return body.response;
  const parsed = eventCreateSchema.safeParse(body.data);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid event.", 400);

  try {
    const event = await createEvent(parsed.data, auth.user.id);
    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (err) {
    return handleDataError(err, "Creating an event");
  }
}
