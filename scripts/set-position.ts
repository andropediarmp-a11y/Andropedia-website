// Usage:
//   npm run team:set-position -- <email> <position> [domain]
//   npm run team:import-positions -- <file.csv>
//
// positions: president, vice_president, chief, lead, co_lead, member
// domain (optional): Technical, Web, R&D, Design, PR, Media. Moves the person to that domain.
//   A Chief/Lead/Co-Lead belongs to the domain of their account; President and Vice President
//   are shown in the Core team whatever their domain is.
//
// CSV format (header row required; domain column optional):
//   email,position,domain
//   someone@college.edu,chief,Technical
//
// Only the team position (and domain, if given) is changed. Portal permissions are NOT:
// use `npm run user:set-role` to give a Lead the "domain_admin" role so they can grade tasks.
import { readFileSync } from "node:fs";
import { prisma } from "../src/lib/prisma";
import { toDbDomain, toDbPosition } from "../src/lib/data-store";

interface Change { email: string; position: string; domain?: string }

function parseCsv(path: string): Change[] {
  const lines = readFileSync(path, "utf8").split(/\r?\n/).filter((l) => l.trim());
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  if (col("email") < 0 || col("position") < 0) throw new Error('CSV needs "email" and "position" columns.');
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    return { email: cells[col("email")], position: cells[col("position")], domain: col("domain") >= 0 ? cells[col("domain")] || undefined : undefined };
  });
}

async function apply({ email, position, domain }: Change): Promise<string> {
  const pos = toDbPosition(position ?? "");
  if (!email || !pos) return `SKIP  ${email || "(no email)"}: unknown position "${position}"`;
  const dom = domain ? toDbDomain(domain) : undefined;
  if (domain && !dom) return `SKIP  ${email}: unknown domain "${domain}"`;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return `SKIP  ${email}: no account with this email (import members first)`;
  await prisma.user.update({ where: { id: user.id }, data: { position: pos, ...(dom ? { domain: dom } : {}) } });
  return `OK    ${email}: ${pos}${dom ? ` (${domain})` : ""}`;
}

async function main() {
  const args = process.argv.slice(2);
  const changes: Change[] = args[0]?.toLowerCase().endsWith(".csv")
    ? parseCsv(args[0])
    : [{ email: args[0], position: args[1], domain: args[2] }];
  if (!args[0]) throw new Error("Usage: npm run team:set-position -- <email> <position> [domain]  |  npm run team:import-positions -- file.csv");

  let ok = 0;
  for (const change of changes) {
    const line = await apply(change);
    if (line.startsWith("OK")) ok++;
    console.log(line);
  }
  console.log(`Done: ${ok}/${changes.length} updated.`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
