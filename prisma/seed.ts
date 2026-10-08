// Usage: npm run db:seed
// Loads DEMO club data (fake members, including a demo super admin). Local development only:
// it refuses to run against a non-local database unless ALLOW_DEMO_SEED=1 is set.
// Safe to re-run: existing rows are never overwritten.
import { prisma } from "../src/lib/prisma";
import { toDbDomain, toDbPosition } from "../src/lib/data-store";
import { initialUsers, initialWeeks, initialTasks, demoEvents } from "../src/lib/seed-data";

const ROLE = { member: "MEMBER", domain_admin: "DOMAIN_ADMIN", super_admin: "SUPER_ADMIN" } as const;

function assertLocalDatabase() {
  const url = process.env.DATABASE_URL ?? "";
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  })();
  const isLocal = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(host);
  if (!isLocal && process.env.ALLOW_DEMO_SEED !== "1") {
    throw new Error(
      `Refusing to seed demo data into a non-local database (${host || "unknown host"}). ` +
        "Demo accounts include a fake super admin. For real data use `npm run db:import-members` and " +
        "`npm run user:set-role`. To seed anyway, set ALLOW_DEMO_SEED=1."
    );
  }
}

async function main() {
  assertLocalDatabase();
  const base = Date.now() - initialUsers.length * 1000;

  const users = await prisma.user.createMany({
    skipDuplicates: true,
    data: initialUsers.map((u, i) => ({
      id: u.id,
      name: u.name,
      email: u.email.toLowerCase(),
      role: ROLE[u.role],
      position: toDbPosition(u.position ?? "member") ?? "MEMBER",
      domain: toDbDomain(u.domain)!,
      avatar: u.avatar || null,
      bio: u.bio ?? null,
      github: u.github ?? null,
      linkedin: u.linkedin ?? null,
      portfolio: u.portfolio ?? null,
      points: u.points ?? 0,
      tasksCompleted: u.tasksCompleted ?? 0,
      streakWeeks: u.streakWeeks ?? 0,
      createdAt: new Date(base + i * 1000), // keeps list order stable
    })),
  });

  const weeks = await prisma.week.createMany({
    skipDuplicates: true,
    data: initialWeeks.map((w) => ({
      id: w.id,
      weekNumber: w.weekNumber,
      title: w.title,
      theme: w.theme,
      startDate: new Date(w.startDate),
      endDate: new Date(w.endDate),
      isActive: w.isActive,
      promptDescription: w.promptDescription ?? null,
    })),
  });

  const tasks = await prisma.task.createMany({
    skipDuplicates: true,
    data: initialTasks.map((t) => ({
      id: t.id,
      userId: t.userId,
      weekId: t.weekId,
      domain: toDbDomain(t.domain)!,
      title: t.title,
      description: t.description,
      githubUrl: t.githubUrl ?? null,
      liveUrl: t.liveUrl ?? null,
      figmaUrl: t.figmaUrl ?? null,
      notes: t.notes ?? null,
      status: t.status === "evaluated" ? ("EVALUATED" as const) : ("SUBMITTED" as const),
      submittedAt: new Date(t.submittedAt),
    })),
  });

  const evaluations = await prisma.evaluation.createMany({
    skipDuplicates: true,
    data: initialTasks.flatMap((t) =>
      t.evaluation
        ? [{
            id: t.evaluation.id,
            taskId: t.id,
            adminId: t.evaluation.adminId,
            score: t.evaluation.score,
            technicalDepth: t.evaluation.criteriaScores?.technicalDepth ?? null,
            innovation: t.evaluation.criteriaScores?.innovation ?? null,
            completion: t.evaluation.criteriaScores?.completion ?? null,
            documentation: t.evaluation.criteriaScores?.documentation ?? null,
            feedback: t.evaluation.feedback,
            evaluatedAt: new Date(t.evaluation.evaluatedAt),
          }]
        : []
    ),
  });

  const events = await prisma.event.createMany({ skipDuplicates: true, data: demoEvents() });

  console.log(
    `Seeded: ${users.count} users, ${weeks.count} weeks, ${tasks.count} tasks, ${evaluations.count} evaluations, ${events.count} events.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
