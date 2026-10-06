import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { evaluateTask, ForbiddenError, NotFoundError } from "@/lib/data-store";

const criterion = z.number().int().min(0).max(25);

const evaluationSchema = z
  .object({
    taskId: z.string().min(1),
    score: z.number().int("Score must be a whole number.").min(0).max(100, "Score must be between 0 and 100."),
    feedback: z.string().trim().min(1, "Feedback is required.").max(2000),
    criteriaScores: z
      .object({
        technicalDepth: criterion,
        innovation: criterion,
        completion: criterion,
        documentation: criterion,
      })
      .optional(),
  })
  .refine(
    (v) =>
      !v.criteriaScores ||
      v.criteriaScores.technicalDepth + v.criteriaScores.innovation + v.criteriaScores.completion + v.criteriaScores.documentation === v.score,
    { message: "Score must equal the sum of the four rubric scores.", path: ["score"] }
  );

export async function POST(request: NextRequest) {
  const auth = await requireUser(request, ["domain_admin", "super_admin"]);
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const parsed = evaluationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid evaluation." },
      { status: 400 }
    );
  }

  try {
    const updatedTask = await evaluateTask({
      ...parsed.data,
      adminId: user.id, // the grader is always the logged-in user
      restrictToDomain: user.role === "domain_admin" ? user.domain : undefined,
    });
    if (!updatedTask) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }
    console.error("Error evaluating task:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
