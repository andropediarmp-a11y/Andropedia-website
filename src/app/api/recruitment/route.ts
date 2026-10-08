import { NextRequest, NextResponse, after } from "next/server";
import { allowedEmailDomains } from "@/lib/env";
import { clientIp, jsonError, readJson } from "@/lib/http";
import { log } from "@/lib/logger";
import { getCycleStatus } from "@/lib/recruitment/cycle";
import { isAllowedDomain } from "@/lib/recruitment/email-key";
import { sendConfirmation } from "@/lib/recruitment/email";
import { markOutboxEmailSent, outboxHasEmail, queueApplication } from "@/lib/recruitment/outbox";
import { checkRateLimit } from "@/lib/recruitment/rate-limit";
import { applicationSchema, type ApplicationInput, type StoredApplication } from "@/lib/recruitment/schema";
import { appendApplication, emailExists, setEmailStatus, SheetsNotConfiguredError } from "@/lib/recruitment/sheets";

const HOUR = 60 * 60 * 1000;
const DUPLICATE = "An application with this email has already been submitted. Only one application per email is allowed.";
const TRY_LATER = "We couldn't submit your application right now. Please try again in a few minutes.";

// Emails currently being processed by this server instance, so two simultaneous
// submissions for the same email can't both pass the duplicate check.
const inFlight = new Set<string>();

const newReference = () => `REC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

export async function POST(request: NextRequest) {
  const body = await readJson(request);
  if (!body.ok) return body.response;

  // Deadline and open/close are enforced here, not just in the UI.
  const cycle = getCycleStatus();
  if (cycle.state !== "open") return jsonError(cycle.message, 403);

  const parsed = applicationSchema.safeParse(body.data);
  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    const first = Object.values(fieldErrors).flat()[0] ?? "Please check the form and try again.";
    return jsonError(first, 400, { fieldErrors });
  }
  const input = parsed.data;

  // Honeypot: pretend success, store nothing, send nothing.
  if (input.website) {
    return NextResponse.json({ success: true, reference: newReference() }, { status: 201 });
  }

  const limit = checkRateLimit(`apply-ip:${clientIp(request)}`, 5, HOUR);
  if (limit.limited) {
    return jsonError("Too many submissions. Please try again later.", 429, {
      headers: { "Retry-After": String(limit.retryAfterSec) },
    });
  }

  if (!isAllowedDomain(input.email, allowedEmailDomains())) {
    const message = "Please use your college email address.";
    return jsonError(message, 400, { fieldErrors: { email: [message] } });
  }

  // One application per email address.
  const key = input.email.toLowerCase();
  if (inFlight.has(key)) return jsonError("An application with this email is already being submitted.", 409);
  inFlight.add(key);
  try {
    return await processApplication(input);
  } finally {
    inFlight.delete(key);
  }
}

async function processApplication(input: ApplicationInput) {
  const app: StoredApplication = {
    reference: newReference(),
    submittedAt: new Date().toISOString(),
    name: input.name,
    email: input.email,
    year: input.year,
    domain: input.domain,
    skills: input.skills,
    motivation: input.motivation,
    domainAnswer: input.domainAnswer,
    portfolioUrl: input.portfolioUrl,
    consent: true,
  };

  // 1. Duplicate check against the sheet and against applications waiting in the outbox.
  //    If the sheet can't be reached we carry on and queue; the flush re-checks the sheet.
  let sheetUsable = true;
  try {
    if (await emailExists(input.email)) return jsonError(DUPLICATE, 409);
  } catch (err) {
    sheetUsable = false;
    if (err instanceof SheetsNotConfiguredError) log.warn("Google Sheets is not configured; queueing applications");
    else log.error("Sheet duplicate check failed; queueing application", err, { reference: app.reference });
  }
  try {
    if (await outboxHasEmail(input.email)) return jsonError(DUPLICATE, 409);
  } catch (err) {
    log.error("Outbox duplicate check failed", err, { reference: app.reference });
  }

  // 2. Save to the sheet (retried inside appendApplication).
  if (sheetUsable) {
    try {
      const row = await appendApplication(app, "pending");
      after(() => confirmSheetRow(app, row));
      return NextResponse.json({ success: true, reference: app.reference }, { status: 201 });
    } catch (err) {
      log.error("Sheet write failed after retries; queueing application", err, { reference: app.reference });
    }
  }

  // 3. Fallback: keep the application in the database so it is never lost.
  try {
    if ((await queueApplication(app)) === "duplicate") return jsonError(DUPLICATE, 409);
    after(() => confirmQueued(app));
    log.info("Application queued in outbox", { reference: app.reference });
    return NextResponse.json({ success: true, reference: app.reference, queued: true }, { status: 202 });
  } catch (err) {
    log.error("Could not save application anywhere", err, { reference: app.reference });
    return jsonError(TRY_LATER, 503);
  }
}

/** Runs after the response: emails the applicant and records the result in the sheet. */
async function confirmSheetRow(app: StoredApplication, row: number) {
  let status: "sent" | "failed" = "sent";
  try {
    await sendConfirmation(app);
  } catch (err) {
    status = "failed";
    log.warn("Confirmation email failed", { reference: app.reference }, err);
  }
  try {
    await setEmailStatus(row, status);
  } catch (err) {
    log.warn("Could not update email_status", { reference: app.reference }, err);
  }
}

async function confirmQueued(app: StoredApplication) {
  try {
    await sendConfirmation(app);
    await markOutboxEmailSent(app.reference);
  } catch (err) {
    log.warn("Confirmation email failed for queued application", { reference: app.reference }, err);
  }
}
