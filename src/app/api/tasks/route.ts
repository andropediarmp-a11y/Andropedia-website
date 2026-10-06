import { NextRequest, NextResponse } from "next/server";
import { getTasks, addTask, NotFoundError } from "@/lib/data-store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const weekId = searchParams.get("weekId");
  const domain = searchParams.get("domain");
  const userId = searchParams.get("userId");
  const status = searchParams.get("status");

  try {
    const tasks = await getTasks({ weekId, domain, userId, status });
    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error("Error loading tasks:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userName, userAvatar, domain, weekId, weekNumber, title, description, githubUrl, liveUrl, figmaUrl, notes } = body;

    if (!userId || !title || !description || !domain || !weekId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: userId, title, description, domain, weekId" },
        { status: 400 }
      );
    }

    const newTask = await addTask({
      userId,
      userName: userName || "Club Member",
      userAvatar: userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      domain,
      weekId,
      weekNumber: Number(weekNumber) || 4,
      title,
      description,
      githubUrl,
      liveUrl,
      figmaUrl,
      notes,
    });

    return NextResponse.json({ success: true, task: newTask }, { status: 201 });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }
    console.error("Error creating task:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
