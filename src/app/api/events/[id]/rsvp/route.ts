import { NextRequest, NextResponse, after } from "next/server";
import { handleDataError } from "@/lib/api-errors";
import { sendRsvpConfirmation, sendTeamConfirmation } from "@/lib/events-email";
import { rsvpSchema, teamRsvpSchema } from "@/lib/events-schema";
import { markRsvpEmailSent, rsvpTeam, rsvpToEvent } from "@/lib/events";
import { clientIp, jsonError, readJson } from "@/lib/http";
import { log } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit-db";

const HOUR = 60 * 60 * 1000;

function firstError(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const { fieldErrors } = error.flatten() as { fieldErrors: Record<string, string[]> };
  const first = Object.values(fieldErrors).flat()[0] ?? "Please check the form and try again.";
  return { first, fieldErrors };
}

// Public registration. A body with a "members" list registers a team; otherwise it is a single seat.
// Rate-limited per IP; capacity and duplicate checks happen inside one locked transaction.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const body = await readJson(request, 16 * 1024);
  if (!body.ok) return body.response;
  const isTeam = typeof body.data === "object" && body.data !== null && "members" in body.data;

  const limit = await rateLimit(`rsvp-ip:${clientIp(request)}`, 10, HOUR);
  const tooMany = () =>
    jsonError("Too many registrations. Please try again later.", 429, { headers: { "Retry-After": String(limit.retryAfterSec) } });

  if (isTeam) {
    const parsed = teamRsvpSchema.safeParse(body.data);
    if (!parsed.success) {
      const { first, fieldErrors } = firstError(parsed.error);
      return jsonError(parsed.error.issues[0]?.message ?? first, 400, { fieldErrors });
    }
    const input = parsed.data;

    // Honeypot: pretend success, store nothing, send nothing.
    if (input.website) return NextResponse.json({ success: true }, { status: 201 });
    if (limit.limited) return tooMany();

    try {
      const { rsvpId, event } = await rsvpTeam(id, { teamName: input.teamName, members: input.members });
      after(async () => {
        const results = await Promise.allSettled(input.members.map((m) => sendTeamConfirmation(m, input.teamName, input.members, event)));
        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length) log.warn("Some team confirmation emails failed", { rsvpId, failed: failed.length });
        if (results[0]?.status === "fulfilled") {
          try {
            await markRsvpEmailSent(rsvpId);
          } catch (err) {
            log.warn("Could not mark team email as sent", { rsvpId }, err);
          }
        }
      });
      return NextResponse.json({ success: true, eventTitle: event.title, teamName: input.teamName }, { status: 201 });
    } catch (err) {
      return handleDataError(err, "Registering a team");
    }
  }

  const parsed = rsvpSchema.safeParse(body.data);
  if (!parsed.success) {
    const { first, fieldErrors } = firstError(parsed.error);
    return jsonError(first, 400, { fieldErrors });
  }
  const input = parsed.data;

  // Honeypot: pretend success, store nothing, send nothing.
  if (input.website) return NextResponse.json({ success: true }, { status: 201 });
  if (limit.limited) return tooMany();

  try {
    const { rsvpId, event } = await rsvpToEvent(id, { name: input.name, email: input.email });
    after(async () => {
      try {
        await sendRsvpConfirmation({ name: input.name, email: input.email }, event);
        await markRsvpEmailSent(rsvpId);
      } catch (err) {
        log.warn("RSVP confirmation email failed", { rsvpId }, err);
      }
    });
    return NextResponse.json({ success: true, eventTitle: event.title }, { status: 201 });
  } catch (err) {
    return handleDataError(err, "Reserving a seat");
  }
}
