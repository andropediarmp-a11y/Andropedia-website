import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ issueLoginCode: vi.fn(), isSameOrigin: vi.fn(() => true) }));

import { POST } from "@/app/api/auth/request-code/route";
import { issueLoginCode, isSameOrigin } from "@/lib/auth";
import { resetRateLimits } from "@/lib/recruitment/rate-limit";

let ip = 0;
const send = (email = "a@college.edu") =>
  POST(
    new NextRequest("http://localhost/api/auth/request-code", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "content-type": "application/json", "x-forwarded-for": `10.2.0.${++ip}` },
    })
  );

beforeEach(() => {
  resetRateLimits();
  vi.mocked(isSameOrigin).mockReturnValue(true);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});
afterEach(() => vi.clearAllMocks());

describe("POST /api/auth/request-code", () => {
  it("answers identically whether the code was sent, rate-limited or the email is unknown", async () => {
    const bodies: unknown[] = [];
    for (const result of ["sent", "rate_limited", "unknown"] as const) {
      vi.mocked(issueLoginCode).mockResolvedValue(result);
      const res = await send();
      expect(res.status).toBe(200);
      bodies.push(await res.json());
    }
    expect(bodies[1]).toEqual(bodies[0]);
    expect(bodies[2]).toEqual(bodies[0]);
  });

  it("rejects a bad email with 400", async () => {
    expect((await send("not-an-email")).status).toBe(400);
    expect(issueLoginCode).not.toHaveBeenCalled();
  });

  it("blocks cross-site requests", async () => {
    vi.mocked(isSameOrigin).mockReturnValue(false);
    expect((await send()).status).toBe(403);
  });

  it("reports a send failure as 503", async () => {
    vi.mocked(issueLoginCode).mockRejectedValue(new Error("smtp down"));
    expect((await send()).status).toBe(503);
  });
});
