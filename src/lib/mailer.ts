import nodemailer, { type Transporter } from "nodemailer";
import { callWebApp, webAppConfig } from "./web-app";

export class EmailNotConfiguredError extends Error {}

let transporter: Transporter | undefined;

const smtpConfigured = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

/** Mail can go out through SMTP or, failing that, the club's Apps Script web app. */
export function isMailConfigured(): boolean {
  return smtpConfigured() || webAppConfig() !== null;
}

function getTransporter() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new EmailNotConfiguredError("SMTP is not configured.");
  }
  const port = Number(process.env.SMTP_PORT) || 465;
  transporter ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function sendMail(message: { to: string; subject: string; text: string; html: string }) {
  if (smtpConfigured()) {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      replyTo: process.env.EMAIL_REPLY_TO || undefined,
      ...message,
    });
    return;
  }
  if (webAppConfig()) {
    // Sent from the Google account that owns the web app. Retry once on a temporary failure.
    for (let attempt = 1; ; attempt++) {
      try {
        await callWebApp({ action: "mail", ...message, replyTo: process.env.EMAIL_REPLY_TO || undefined });
        return;
      } catch (err) {
        const status = (err as { status?: number }).status;
        if (attempt >= 2 || typeof status !== "number" || status < 500) throw err;
        await new Promise((r) => setTimeout(r, 800));
      }
    }
  }
  throw new EmailNotConfiguredError("Email is not configured: set SMTP_* or the Apps Script web app.");
}
