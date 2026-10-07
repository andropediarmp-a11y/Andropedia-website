import { escapeHtml as esc, sendMail } from "./mailer";

function when(startsAt: Date, endsAt: Date | null): string {
  const fmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Kolkata" });
  return endsAt ? `${fmt.format(startsAt)} to ${fmt.format(endsAt)} (IST)` : `${fmt.format(startsAt)} (IST)`;
}

export async function sendRsvpConfirmation(
  person: { name: string; email: string },
  event: { title: string; location: string; startsAt: Date; endsAt: Date | null }
): Promise<void> {
  const date = when(event.startsAt, event.endsAt);
  const subject = `Your seat is reserved: ${event.title}`;
  const text = [
    `Hi ${person.name},`,
    "",
    `Your seat for ${event.title} is reserved.`,
    "",
    `When: ${date}`,
    `Where: ${event.location}`,
    "",
    "Cannot make it? Reply to this email so we can free up your seat.",
    "",
    "- Team Andropedia",
  ].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;max-width:560px">
<p>Hi ${esc(person.name)},</p>
<p>Your seat for <strong>${esc(event.title)}</strong> is reserved.</p>
<table style="border-collapse:collapse"><tr><td style="padding:2px 12px 2px 0;color:#555">When</td><td>${esc(date)}</td></tr>
<tr><td style="padding:2px 12px 2px 0;color:#555">Where</td><td>${esc(event.location)}</td></tr></table>
<p>Cannot make it? Reply to this email so we can free up your seat.</p>
<p>- Team Andropedia</p></div>`;
  await sendMail({ to: person.email, subject, text, html });
}

export async function sendTeamConfirmation(
  person: { name: string; email: string },
  teamName: string,
  team: Array<{ name: string }>,
  event: { title: string; location: string; startsAt: Date; endsAt: Date | null }
): Promise<void> {
  const date = when(event.startsAt, event.endsAt);
  const names = team.map((m) => m.name);
  const subject = `Team registered: ${event.title}`;
  const text = [
    `Hi ${person.name},`,
    "",
    `Your team "${teamName}" is registered for ${event.title}.`,
    `Team: ${names.join(", ")}`,
    "",
    `When: ${date}`,
    `Where: ${event.location}`,
    "",
    "Need to change something? Reply to this email.",
    "",
    "- Team Andropedia",
  ].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;max-width:560px">
<p>Hi ${esc(person.name)},</p>
<p>Your team <strong>${esc(teamName)}</strong> is registered for <strong>${esc(event.title)}</strong>.</p>
<table style="border-collapse:collapse"><tr><td style="padding:2px 12px 2px 0;color:#555">Team</td><td>${esc(names.join(", "))}</td></tr>
<tr><td style="padding:2px 12px 2px 0;color:#555">When</td><td>${esc(date)}</td></tr>
<tr><td style="padding:2px 12px 2px 0;color:#555">Where</td><td>${esc(event.location)}</td></tr></table>
<p>Need to change something? Reply to this email.</p>
<p>- Team Andropedia</p></div>`;
  await sendMail({ to: person.email, subject, text, html });
}
