import nodemailer, { type Transporter } from "nodemailer";
import { DOMAIN_LABELS, type StoredApplication } from "./schema";

export class EmailNotConfiguredError extends Error {}

let transporter: Transporter | undefined;
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

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function sendConfirmation(app: StoredApplication): Promise<void> {
  const domain = DOMAIN_LABELS[app.domain as keyof typeof DOMAIN_LABELS] ?? app.domain;
  const subject = `We received your Andropedia application (${app.reference})`;

  const text = [
    `Hi ${app.name},`,
    "",
    "Thanks for applying to Andropedia! We've received your application.",
    "",
    `Reference ID: ${app.reference}`,
    `Domain: ${domain}`,
    "",
    "What happens next:",
    "Our domain leads will review applications. Shortlisted candidates will be contacted by email about the next step.",
    "",
    "Questions? Reply to this email and quote your reference ID.",
    "",
    "- Team Andropedia",
  ].join("\n");

  const html = `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;max-width:560px">
<p>Hi ${esc(app.name)},</p>
<p>Thanks for applying to <strong>Andropedia</strong>! We've received your application.</p>
<table style="border-collapse:collapse"><tr><td style="padding:2px 12px 2px 0;color:#555">Reference ID</td><td><strong>${esc(app.reference)}</strong></td></tr>
<tr><td style="padding:2px 12px 2px 0;color:#555">Domain</td><td>${esc(domain)}</td></tr></table>
<p><strong>What happens next</strong><br>Our domain leads will review applications. Shortlisted candidates will be contacted by email about the next step.</p>
<p>Questions? Reply to this email and quote your reference ID.</p>
<p>- Team Andropedia</p></div>`;

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: app.email,
    replyTo: process.env.EMAIL_REPLY_TO || undefined,
    subject,
    text,
    html,
  });
}
