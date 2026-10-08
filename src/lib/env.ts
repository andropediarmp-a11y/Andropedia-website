import { z } from "zod";

// Central, validated view of the environment. Empty values (KEY=) count as unset.
const blank = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);
const text = z.preprocess(blank, z.string().optional());
const isoDate = z.preprocess(blank, z.iso.datetime({ offset: true, error: "must be an ISO date with a timezone, e.g. 2026-10-20T23:59:00+05:30" }).optional());

const schema = z.object({
  NODE_ENV: text,
  DATABASE_URL: text,
  AUTH_SECRET: text,
  GOOGLE_SERVICE_ACCOUNT_EMAIL: text,
  GOOGLE_PRIVATE_KEY: text,
  RECRUITMENT_SHEET_ID: text,
  RECRUITMENT_SHEET_TAB: text,
  SMTP_HOST: text,
  SMTP_PORT: z.preprocess(blank, z.coerce.number().int().min(1).max(65535).optional()),
  SMTP_USER: text,
  SMTP_PASS: text,
  EMAIL_FROM: text,
  EMAIL_REPLY_TO: text,
  RECRUITMENT_OPEN: z.preprocess(blank, z.enum(["true", "false"]).optional()),
  RECRUITMENT_OPENS_AT: isoDate,
  RECRUITMENT_CLOSES_AT: isoDate,
  RECRUITMENT_ALLOWED_EMAIL_DOMAINS: text,
  CRON_SECRET: text,
  NEXT_PUBLIC_SITE_URL: z.preprocess(blank, z.url().optional()),
});

export type Env = z.infer<typeof schema>;

/** Parses the environment. Throws a readable error listing every invalid variable. */
export function readEnv(source: Record<string, string | undefined> = process.env): Env {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    throw new Error(
      "Invalid environment: " + parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")
    );
  }
  return parsed.data;
}

/** Everything wrong with the current configuration, as plain sentences (used by /api/health). */
export function configProblems(source: Record<string, string | undefined> = process.env): string[] {
  const problems: string[] = [];
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    for (const i of parsed.error.issues) problems.push(`${i.path.join(".")}: ${i.message}`);
    return problems;
  }
  const e = parsed.data;
  const production = e.NODE_ENV === "production";

  const google = [e.GOOGLE_SERVICE_ACCOUNT_EMAIL, e.GOOGLE_PRIVATE_KEY, e.RECRUITMENT_SHEET_ID];
  if (google.some(Boolean) && !google.every(Boolean)) {
    problems.push("Google Sheets settings are incomplete (need service account email, private key and sheet id).");
  }
  const smtp = [e.SMTP_HOST, e.SMTP_USER, e.SMTP_PASS];
  if (smtp.some(Boolean) && !smtp.every(Boolean)) problems.push("SMTP settings are incomplete (need host, user and password).");

  if (e.RECRUITMENT_OPENS_AT && e.RECRUITMENT_CLOSES_AT && Date.parse(e.RECRUITMENT_OPENS_AT) >= Date.parse(e.RECRUITMENT_CLOSES_AT)) {
    problems.push("RECRUITMENT_OPENS_AT must be before RECRUITMENT_CLOSES_AT.");
  }

  if (production) {
    if (!e.DATABASE_URL) problems.push("DATABASE_URL is not set.");
    if (!e.AUTH_SECRET) problems.push("AUTH_SECRET is not set (login codes cannot be issued).");
    if (!google.every(Boolean)) problems.push("Google Sheets is not configured: applications will only be queued in the database.");
    if (!smtp.every(Boolean)) problems.push("SMTP is not configured: confirmation emails and login codes cannot be sent.");
  }
  return problems;
}

/** Lower-cased allowed email domains, e.g. "college.edu,student.college.edu". Empty = allow all. */
export function allowedEmailDomains(source: Record<string, string | undefined> = process.env): string[] {
  const raw = schema.safeParse(source).data?.RECRUITMENT_ALLOWED_EMAIL_DOMAINS;
  return (raw ?? "")
    .split(",")
    .map((d) => d.trim().toLowerCase().replace(/^@/, ""))
    .filter(Boolean);
}
