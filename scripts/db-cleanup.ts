// Usage: npm run db:cleanup
// Deletes expired sessions and login codes older than a day.
import { prisma } from "../src/lib/prisma";
import { purgeExpired } from "../src/lib/maintenance";

purgeExpired()
  .then((r) => console.log(`Removed ${r.expiredSessions} expired session(s) and ${r.oldLoginCodes} old login code(s).`))
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
