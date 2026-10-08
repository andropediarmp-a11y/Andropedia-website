import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleDataError } from "@/lib/api-errors";
import { requireUser } from "@/lib/auth";
import { createWeek, getWeeks } from "@/lib/data-store";
import { jsonError, readJson } from "@/lib/http";

const date = z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date.");

const weekCreateSchema = z.object({
  weekNumber: z.number().int().min(1).max(500),
  title: z.string().trim().min(3).max(120),
  theme: z.string().trim().min(3).max(120),
  startDate: date,
  endDate: date,
  promptDescription: z.string().trim().max(2000).nullable().optional(),
  isActive: z.boolean().optional(),
});

// Sprint weeks, for super admins: list and create.
export async function GET(request: NextRequest) {
  const auth = await requireUser(request, ["super_admin"]);
  if (!auth.ok) return auth.response;
  return NextResponse.json({ success: true, weeks: await getWeeks() });
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(request, ["super_admin"]);
  if (!auth.ok) return auth.response;

  const body = await readJson(request, 8 * 1024);
  if (!body.ok) return body.response;
  const parsed = weekCreateSchema.safeParse(body.data);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid week.", 400);

  try {
    const week = await createWeek({ ...parsed.data }, auth.user.id);
    return NextResponse.json({ success: true, week }, { status: 201 });
  } catch (err) {
    return handleDataError(err, "Creating a week");
  }
}
