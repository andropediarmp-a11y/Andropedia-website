import { GoogleAuth } from "google-auth-library";
import { emailKey } from "./email-key";
import type { StoredApplication } from "./schema";

// Column contract (docs/BACKEND_PRD.md section 2.7.1). The website only appends rows
// and only ever writes columns A-L. Admins may add their own columns to the right (from M).
export const HEADERS = [
  "reference", "submitted_at", "name", "email", "year", "domain",
  "skills", "motivation", "portfolio_url", "consent", "email_status", "domain_answer",
] as const;

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

export function toRow(app: StoredApplication, status: EmailStatus): string[] {
  return [
    app.reference, app.submittedAt, safe(app.name), safe(app.email), app.year, app.domain,
    safe(app.skills), safe(app.motivation), safe(app.portfolioUrl), app.consent ? "TRUE" : "FALSE", status, safe(app.domainAnswer),
  ];
}

let headersVerified = false;

/** Writes the header row if the tab is empty, so row 1 is always the headers. */
async function ensureHeaders(): Promise<void> {
  if (headersVerified) return;
  const { sheetId, tab } = config();
  const range = encodeURIComponent(`${tab}!A1:L1`);
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
  const { sheetId, tab } = config();
  await withRetry(() => ensureHeaders());

  return withRetry(async (attempt) => {
    if (attempt > 1) {
      const existing = await findRowByReference(app.reference);
      if (existing) return existing;
    }
    const range = encodeURIComponent(`${tab}!A:L`);
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
  const range = encodeURIComponent(`${tab}!K${row}`);
  await withRetry(() =>
    request({ url: `${API}/${sheetId}/values/${range}?valueInputOption=RAW`, method: "PUT", data: { values: [[status]] } })
  );
}

/** True if an application with this email (Gmail dots/+tags ignored) is already in the sheet. */
export async function emailExists(email: string): Promise<boolean> {
  const { sheetId, tab } = config();
  const range = encodeURIComponent(`${tab}!D2:D`);
  const res = await withRetry(() => request<{ values?: string[][] }>({ url: `${API}/${sheetId}/values/${range}` }));
  const target = emailKey(email);
  return (res.data.values ?? []).some((r) => emailKey((r[0] ?? "").replace(/^'/, "")) === target);
}

/** Reads every data row (A-L) with its sheet row number. Used by the resend script. */
export async function readApplications(): Promise<Array<{ row: number; app: StoredApplication; status: string }>> {
  const { sheetId, tab } = config();
  const range = encodeURIComponent(`${tab}!A2:L`);
  const res = await withRetry(() => request<{ values?: string[][] }>({ url: `${API}/${sheetId}/values/${range}` }));
  return (res.data.values ?? []).map((r, i) => ({
    row: i + 2,
    status: r[10] ?? "",
    app: {
      reference: r[0] ?? "", submittedAt: r[1] ?? "", name: r[2] ?? "", email: r[3] ?? "",
      year: r[4] ?? "", domain: r[5] ?? "", skills: r[6] ?? "", motivation: r[7] ?? "",
      portfolioUrl: r[8] ?? "", consent: r[9] === "TRUE", domainAnswer: r[11] ?? "",
    },
  }));
}
