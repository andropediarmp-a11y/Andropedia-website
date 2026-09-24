import { NextRequest, NextResponse } from "next/server";
import { getTasks, addTask } from "@/lib/data-store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const weekId = searchParams.get("weekId");
  const domain = searchParams.get("domain");
  const userId = searchParams.get("userId");
  const status = searchParams.get("status");
  let tasks = getTasks();
  if (weekId && weekId !== "all") tasks = tasks.filter((t) => t.weekId === weekId);
  if (domain && domain !== "All") tasks = tasks.filter((t) => t.domain.toLowerCase() === domain.toLowerCase());
  if (userId) tasks = tasks.filter((t) => t.userId === userId);
  if (status) tasks = tasks.filter((t) => t.status === status);
  return NextResponse.json({ success: true, tasks });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userName, userAvatar, domain, weekId, weekNumber, title, description, githubUrl, liveUrl, figmaUrl, notes } = body;
    if (!userId || !title || !description || !domain || !weekId) return NextResponse.json({ success: false, error: "Missing required fields: userId, title, description, domain, weekId" }, { status: 400 });
    const newTask = addTask({ userId, userName: userName || "Club Member", userAvatar: userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", domain, weekId, weekNumber: Number(weekNumber) || 4, title, description, githubUrl, liveUrl, figmaUrl, notes });
    return NextResponse.json({ success: true, task: newTask }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
