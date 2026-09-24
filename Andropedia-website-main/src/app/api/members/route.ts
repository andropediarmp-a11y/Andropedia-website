import { NextRequest, NextResponse } from "next/server";
import { getUsers } from "@/lib/data-store";
import { getLiveMembers } from "@/lib/live-members";
import { toPublicMemberProfile } from "@/lib/public-content";

export async function GET(request: NextRequest) {
  const isPublicRequest = request.nextUrl.searchParams.get("scope") === "public";

  if (isPublicRequest) {
    try {
      const liveMembers = await getLiveMembers();
      return NextResponse.json({ success: true, members: liveMembers.map(toPublicMemberProfile), source: "public-profile-view" });
    } catch (error) {
      console.error("Public member sheet error:", error);
      return NextResponse.json({ success: true, members: [], source: "unavailable" });
    }
  }

  try {
    const staff = getUsers().filter((user) => user.role !== "member");
    const liveMembers = await getLiveMembers();
    return NextResponse.json({ success: true, members: [...staff, ...liveMembers] });
  } catch (error) {
    console.error("Live member sheet error:", error);
    return NextResponse.json({ success: true, members: getUsers(), source: "seed-fallback" });
  }
}
