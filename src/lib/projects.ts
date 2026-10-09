import type { Project as DbProject } from "@prisma/client";
import { z } from "zod";
import { recordAudit } from "./audit";
import { NotFoundError } from "./data-store";
import { PROJECT_DOMAINS, type ProjectView } from "./projects-shared";
import { prisma } from "./prisma";

export { PROJECT_DOMAINS, type ProjectView };

const link = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || (/^https?:\/\//i.test(v) && URL.canParse(v)), "Enter a valid http(s) link.")
  .transform((v) => v || null);

const fields = {
  title: z.string().trim().min(3, "Add a title.").max(120),
  domain: z.enum(PROJECT_DOMAINS, "Choose a domain."),
  description: z.string().trim().min(10, "Add a short description.").max(1000),
  tags: z.array(z.string().trim().min(1).max(30)).max(8),
  github: link.nullable(),
  live: link.nullable(),
  status: z.string().trim().min(2).max(40),
  isPublished: z.boolean(),
};

export const projectCreateSchema = z.object({
  ...fields,
  tags: fields.tags.default([]),
  github: fields.github.optional(),
  live: fields.live.optional(),
  status: fields.status.default("In progress"),
  isPublished: fields.isPublished.default(false),
});
export const projectPatchSchema = z.object(fields).partial();
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectPatchInput = z.infer<typeof projectPatchSchema>;

const view = (p: DbProject): ProjectView => ({
  id: p.id,
  title: p.title,
  domain: p.domain,
  description: p.description,
  tags: p.tags,
  github: p.github,
  live: p.live,
  status: p.status,
  isPublished: p.isPublished,
});

export async function listPublicProjects(): Promise<Omit<ProjectView, "isPublished">[]> {
  const rows = await prisma.project.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" } });
  return rows.map((p) => {
    const { isPublished, ...pub } = view(p);
    void isPublished;
    return pub;
  });
}

export async function listAdminProjects(): Promise<ProjectView[]> {
  return (await prisma.project.findMany({ orderBy: { createdAt: "desc" } })).map(view);
}

export async function createProject(input: ProjectCreateInput, actorId: string): Promise<ProjectView> {
  const created = await prisma.project.create({ data: { ...input, github: input.github ?? null, live: input.live ?? null } });
  await recordAudit({ actorId, action: "project.create", target: created.id, meta: { title: created.title } });
  return view(created);
}

export async function updateProject(id: string, patch: ProjectPatchInput, actorId: string): Promise<ProjectView> {
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Project not found.");
  const updated = await prisma.project.update({ where: { id }, data: patch });
  await recordAudit({ actorId, action: "project.update", target: id, meta: { fields: Object.keys(patch) } });
  return view(updated);
}

export async function deleteProject(id: string, actorId: string): Promise<void> {
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Project not found.");
  await prisma.project.delete({ where: { id } });
  await recordAudit({ actorId, action: "project.delete", target: id, meta: { title: existing.title } });
}
