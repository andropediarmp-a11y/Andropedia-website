import { NextRequest, NextResponse } from "next/server";
import { handleDataError } from "@/lib/api-errors";
import { requireUser } from "@/lib/auth";
import { csvCell as cell } from "@/lib/csv";
import { listAttendees } from "@/lib/events";

// Attendee list for one event. Names, emails and phone numbers: super admins only.
// Add ?format=csv to download. Team events list one row per team member.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request, ["super_admin"]);
  if (!auth.ok) return auth.response;
  const { id } = await params;

  try {
    const attendees = await listAttendees(id);
    if (request.nextUrl.searchParams.get("format") === "csv") {
      const isTeam = attendees.some((a) => a.teamName);
      const lines = isTeam
        ? [
            "team,role,name,mobile,email,department,section,year,register_number,registered_at",
            ...attendees.map((a) =>
              [cell(a.teamName), a.isLeader ? "Leader" : "Member", cell(a.name), cell(a.mobile), cell(a.email), cell(a.dept), cell(a.section), cell(a.year), cell(a.registerNo), a.createdAt].join(",")
            ),
          ]
        : ["name,email,reserved_at", ...attendees.map((a) => [cell(a.name), cell(a.email), a.createdAt].join(","))];
      return new NextResponse(lines.join("\n"), {
        headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="attendees-${id}.csv"` },
      });
    }
    return NextResponse.json({ success: true, attendees });
  } catch (err) {
    return handleDataError(err, "Listing attendees");
  }
}
