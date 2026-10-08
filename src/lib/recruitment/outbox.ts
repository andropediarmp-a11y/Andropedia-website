import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { log } from "../logger";
import { emailHash } from "./email-key";
import { sendConfirmation } from "./email";
import { appendApplication, emailExists, findRowByReference, setEmailStatus } from "./sheets";
import type { StoredApplication } from "./schema";

/** Stores an accepted application durably when the sheet can't take it right now. */
export async function queueApplication(app: StoredApplication): Promise<"queued" | "duplicate"> {
  try {
    await prisma.recruitmentOutbox.create({
      data: {
        reference: app.reference,
        emailHash: emailHash(app.email),
        payload: app as unknown as Prisma.InputJsonValue,
      },
    });
    return "queued";
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return "duplicate";
    throw err;
  }
}

/** True if this person already has an application waiting in the outbox. */
export async function outboxHasEmail(email: string): Promise<boolean> {
  return (await prisma.recruitmentOutbox.count({ where: { emailHash: emailHash(email) } })) > 0;
}

export async function markOutboxEmailSent(reference: string): Promise<void> {
  await prisma.recruitmentOutbox.updateMany({ where: { reference }, data: { emailSentAt: new Date() } });
}

export interface FlushResult {
  waiting: number;
  flushed: number;
  duplicates: number;
  failed: number;
}

/**
 * Copies queued applications into the sheet (and sends any confirmation email that never went
 * out). Safe to run repeatedly and from several places at once: a row already in the sheet is
 * recognised by its reference, so nothing is written twice.
 */
export async function flushOutbox(limit = 100): Promise<FlushResult> {
  const rows = await prisma.recruitmentOutbox.findMany({
    where: { sentAt: null },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  const result: FlushResult = { waiting: rows.length, flushed: 0, duplicates: 0, failed: 0 };

  for (const item of rows) {
    const app = item.payload as unknown as StoredApplication;
    try {
      let sheetRow = await findRowByReference(item.reference);
      let note: string | null = null;

      if (sheetRow === null) {
        if (await emailExists(app.email)) {
          // Someone with this address got into the sheet while this one waited: keep the first.
          note = "duplicate email already in sheet";
          result.duplicates++;
        } else {
          sheetRow = await appendApplication(app, item.emailSentAt ? "sent" : "pending");
        }
      }

      let emailSentAt = item.emailSentAt;
      if (sheetRow !== null && !emailSentAt) {
        try {
          await sendConfirmation(app);
          emailSentAt = new Date();
          await setEmailStatus(sheetRow, "sent");
        } catch (err) {
          log.warn("Confirmation email failed during outbox flush", { reference: item.reference }, err);
          await setEmailStatus(sheetRow, "failed").catch(() => undefined);
        }
      }

      await prisma.recruitmentOutbox.update({
        where: { id: item.id },
        data: { sentAt: new Date(), emailSentAt, lastError: note, payload: {} }, // answers are dropped once in the sheet
      });
      if (!note) result.flushed++;
    } catch (err) {
      result.failed++;
      log.error("Outbox flush failed for an application", err, { reference: item.reference });
      await prisma.recruitmentOutbox
        .update({
          where: { id: item.id },
          data: { attempts: { increment: 1 }, lastError: err instanceof Error ? err.message.slice(0, 200) : "unknown error" },
        })
        .catch(() => undefined);
    }
  }
  return result;
}
