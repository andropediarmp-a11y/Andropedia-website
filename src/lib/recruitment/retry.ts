import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { log } from "../logger";
import { sendConfirmation } from "./email";
import type { StoredApplication } from "./schema";
import { appendApplication, findRowByReference, mirrorNeedsLookup, sheetMirrorConfigured, SheetsNotConfiguredError } from "./sheets";

export interface RetryResult {
  waiting: number;
  sheetSynced: number;
  emailsSent: number;
  failed: number;
}

/** Applications still missing a sheet copy (only if a sheet is configured) or a confirmation email. */
export function pendingWhere(): Prisma.ApplicationWhereInput {
  return sheetMirrorConfigured() ? { OR: [{ sheetSyncedAt: null }, { emailSentAt: null }] } : { emailSentAt: null };
}

// Rows younger than this are still being handled by the request that created them.
const GRACE_MS = 2 * 60 * 1000;

interface Row {
  reference: string; createdAt: Date; name: string; registerNo: string; department: string; year: string;
  phone: string; email: string; profile: string; domain: string; answers: unknown; consent: boolean;
}

const toStored = (row: Row): StoredApplication => ({
  reference: row.reference,
  submittedAt: row.createdAt.toISOString(),
  name: row.name,
  registerNo: row.registerNo,
  department: row.department,
  year: row.year,
  phone: row.phone,
  email: row.email,
  profile: row.profile,
  domain: row.domain,
  answers: row.answers as Record<string, string>,
  consent: row.consent,
});

/**
 * Finishes what the request could not: copies applications that never reached the Google Sheet
 * and sends confirmation emails that never went out. Safe to run repeatedly and in parallel with
 * itself: a row already in the sheet is recognised by its reference, so nothing is written twice.
 */
export async function syncPending(limit = 100, now = new Date()): Promise<RetryResult> {
  const rows = await prisma.application.findMany({
    where: { AND: [pendingWhere(), { createdAt: { lt: new Date(now.getTime() - GRACE_MS) } }] },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  const result: RetryResult = { waiting: rows.length, sheetSynced: 0, emailsSent: 0, failed: 0 };
  let sheetAvailable = true;

  for (const row of rows) {
    const app = toStored(row);
    let emailSent = row.emailSentAt !== null;

    if (!emailSent) {
      try {
        await sendConfirmation(app);
        await prisma.application.update({ where: { reference: row.reference }, data: { emailSentAt: new Date() } });
        emailSent = true;
        result.emailsSent++;
      } catch (err) {
        result.failed++;
        log.warn("Confirmation email retry failed", { reference: row.reference }, err);
      }
    }

    if (row.sheetSyncedAt === null && sheetAvailable && sheetMirrorConfigured()) {
      try {
        const existing = mirrorNeedsLookup() ? await findRowByReference(row.reference) : null;
        if (existing === null) await appendApplication(app, emailSent ? "sent" : "failed");
        await prisma.application.update({ where: { reference: row.reference }, data: { sheetSyncedAt: new Date() } });
        result.sheetSynced++;
      } catch (err) {
        if (err instanceof SheetsNotConfiguredError) {
          sheetAvailable = false; // the sheet is optional: stop trying for this run
        } else {
          result.failed++;
          log.warn("Sheet sync retry failed", { reference: row.reference }, err);
        }
      }
    }
  }
  return result;
}
