// Client for the Andropedia Apps Script web app (docs/apps-script-sheet-webhook.gs), which runs
// as the club's Google account. It appends rows to the applicants sheet and sends email, so the
// site needs neither a Google service account nor SMTP credentials. A shared secret guards it.

const TIMEOUT_MS = 15_000;

export class WebAppNotConfiguredError extends Error {}

export function webAppConfig(): { url: string; secret: string } | null {
  const url = process.env.RECRUITMENT_SHEET_WEBHOOK_URL;
  const secret = process.env.RECRUITMENT_SHEET_WEBHOOK_SECRET;
  return url && secret ? { url, secret } : null;
}

export interface WebAppReply {
  ok: boolean;
  row?: number;
  error?: string;
  quotaLeft?: number;
}

/** Posts one action. Throws with a `status` (5xx = worth retrying) unless the script answered ok. */
export async function callWebApp(body: Record<string, unknown>): Promise<WebAppReply> {
  const cfg = webAppConfig();
  if (!cfg) throw new WebAppNotConfiguredError("Apps Script web app is not configured.");
  const res = await fetch(cfg.url, {
    method: "POST",
    // text/plain keeps this a "simple" request; Apps Script reads the raw body either way.
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ secret: cfg.secret, ...body }),
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw Object.assign(new Error(`Web app returned ${res.status}`), { status: res.status });
  const data = (await res.json().catch(() => null)) as WebAppReply | null;
  if (!data?.ok) {
    // An error answer from the script itself (bad secret, quota, bad request): retrying will not help.
    throw Object.assign(new Error(`Web app error: ${data?.error ?? "no response"}`), { status: 400 });
  }
  return data;
}
