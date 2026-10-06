import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleDataError } from "@/lib/api-errors";
import { requireUser } from "@/lib/auth";
import { updateMember } from "@/lib/data-store";
import { jsonError, readJson } from "@/lib/http";

const memberPatchSchema = z.object({
  role: z.enum(["member", "domain_admin", "super_admin"]).optional(),
  position: z.enum(["president", "vice_president", "chief", "lead", "co_lead", "member"]).optional(),
  domain: z.enum(["Technical", "Web", "PR", "R&D", "Design", "Media"]).optional(),
  isActive: z.boolean().optional(),
});

// Change a member's permission role, team position, domain or active status (super admin only).
// You can't demote or deactivate yourself, and the last super admin can't be removed.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request, ["super_admin"]);
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const body = await readJson(request, 2 * 1024);
  if (!body.ok) return body.response;
  const parsed = memberPatchSchema.safeParse(body.data);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid change.", 400);

  try {
    return NextResponse.json({ success: true, member: await updateMember(auth.user.id, id, parsed.data) });
  } catch (err) {
    return handleDataError(err, "Updating a member");
  }
}
