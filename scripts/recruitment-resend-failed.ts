// Usage: npm run recruitment:resend-failed
// Re-sends the confirmation email for every application that never got one (emailSentAt empty).
import { prisma } from "../src/lib/prisma";
import { sendConfirmation } from "../src/lib/recruitment/email";
import type { StoredApplication } from "../src/lib/recruitment/schema";

async function main() {
  const rows = await prisma.application.findMany({ where: { emailSentAt: null }, orderBy: { createdAt: "asc" } });
  console.log(`${rows.length} application(s) need a confirmation email.`);
  let sent = 0;
  for (const row of rows) {
    const app: StoredApplication = {
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
      answers: (row.answers ?? {}) as Record<string, string>,
      consent: row.consent,
    };
    try {
      await sendConfirmation(app);
      await prisma.application.update({ where: { id: row.id }, data: { emailSentAt: new Date() } });
      sent++;
      console.log(`sent  ${app.reference} -> ${app.email}`);
    } catch (err) {
      console.error(`FAIL  ${app.reference}:`, err instanceof Error ? err.message : err);
    }
  }
  console.log(`Done: ${sent}/${rows.length} sent.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
