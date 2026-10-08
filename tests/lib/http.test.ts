import { describe, expect, it } from "vitest";
import { clientIp, jsonError, readJson } from "@/lib/http";

const req = (body: string, headers: Record<string, string> = {}) =>
  new Request("http://localhost/x", { method: "POST", body, headers });

describe("readJson", () => {
  it("parses a valid body", async () => {
    const r = await readJson(req('{"a":1}'));
    expect(r).toEqual({ ok: true, data: { a: 1 } });
  });
  it("rejects invalid JSON with 400", async () => {
    const r = await readJson(req("{nope"));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.response.status).toBe(400);
  });
  it("rejects an oversized body with 413 (declared and actual)", async () => {
    const big = JSON.stringify({ x: "y".repeat(200) });
    const declared = await readJson(req(big, { "content-length": String(big.length) }), 50);
    const actual = await readJson(req(big), 50);
    for (const r of [declared, actual]) {
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.response.status).toBe(413);
    }
  });
});

describe("clientIp", () => {
  it("prefers the first x-forwarded-for hop, then x-real-ip", () => {
    expect(clientIp(new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } }))).toBe("1.2.3.4");
    expect(clientIp(new Request("http://x", { headers: { "x-real-ip": "9.9.9.9" } }))).toBe("9.9.9.9");
    expect(clientIp(new Request("http://x"))).toBe("unknown");
  });
});

describe("jsonError", () => {
  it("uses one consistent shape", async () => {
    const res = jsonError("Nope", 400, { fieldErrors: { email: ["bad"] }, headers: { "Retry-After": "5" } });
    expect(res.status).toBe(400);
    expect(res.headers.get("Retry-After")).toBe("5");
    expect(await res.json()).toEqual({ success: false, error: "Nope", fieldErrors: { email: ["bad"] } });
  });
});
