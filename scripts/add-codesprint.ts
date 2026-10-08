// Usage: npm run events:codesprint
// Adds the CodeSprint team event (15 October 2026, teams of 3-4) if it does not exist yet.
// Safe to re-run: an existing event is left untouched, so edits made in the admin panel are kept.
// Time and venue are placeholders: change them in Portal -> Admin -> Events & reservations.
import { prisma } from "../src/lib/prisma";

const ID = "codesprint-2026";

async function main() {
  const existing = await prisma.event.findUnique({ where: { id: ID } });
  if (existing) {
    console.log("CodeSprint already exists; nothing changed.");
    return;
  }
  await prisma.event.create({
    data: {
      id: ID,
      title: "CodeSprint",
      type: "Coding Contest",
      description: "A team coding sprint. Form a team of 3 to 4 and register with every member's details to take part.",
      location: "To be announced",
      startsAt: new Date("2026-10-15T03:30:00Z"), // 9:00 AM IST
      endsAt: null,
      capacity: null,
      teamMin: 3,
      teamMax: 4,
      prize: null,
      isPublished: true,
      registrationOpen: true,
    },
  });
  console.log("Added CodeSprint (15 Oct 2026, teams of 3-4, published).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
