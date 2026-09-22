import { NextResponse } from "next/server";
import { getUsers } from "@/lib/data-store";
import { getLiveMembers } from "@/lib/live-members";

export async function GET() {
  try {
    const staff = getUsers().filter((user) => user.role !== "member");
    const liveMembers = await getLiveMembers();
    return NextResponse.json({ success: true, members: [...staff, ...liveMembers] });
  } catch (error) {
    console.error("Live member sheet error:", error);
    return NextResponse.json({
      success: true,
      members: getUsers(),
      source: "seed-fallback",
    });
  }
}
