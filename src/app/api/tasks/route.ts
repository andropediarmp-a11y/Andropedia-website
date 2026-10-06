import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { addTask, getTasks, NotFoundError } from "@/lib/data-store";

export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const { searchParams } = new URL(request.url);
  const filters = {
    weekId: searchParams.get("weekId"),
    domain: searchParams.get("domain"),
    userId: searchParams.get("userId"),
    status: searchParams.get("status"),
  };

  // Members see only their own submissions; domain leads only their own domain.
  if (user.role === "member") {
    filters.userId = user.id;
  } else if (user.role === "domain_admin") {
    filters.domain = user.domain;
  }

  try {
    const tasks = await getTasks(filters);
    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error("Error loading tasks:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || (/^https?:\/\//i.test(v) && URL.canParse(v)), "Enter a valid http(s) URL.")
  .optional();

const taskSchema = z.object({
  weekId: z.string().min(1, "Choose a sprint week."),
  title: z.string().trim().min(3, "Add a title.").max(120),
  description: z.string().trim().min(10, "Add a short description.").max(4000),
  githubUrl: optionalUrl,
  liveUrl: optionalUrl,
  figmaUrl: optionalUrl,
  notes: z.string().trim().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const parsed = taskSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid submission." },
      { status: 400 }
    );
  }

  try {
    // Identity and domain come from the session, never from the request body.
    const newTask = await addTask({ ...parsed.data, userId: user.id, domain: user.domain });
    return NextResponse.json({ success: true, task: newTask }, { status: 201 });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }
    console.error("Error creating task:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
