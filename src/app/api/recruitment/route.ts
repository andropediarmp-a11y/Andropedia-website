import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse, after } from "next/server";
import { clientIp, jsonError, readJson } from "@/lib/http";
import { log } from "@/lib/logger";
import { getCycleStatus } from "@/lib/recruitment/cycle";
import { emailKey } from "@/lib/recruitment/email-key";
import { sendConfirmation } from "@/lib/recruitment/email";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit-db";
import { parseApplication, type ApplicationInput, type StoredApplication } from "@/lib/recruitment/schema";
import { appendApplication, SheetsNotConfiguredError } from "@/lib/recruitment/sheets";

const HOUR = 60 * 60 * 1000;
const DUPLICATE = "An application with this email has already been submitted. Only one application per email is allowed.";
const TRY_LATER = "We couldn't submit your application right now. Please try again in a few minutes.";

const newReference = () => `REC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

export async function POST(request: NextRequest) {
  const body = await readJson(request);
  if (!body.ok) return body.response;

  // Deadline and open/close are enforced here, not just in the UI.
  const cycle = getCycleStatus();
  if (cycle.state !== "open") return jsonError(cycle.message, 403);

  const parsed = parseApplication(body.data);
  if (!parsed.success) {
    const first = Object.values(parsed.fieldErrors).flat()[0] ?? "Please check the form and try again.";
    return jsonError(first, 400, { fieldErrors: parsed.fieldErrors });
  }
  const input = parsed.data;

  // Honeypot: pretend success, store nothing, send nothing.
  if (input.website) {
    return NextResponse.json({ success: true, reference: newReference() }, { status: 201 });
  }

  const limit = await rateLimit(`apply-ip:${clientIp(request)}`, 5, HOUR);
  if (limit.limited) {
    return jsonError("Too many submissions. Please try again later.", 429, {
      headers: { "Retry-After": String(limit.retryAfterSec) },
    });
  }

  // One application per email address: the unique emailKey column decides, even across instances.
  return processApplication(input);
}

async function processApplication(input: ApplicationInput) {
  const app: StoredApplication = {
    reference: newReference(),
    submittedAt: new Date().toISOString(),
    name: input.name,
    registerNo: input.registerNo,
    department: input.department,
    year: input.year,
    phone: input.phone,
    email: input.email,
    profile: input.profile,
    domain: input.domain,
    answers: input.answers,
    consent: true,
  };

  // 1. The database is the source of truth. The unique emailKey enforces one application per person.
  try {
    await prisma.application.create({
      data: {
        reference: app.reference,
        emailKey: emailKey(app.email),
        name: app.name,
        registerNo: app.registerNo,
        department: app.department,
        year: app.year,
        phone: app.phone,
        email: app.email,
        profile: app.profile,
        domain: app.domain,
        answers: app.answers,
        consent: true,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return jsonError(DUPLICATE, 409);
    log.error("Could not save application", err, { reference: app.reference });
    return jsonError(TRY_LATER, 503);
  }

  // 2. After the response: mirror to the Google Sheet (if configured) and email the applicant.
  after(() => finishApplication(app));
  return NextResponse.json({ success: true, reference: app.reference }, { status: 201 });
}

async function finishApplication(app: StoredApplication) {
  let emailStatus: "sent" | "failed" = "sent";
  try {
    await sendConfirmation(app);
    await prisma.application.update({ where: { reference: app.reference }, data: { emailSentAt: new Date() } });
  } catch (err) {
    emailStatus = "failed";
    log.warn("Confirmation email failed", { reference: app.reference }, err);
  }
  try {
    await appendApplication(app, emailStatus === "sent" ? "sent" : "failed");
    await prisma.application.update({ where: { reference: app.reference }, data: { sheetSyncedAt: new Date() } });
  } catch (err) {
    if (err instanceof SheetsNotConfiguredError) return; // the sheet is optional
    log.warn("Sheet mirror failed; the application is safe in the database", { reference: app.reference }, err);
  }
}
