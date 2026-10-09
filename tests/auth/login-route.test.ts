import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ isSameOrigin: vi.fn(() => true), loginWithPassword: vi.fn(), setSessionCookie: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: {} })); // no database: the limiter falls back to memory

import { POST } from "@/app/api/auth/login/route";
import { isSameOrigin, loginWithPassword, setSessionCookie } from "@/lib/auth";
import { resetRateLimits } from "@/lib/recruitment/rate-limit";

let ip = 0;
const login = (body: unknown, address = `10.3.0.${++ip}`) =>
  POST(
    new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json", "x-forwarded-for": address },
    })
  );
const creds = { registerNo: "RA2511026020025", password: "RA2511026020025" };

beforeEach(() => {
  resetRateLimits();
  vi.mocked(isSameOrigin).mockReturnValue(true);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});
afterEach(() => vi.clearAllMocks());

describe("POST /api/auth/login", () => {
  it("sets the session cookie and returns the user on success", async () => {
    const expires = new Date();
    vi.mocked(loginWithPassword).mockResolvedValue({ user: { id: "u1" } as never, token: "tok", expires });
    const res = await login(creds);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, user: { id: "u1" } });
    expect(setSessionCookie).toHaveBeenCalledWith(expect.anything(), "tok", expires);
  });

  it("gives one identical answer for a wrong password and an unknown register number", async () => {
    vi.mocked(loginWithPassword).mockResolvedValue(null);
    const a = await login(creds);
    const b = await login({ registerNo: "RA0000000000000", password: "nope" });
    expect(a.status).toBe(401);
    expect(await a.json()).toEqual(await b.json());
    expect(setSessionCookie).not.toHaveBeenCalled();
  });

  it("locks an account after 20 tries an hour, even from different addresses", async () => {
    vi.mocked(loginWithPassword).mockResolvedValue(null);
    for (let i = 0; i < 20; i++) expect((await login(creds)).status).toBe(401);
    const res = await login(creds);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
    expect(loginWithPassword).toHaveBeenCalledTimes(20);
  });

  it("limits one address to 30 tries an hour across accounts", async () => {
    vi.mocked(loginWithPassword).mockResolvedValue(null);
    for (let i = 0; i < 30; i++) await login({ registerNo: `RA25110260200${String(i).padStart(2, "0")}`, password: "x" }, "9.9.9.9");
    expect((await login({ registerNo: "RA2511026020099", password: "x" }, "9.9.9.9")).status).toBe(429);
  });

  it("blocks cross-site posts and malformed bodies", async () => {
    vi.mocked(isSameOrigin).mockReturnValue(false);
    expect((await login(creds)).status).toBe(403);
    vi.mocked(isSameOrigin).mockReturnValue(true);
    expect((await login({ registerNo: "x" })).status).toBe(400);
    expect(loginWithPassword).not.toHaveBeenCalled();
  });
});
