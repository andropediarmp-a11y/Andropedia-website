// Usage: npm run events:club
// Adds the club's three past events (AndroHacks, CodeSprint, CloudCon) as bare entries: published, closed for
// registration and marked "date to be announced", so no date is made up. Fill in the real details afterwards in
// Portal -> Admin -> Events & reservations (Edit).
// Safe to re-run: an event that already exists is left exactly as it is, so admin edits are never overwritten.
import { prisma } from "../src/lib/prisma";

const LOCATION = "SRM Institute of Science and Technology, Ramapuram";
const SOON = "Details coming soon.";

// Order here is the order they are shown. Types are best guesses from the names: edit them in the admin screen.
const EVENTS = [
  { id: "androhacks", title: "AndroHacks", type: "Hackathon", teamMin: null, teamMax: null },
  { id: "codesprint", title: "CodeSprint", type: "Coding Contest", teamMin: 3, teamMax: 4 },
  { id: "cloudcon", title: "CloudCon", type: "Cloud Conference", teamMin: null, teamMax: null },
] as const;

async function main() {
  const base = Date.now();
  let added = 0;
  for (const [i, e] of EVENTS.entries()) {
    // CodeSprint used to be added with another id by an older script; treat that one as the same event.
    const legacy = e.id === "codesprint" ? await prisma.event.findUnique({ where: { id: "codesprint-2026" } }) : null;
    if ((await prisma.event.findUnique({ where: { id: e.id } })) || legacy) {
      console.log(`${e.title} already exists; left as it is.`);
      continue;
    }
    await prisma.event.create({
      data: {
        id: e.id,
        title: e.title,
        type: e.type,
        description: SOON,
        location: LOCATION,
        startsAt: new Date(base + i * 1000), // placeholder only: never shown while dateTbc is on; keeps the list order
        endsAt: null,
        capacity: null,
        teamMin: e.teamMin,
        teamMax: e.teamMax,
        prize: null,
        isPublished: true,
        registrationOpen: false,
        dateTbc: true,
      },
    });
    added++;
    console.log(`Added ${e.title}.`);
  }
  console.log(`Done: ${added} added, ${EVENTS.length - added} already there.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
