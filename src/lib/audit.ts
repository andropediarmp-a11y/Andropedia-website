import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { log } from "./logger";

type Tx = Prisma.TransactionClient | typeof prisma;

/**
 * Records who changed what (grading, week changes, role/account changes). Never throws: a failed
 * audit write is logged, but must not undo the change it describes.
 */
export async function recordAudit(
  entry: { actorId: string; action: string; target: string; meta?: Record<string, unknown> },
  db: Tx = prisma
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        target: entry.target,
        meta: (entry.meta ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    log.error("Audit log write failed", err, { action: entry.action, target: entry.target });
  }
}

export async function listAudit(limit = 100) {
  const rows = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: Math.min(Math.max(limit, 1), 500) });
  return rows.map((r) => ({ id: r.id, actorId: r.actorId, action: r.action, target: r.target, meta: r.meta, createdAt: r.createdAt.toISOString() }));
}
