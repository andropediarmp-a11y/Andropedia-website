import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ fileId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { fileId } = await params;

  if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return NextResponse.json({ error: "Invalid photo id" }, { status: 400 });
  }

  const response = await fetch(
    `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w400-h400`,
    { cache: "no-store" }
  );

  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || !contentType.startsWith("image/")) {
    return NextResponse.json({ error: "Member photo unavailable" }, { status: 404 });
  }

  return new NextResponse(response.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}