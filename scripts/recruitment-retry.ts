// Usage: npm run recruitment:retry
// Copies applications that never reached the Google Sheet and re-sends confirmation emails that
// never went out. Safe to run repeatedly.
import { prisma } from "../src/lib/prisma";
import { syncPending } from "../src/lib/recruitment/retry";

syncPending()
  .then((r) => {
    console.log(`Waiting: ${r.waiting}, sheet rows added: ${r.sheetSynced}, emails sent: ${r.emailsSent}, failures: ${r.failed}`);
    if (r.failed > 0) process.exitCode = 1;
  })
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
