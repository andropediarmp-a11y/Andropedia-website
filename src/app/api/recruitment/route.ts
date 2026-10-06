import { NextRequest, NextResponse } from "next/server";
import { applicationSchema, type ApplicationInput, type StoredApplication } from "@/lib/recruitment/schema";
import { appendApplication, emailExists, setEmailStatus, SheetsNotConfiguredError } from "@/lib/recruitment/sheets";
import { sendConfirmation } from "@/lib/recruitment/email";
import { rateLimited } from "@/lib/recruitment/rate-limit";

const HOUR = 60 * 60 * 1000;

// Emails currently being processed by this server instance, so two simultaneous
// submissions for the same email can't both pass the duplicate check.
const inFlight = new Set<string>();

const fail = (error: string, status: number, fieldErrors?: Record<string, string[]>) =>
  NextResponse.json({ success: false, error, fieldErrors }, { status });

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("The recruitment form could not be processed.", 400);
  }

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    const first = Object.values(fieldErrors).flat()[0] ?? "Please check the form and try again.";
    return fail(first, 400, fieldErrors);
  }
  const input = parsed.data;

  // Honeypot: pretend success, store nothing, send nothing.
  if (input.website) {
    return NextResponse.json({ success: true, reference: "REC-00000000" }, { status: 201 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(`ip:${ip}`, 5, HOUR)) {
    return fail("Too many submissions. Please try again later.", 429);
  }

  // One application per email address.
  if (inFlight.has(input.email)) {
    return fail("An application with this email is already being submitted.", 409);
  }
  inFlight.add(input.email);
  try {
    return await processApplication(input);
  } finally {
    inFlight.delete(input.email);
  }
}

async function processApplication(input: ApplicationInput) {
  try {
    if (await emailExists(input.email)) {
      return fail("An application with this email has already been submitted. Only one application per email is allowed.", 409);
    }
  } catch (err) {
    console.error("Recruitment duplicate check failed:", err instanceof SheetsNotConfiguredError ? err.message : err);
    return fail("We couldn't submit your application right now. Please try again in a few minutes.", 503);
  }

  const app: StoredApplication = {
    reference: `REC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    submittedAt: new Date().toISOString(),
    name: input.name,
    email: input.email,
    year: input.year,
    domain: input.domain,
    skills: input.skills,
    motivation: input.motivation,
    portfolioUrl: input.portfolioUrl,
    consent: true,
  };

  // 1. Save to the sheet. No success screen unless this is confirmed.
  let row: number;
  try {
    row = await appendApplication(app, "pending");
  } catch (err) {
    console.error("Recruitment sheet write failed:", err instanceof SheetsNotConfiguredError ? err.message : err);
    return fail("We couldn't submit your application right now. Please try again in a few minutes.", 503);
  }

  // 2. Confirmation email. A failure never rejects the application: the row is
  //    marked "failed" and `npm run recruitment:resend-failed` retries it.
  let status: "sent" | "failed" = "sent";
  try {
    await sendConfirmation(app);
  } catch (err) {
    status = "failed";
    console.error(`Confirmation email failed for ${app.reference}:`, err);
  }
  try {
    await setEmailStatus(row, status);
  } catch (err) {
    console.error(`Could not update email_status for ${app.reference}:`, err);
  }

  return NextResponse.json({ success: true, reference: app.reference }, { status: 201 });
}
