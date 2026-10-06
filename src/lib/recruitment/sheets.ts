import { GoogleAuth } from "google-auth-library";
import type { StoredApplication } from "./schema";

// Column contract (docs/BACKEND_PRD.md section 2.7.1). The website only appends rows
// and only ever writes columns A-K. Admins may add their own columns to the right.
export const HEADERS = [
  "reference", "submitted_at", "name", "email", "year", "domain",
  "skills", "motivation", "portfolio_url", "consent", "email_status",
] as const;

export type EmailStatus = "pending" | "sent" | "failed";

const API = "https://sheets.googleapis.com/v4/spreadsheets";

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

// Spreadsheets run values starting with = + - @ as formulas; neutralise them.
const safe = (v: string) => (/^[=+\-@]/.test(v) ? `'${v}` : v);

function toRow(app: StoredApplication, status: EmailStatus): string[] {
  return [
    app.reference, app.submittedAt, safe(app.name), safe(app.email), app.year, app.domain,
    safe(app.skills), safe(app.motivation), safe(app.portfolioUrl), app.consent ? "TRUE" : "FALSE", status,
  ];
}

/** Appends one application. Returns the 1-based sheet row it landed on. */
export async function appendApplication(app: StoredApplication, status: EmailStatus = "pending"): Promise<number> {
  const { sheetId, tab } = config();
  const range = encodeURIComponent(`${tab}!A:K`);
  const client = await sheetsClient();
  const res = await client.request<{ updates?: { updatedRange?: string } }>({
    url: `${API}/${sheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    method: "POST",
    data: { values: [toRow(app, status)] },
  });
  const match = res.data.updates?.updatedRange?.match(/![A-Z]+(\d+)/);
  if (!match) throw new Error("Sheets append succeeded but returned no row number.");
  return Number(match[1]);
}

export async function setEmailStatus(row: number, status: EmailStatus): Promise<void> {
  const { sheetId, tab } = config();
  const range = encodeURIComponent(`${tab}!K${row}`);
  const client = await sheetsClient();
  await client.request({
    url: `${API}/${sheetId}/values/${range}?valueInputOption=RAW`,
    method: "PUT",
    data: { values: [[status]] },
  });
}

/** Reads every data row (A-K) with its sheet row number. Used by the resend script. */
export async function readApplications(): Promise<Array<{ row: number; app: StoredApplication; status: string }>> {
  const { sheetId, tab } = config();
  const range = encodeURIComponent(`${tab}!A2:K`);
  const client = await sheetsClient();
  const res = await client.request<{ values?: string[][] }>({
    url: `${API}/${sheetId}/values/${range}`,
  });
  return (res.data.values ?? []).map((r, i) => ({
    row: i + 2,
    status: r[10] ?? "",
    app: {
      reference: r[0] ?? "", submittedAt: r[1] ?? "", name: r[2] ?? "", email: r[3] ?? "",
      year: r[4] ?? "", domain: r[5] ?? "", skills: r[6] ?? "", motivation: r[7] ?? "",
      portfolioUrl: r[8] ?? "", consent: r[9] === "TRUE",
    },
  }));
}
