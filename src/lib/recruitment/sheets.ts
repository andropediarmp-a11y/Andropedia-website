import { GoogleAuth } from "google-auth-library";
import { callWebApp, webAppConfig } from "../web-app";
import { emailKey } from "./email-key";
import { ALL_QUESTION_IDS } from "./questions";
import type { StoredApplication } from "./schema";

// Column contract. Row 1 is written automatically on first use: the fixed columns, then one
// column per question (the id from questions.ts; a column stays blank for applicants who did not
// get that question because they chose another domain), then consent and email_status.
// The website only appends rows and only writes these columns. Admins may add their own
// working columns to the right of email_status.
export const HEADERS = [
  "reference", "submitted_at", "name", "register_no", "department", "year", "phone", "email", "profile", "domain",
  ...ALL_QUESTION_IDS,
  "consent", "email_status",
] as const;

/** 0-based index -> spreadsheet column letters (0 = A, 26 = AA). */
export function colLetter(index: number): string {
  let n = index;
  let out = "";
  do {
    out = String.fromCharCode(65 + (n % 26)) + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

const COL = (name: (typeof HEADERS)[number]) => colLetter(HEADERS.indexOf(name));
const LAST_COL = colLetter(HEADERS.length - 1);
const EMAIL_COL = COL("email");
const STATUS_COL = COL("email_status");

export type EmailStatus = "pending" | "sent" | "failed";

const API = "https://sheets.googleapis.com/v4/spreadsheets";
const REQUEST_TIMEOUT_MS = 10_000;

export class SheetsNotConfiguredError extends Error {}

function config() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const sheetId = process.env.RECRUITMENT_SHEET_ID;
  const tab = process.env.RECRUITMENT_SHEET_TAB || "Applications";
  if (!email || !key || !sheetId) {
    throw new SheetsNotConfiguredError("Google Sheets credentials are not configured.");
  }
  return { email, key, sheetId, tab };
}

let auth: GoogleAuth | undefined;
async function sheetsClient() {
  const { email, key } = config();
  auth ??= new GoogleAuth({
    credentials: { client_email: email, private_key: key },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return auth.getClient();
}

async function request<T>(options: { url: string; method?: "GET" | "POST" | "PUT"; data?: unknown }) {
  const client = await sheetsClient();
  return client.request<T>({ ...options, timeout: REQUEST_TIMEOUT_MS });
}

// ------------------------------------------------------------------ retries

/** True for errors worth retrying: network failures, timeouts, 408/425/429 and 5xx. */
export function isTransient(err: unknown): boolean {
  if (err instanceof SheetsNotConfiguredError) return false;
  const e = err as { status?: number; response?: { status?: number }; code?: string | number; name?: string };
  const status = e?.status ?? e?.response?.status;
  if (typeof status === "number") return status === 408 || status === 425 || status === 429 || status >= 500;
  const code = String(e?.code ?? "");
  return (
    ["ECONNRESET", "ETIMEDOUT", "ECONNREFUSED", "EAI_AGAIN", "ENOTFOUND", "ECONNABORTED", "EPIPE"].includes(code) ||
    /timeout/i.test(e?.name ?? "")
  );
}

export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  { attempts = 3, baseMs = 400, sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms)) } = {}
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      if (attempt === attempts || !isTransient(err)) break;
      await sleep(baseMs * 2 ** (attempt - 1));
    }
  }
  throw lastError;
}

// ------------------------------------------------------------------ rows

// Spreadsheets run values starting with = + - @ as formulas; neutralise them.
export const safe = (v: string) => (/^[=+\-@]/.test(v) ? `'${v}` : v);

export function toRow(app: StoredApplication, status: EmailStatus, escape = true): string[] {
  const safe_ = escape ? safe : (v: string) => v; // the web app stores every cell as plain text, so no escaping there
  return [
    app.reference, app.submittedAt, safe_(app.name), safe_(app.registerNo), safe_(app.department), app.year,
    safe_(app.phone), safe_(app.email), safe_(app.profile), app.domain,
    ...ALL_QUESTION_IDS.map((id) => safe_(app.answers[id] ?? "")),
    app.consent ? "TRUE" : "FALSE", status,
  ];
}

let headersVerified = false;

