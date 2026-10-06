// Usage: npm run db:seed
// Loads the demo club data. Safe to re-run: existing rows are never overwritten.
import { prisma } from "../src/lib/prisma";
import { toDbDomain } from "../src/lib/data-store";
import { initialUsers, initialWeeks, initialTasks } from "../src/lib/seed-data";

const ROLE = { member: "MEMBER", domain_admin: "DOMAIN_ADMIN", super_admin: "SUPER_ADMIN" } as const;

async function main() {
  const base = Date.now() - initialUsers.length * 1000;

  const users = await prisma.user.createMany({
    skipDuplicates: true,
    data: initialUsers.map((u, i) => ({
      id: u.id,
      name: u.name,
      email: u.email.toLowerCase(),
      role: ROLE[u.role],
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

  console.log(
    `Seeded: ${users.count} users, ${weeks.count} weeks, ${tasks.count} tasks, ${evaluations.count} evaluations.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
