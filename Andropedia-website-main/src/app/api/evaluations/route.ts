import { NextRequest, NextResponse } from "next/server";
import { evaluateTask } from "@/lib/data-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, adminId, adminName, score, feedback, criteriaScores } = body;
    if (!taskId || !adminId || score === undefined || !feedback) return NextResponse.json({ success: false, error: "Missing required fields: taskId, adminId, score, feedback" }, { status: 400 });
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) return NextResponse.json({ success: false, error: "Score must be a number between 0 and 100" }, { status: 400 });
    const updatedTask = evaluateTask(taskId, adminId, adminName || "Domain Lead", numScore, feedback, criteriaScores);
    if (!updatedTask) return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error("Error evaluating task:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
