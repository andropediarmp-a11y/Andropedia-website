import { escapeHtml as esc, sendMail } from "./mailer";

/** Tells a member their submission was graded, with the score and the reviewer's feedback. */
export async function sendGradedNotice(
  member: { name: string; email: string },
  task: { title: string; weekNumber: number },
  result: { score: number; feedback: string }
): Promise<void> {
  const subject = `Your Week ${task.weekNumber} submission was graded: ${result.score}/100`;
  const text = [
    `Hi ${member.name},`,
    "",
    `Your submission "${task.title}" for week ${task.weekNumber} has been graded.`,
    "",
    `Score: ${result.score}/100`,
    "",
    "Feedback:",
    result.feedback,
    "",
    "Log in to the member portal to see the full breakdown and the leaderboard.",
    "",
    "- Team Andropedia",
  ].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;max-width:560px">
<p>Hi ${esc(member.name)},</p>
<p>Your submission <strong>${esc(task.title)}</strong> for week ${task.weekNumber} has been graded.</p>
<p style="font-size:24px;font-weight:bold">${result.score}/100</p>
<p><strong>Feedback</strong><br>${esc(result.feedback).replace(/\n/g, "<br>")}</p>
<p>Log in to the member portal to see the full breakdown and the leaderboard.</p>
<p>- Team Andropedia</p></div>`;
  await sendMail({ to: member.email, subject, text, html });
}
