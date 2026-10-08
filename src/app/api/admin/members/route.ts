import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getUsers } from "@/lib/data-store";

// Full member list including emails: super admins only.
export async function GET(request: NextRequest) {
  const auth = await requireUser(request, ["super_admin"]);
  if (!auth.ok) return auth.response;
  return NextResponse.json({ success: true, members: await getUsers() });
}
