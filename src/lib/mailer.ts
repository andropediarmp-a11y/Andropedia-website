import nodemailer, { type Transporter } from "nodemailer";

export class EmailNotConfiguredError extends Error {}

let transporter: Transporter | undefined;

export function isMailConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
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
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    replyTo: process.env.EMAIL_REPLY_TO || undefined,
    ...message,
  });
}
