// Usage: npm run db:import-members
// Copies members from the club's Google Sheet into the User table so they can log in.
// Safe to re-run: existing accounts (matched by email) are left untouched, so roles
// and points set in the database are never overwritten.
import { prisma } from "../src/lib/prisma";
import { toDbDomain } from "../src/lib/data-store";
import { getLiveMembers } from "../src/lib/live-members";

async function main() {
  const members = await getLiveMembers();
  console.log(`Read ${members.length} member(s) from the sheet.`);

  const result = await prisma.user.createMany({
    skipDuplicates: true,
    data: members.map((m) => ({
      name: m.name,
      email: m.email.toLowerCase(),
      role: "MEMBER" as const,
      domain: toDbDomain(m.domain) ?? "TECHNICAL",
      avatar: m.avatar || null,
      bio: m.bio || null,
      linkedin: m.linkedin || null,
    })),
  });

  console.log(`Imported ${result.count} new member(s); ${members.length - result.count} already existed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
