// Usage: npm run recruitment:flush-outbox
// Copies applications that were queued in the database (because the Google Sheet was
// unreachable or not configured) into the sheet, and sends any confirmation emails that
// never went out. Safe to run repeatedly.
import { prisma } from "../src/lib/prisma";
import { flushOutbox } from "../src/lib/recruitment/outbox";

flushOutbox()
  .then((r) => {
    console.log(`Waiting: ${r.waiting}, flushed: ${r.flushed}, duplicates skipped: ${r.duplicates}, failed: ${r.failed}`);
    if (r.failed > 0) process.exitCode = 1;
  })
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
