import { escapeHtml as esc, sendMail } from "./mailer";
import { siteUrl } from "./site";

/** Welcomes a member added by an admin and tells them how to log in (no password: an emailed code). */
export async function sendMemberInvite(member: { name: string; email: string }): Promise<void> {
  const login = new URL("/portal/login", siteUrl()).toString();
  const subject = "You've been added to the Andropedia member portal";
  const text = [
    `Hi ${member.name},`,
    "",
    "You've been added to the Andropedia member portal, where you submit weekly sprint tasks and see the leaderboard.",
    "",
    `Log in here: ${login}`,
    "Log in with your register number as both the username and the password.",
    "",
    "- Team Andropedia",
  ].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;max-width:560px">
<p>Hi ${esc(member.name)},</p>
<p>You've been added to the <strong>Andropedia member portal</strong>, where you submit weekly sprint tasks and see the leaderboard.</p>
<p><a href="${esc(login)}">Log in to the portal</a><br>Log in with your register number as both the username and the password.</p>
<p>- Team Andropedia</p></div>`;
  await sendMail({ to: member.email, subject, text, html });
}
