// Usage: npm run recruitment:resend-failed
// Re-sends the confirmation email for every row whose email_status is "failed" or "pending".
import { readApplications, setEmailStatus } from "../src/lib/recruitment/sheets";
import { sendConfirmation } from "../src/lib/recruitment/email";

async function main() {
  const rows = (await readApplications()).filter(
    (r) => (r.status === "failed" || r.status === "pending") && r.app.email
  );
  console.log(`${rows.length} application(s) need a confirmation email.`);
  let sent = 0;
  for (const { row, app } of rows) {
    try {
      await sendConfirmation(app);
      await setEmailStatus(row, "sent");
      sent++;
      console.log(`sent  ${app.reference} -> ${app.email}`);
    } catch (err) {
      console.error(`FAIL  ${app.reference}:`, err instanceof Error ? err.message : err);
    }
  }
  console.log(`Done: ${sent}/${rows.length} sent.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
