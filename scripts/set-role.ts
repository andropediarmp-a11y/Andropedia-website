// Usage:
//   npm run user:set-role -- <email> <member|domain_admin|super_admin> [domain] [full name]
//   npm run user:deactivate -- <email>
//
// Promotes (or creates) an account. This is how the first super admin is created:
//   npm run user:set-role -- you@college.edu super_admin Technical "Your Name"
// `domain` is one of Technical, Web, PR, R&D, Design, Media (required when creating).
import { prisma } from "../src/lib/prisma";
import { toDbDomain } from "../src/lib/data-store";

const ROLES = { member: "MEMBER", domain_admin: "DOMAIN_ADMIN", super_admin: "SUPER_ADMIN" } as const;

async function main() {
  const [first, ...rest] = process.argv.slice(2);

  if (first === "--deactivate") {
    const email = rest[0]?.toLowerCase();
    if (!email) throw new Error("Usage: npm run user:deactivate -- <email>");
    const user = await prisma.user.update({ where: { email }, data: { isActive: false } });
    await prisma.session.deleteMany({ where: { userId: user.id } });
    console.log(`Deactivated ${email} and ended their sessions.`);
    return;
  }

  const [roleArg, domainArg, ...nameParts] = rest;
  const email = first?.toLowerCase();
  const role = ROLES[roleArg as keyof typeof ROLES];
  if (!email || !role) {
    throw new Error("Usage: npm run user:set-role -- <email> <member|domain_admin|super_admin> [domain] [full name]");
  }

  const domain = domainArg ? toDbDomain(domainArg) : undefined;
  if (domainArg && !domain) throw new Error(`Unknown domain "${domainArg}". Use Technical, Web, PR, R&D, Design or Media.`);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { role, isActive: true, ...(domain ? { domain } : {}) } });
    console.log(`Updated ${email}: role=${roleArg}${domain ? `, domain=${domainArg}` : ""}.`);
    return;
  }

  const name = nameParts.join(" ").trim();
  if (!domain || !name) {
    throw new Error("Creating a new account needs a domain and a name: <email> <role> <domain> <full name>");
  }
  await prisma.user.create({ data: { email, role, domain, name } });
  console.log(`Created ${email} as ${roleArg} (${domainArg}).`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
