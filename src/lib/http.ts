import { NextResponse } from "next/server";

/** Best-effort client IP. Only trustworthy behind a proxy that sets these headers (e.g. Vercel). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** One error shape for every API route: { success: false, error, fieldErrors? }. */
export function jsonError(
  error: string,
  status: number,
  opts: { fieldErrors?: Record<string, string[]>; headers?: Record<string, string> } = {}
) {
  return NextResponse.json(
    { success: false, error, ...(opts.fieldErrors ? { fieldErrors: opts.fieldErrors } : {}) },
    { status, headers: opts.headers }
  );
}

export type JsonBody = { ok: true; data: unknown } | { ok: false; response: NextResponse };

/** Reads a JSON body, refusing anything larger than `maxBytes` before parsing it. */
export async function readJson(request: Request, maxBytes = 32 * 1024): Promise<JsonBody> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) {
    return { ok: false, response: jsonError("Request is too large.", 413) };
  }
  let text: string;
  try {
    text = await request.text();
  } catch {
    return { ok: false, response: jsonError("The request could not be read.", 400) };
  }
  if (new TextEncoder().encode(text).length > maxBytes) {
    return { ok: false, response: jsonError("Request is too large.", 413) };
  }
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false, response: jsonError("The request body must be valid JSON.", 400) };
  }
}