/** Writes the header row if the tab is empty, so row 1 is always the headers. */
async function ensureHeaders(): Promise<void> {
  if (headersVerified) return;
  const { sheetId, tab } = config();
  const range = encodeURIComponent(`${tab}!A1:${LAST_COL}1`);
  const res = await request<{ values?: string[][] }>({ url: `${API}/${sheetId}/values/${range}` });
  if (!res.data.values?.[0]?.some((c) => c?.trim())) {
    await request({
      url: `${API}/${sheetId}/values/${range}?valueInputOption=RAW`,
      method: "PUT",
      data: { values: [[...HEADERS]] },
    });
  }
  headersVerified = true;
}

/** 1-based sheet row holding this reference, or null. Makes a retried append idempotent. */
export async function findRowByReference(reference: string): Promise<number | null> {
  const { sheetId, tab } = config();
  const range = encodeURIComponent(`${tab}!A:A`);
  const res = await request<{ values?: string[][] }>({ url: `${API}/${sheetId}/values/${range}` });
  const index = (res.data.values ?? []).findIndex((r) => r[0] === reference);
  return index >= 0 ? index + 1 : null;
}

/**
 * Appends one application and returns the 1-based row it landed on. Temporary Google failures
 * are retried with backoff; before each retry we check the reference isn't already in the sheet
 * (a previous attempt may have succeeded even though its response was lost).
 */
export async function appendApplication(app: StoredApplication, status: EmailStatus = "pending"): Promise<number> {
  if (webAppConfig()) {
    // The script skips a reference it has already written, so a retry never adds a second row.
    return withRetry(async () => {
      const reply = await callWebApp({ action: "append", row: toRow(app, status, false) });
      if (typeof reply.row !== "number") throw Object.assign(new Error("Web app returned no row number"), { status: 400 });
      return reply.row;
    });
  }
  const { sheetId, tab } = config();
  await withRetry(() => ensureHeaders());

  return withRetry(async (attempt) => {
    if (attempt > 1) {
      const existing = await findRowByReference(app.reference);
      if (existing) return existing;
    }
    const range = encodeURIComponent(`${tab}!A:${LAST_COL}`);
    const res = await request<{ updates?: { updatedRange?: string } }>({
      url: `${API}/${sheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      method: "POST",
      data: { values: [toRow(app, status)] },
    });
    const match = res.data.updates?.updatedRange?.match(/![A-Z]+(\d+)/);
    if (!match) throw new Error("Sheets append succeeded but returned no row number.");
    return Number(match[1]);
  });
}

export async function setEmailStatus(row: number, status: EmailStatus): Promise<void> {
  const { sheetId, tab } = config();
  const range = encodeURIComponent(`${tab}!${STATUS_COL}${row}`);
  await withRetry(() =>
    request({ url: `${API}/${sheetId}/values/${range}?valueInputOption=RAW`, method: "PUT", data: { values: [[status]] } })
  );
}

/** True if an application with this email (Gmail dots/+tags ignored) is already in the sheet. */
export async function emailExists(email: string): Promise<boolean> {
  const { sheetId, tab } = config();
  const range = encodeURIComponent(`${tab}!${EMAIL_COL}2:${EMAIL_COL}`);
  const res = await withRetry(() => request<{ values?: string[][] }>({ url: `${API}/${sheetId}/values/${range}` }));
  const target = emailKey(email);
  return (res.data.values ?? []).some((r) => emailKey((r[0] ?? "").replace(/^'/, "")) === target);
}

/** Reads every data row with its sheet row number. Used by the resend script. */
export async function readApplications(): Promise<Array<{ row: number; app: StoredApplication; status: string }>> {
  const { sheetId, tab } = config();
  const range = encodeURIComponent(`${tab}!A2:${LAST_COL}`);
  const res = await withRetry(() => request<{ values?: string[][] }>({ url: `${API}/${sheetId}/values/${range}` }));
  const at = (r: string[], name: (typeof HEADERS)[number]) => r[HEADERS.indexOf(name)] ?? "";
  return (res.data.values ?? []).map((r, i) => ({
    row: i + 2,
    status: at(r, "email_status"),
    app: {
      reference: at(r, "reference"), submittedAt: at(r, "submitted_at"), name: at(r, "name"),
      registerNo: at(r, "register_no"), department: at(r, "department"), year: at(r, "year"),
      phone: at(r, "phone"), email: at(r, "email"), profile: at(r, "profile"), domain: at(r, "domain"),
      answers: Object.fromEntries(ALL_QUESTION_IDS.map((id) => [id, r[HEADERS.indexOf(id as never)] ?? ""]).filter(([, v]) => v)),
      consent: at(r, "consent") === "TRUE",
    },
  }));
}
