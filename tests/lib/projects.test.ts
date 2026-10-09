import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ requireUser: vi.fn() }));
vi.mock("@/lib/audit", () => ({ recordAudit: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { project: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } },
}));

import { POST as create } from "@/app/api/admin/projects/route";
import { DELETE, PATCH } from "@/app/api/admin/projects/[id]/route";
import { GET as publicList } from "@/app/api/projects/route";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectCreateSchema } from "@/lib/projects";

const row = {
  id: "p1", title: "AndroOJ", domain: "Technical", description: "A sandboxed judge for contests.", tags: ["Go"],
  github: "https://github.com/andropedia/androoj", live: null, status: "In progress", isPublished: true,
  createdAt: new Date(), updatedAt: new Date(),
};
const call = (method: string, body?: unknown) => new NextRequest("http://localhost/api/admin/projects", { method, body: body === undefined ? undefined : JSON.stringify(body) });
const ctx = { params: Promise.resolve({ id: "p1" }) };

beforeEach(() => {
  vi.mocked(requireUser).mockResolvedValue({ ok: true, user: { id: "u1", role: "super_admin" } } as never);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});
afterEach(() => vi.clearAllMocks());

describe("projectCreateSchema", () => {
  const valid = { title: "AndroOJ", domain: "Technical", description: "A sandboxed judge for contests." };
  it("fills defaults: unpublished, no tags, no links", () => {
    expect(projectCreateSchema.parse(valid)).toMatchObject({ isPublished: false, tags: [], status: "In progress" });
  });
  it("turns an empty link into null and rejects non-http links", () => {
    expect(projectCreateSchema.parse({ ...valid, github: "" }).github).toBeNull();
    expect(projectCreateSchema.safeParse({ ...valid, live: "javascript:alert(1)" }).success).toBe(false);
  });
  it("rejects an unknown domain", () => {
    expect(projectCreateSchema.safeParse({ ...valid, domain: "Cooking" }).success).toBe(false);
  });
});

describe("GET /api/projects (public)", () => {
  it("lists only published projects and never exposes the draft flag", async () => {
    vi.mocked(prisma.project.findMany).mockResolvedValue([row] as never);
    const json = await (await publicList()).json();
    expect(vi.mocked(prisma.project.findMany).mock.calls[0][0]).toMatchObject({ where: { isPublished: true } });
    expect(json.projects[0]).toMatchObject({ title: "AndroOJ" });
    expect(json.projects[0]).not.toHaveProperty("isPublished");
  });
});

describe("admin project routes", () => {
  it("are closed to anyone but a super admin", async () => {
    vi.mocked(requireUser).mockResolvedValue({ ok: false, response: new Response(null, { status: 403 }) } as never);
    expect((await create(call("POST", {}))).status).toBe(403);
    expect((await PATCH(call("PATCH", { title: "x" }), ctx)).status).toBe(403);
    expect((await DELETE(call("DELETE"), ctx)).status).toBe(403);
    expect(prisma.project.create).not.toHaveBeenCalled();
    expect(prisma.project.delete).not.toHaveBeenCalled();
  });

  it("creates a project and returns 201", async () => {
    vi.mocked(prisma.project.create).mockResolvedValue(row as never);
    const res = await create(call("POST", { title: "AndroOJ", domain: "Technical", description: "A sandboxed judge for contests." }));
    expect(res.status).toBe(201);
  });

  it("rejects an invalid project with 400", async () => {
    expect((await create(call("POST", { title: "x" }))).status).toBe(400);
  });

  it("publishes with a patch, and refuses an empty patch", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue(row as never);
    vi.mocked(prisma.project.update).mockResolvedValue(row as never);
    expect((await PATCH(call("PATCH", { isPublished: true }), ctx)).status).toBe(200);
    expect((await PATCH(call("PATCH", {}), ctx)).status).toBe(400);
  });

  it("returns 404 when the project doesn't exist", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue(null);
    expect((await DELETE(call("DELETE"), ctx)).status).toBe(404);
  });
});
