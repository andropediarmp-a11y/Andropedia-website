import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import {
  User, Week, Task, Evaluation, LeaderboardEntry, DomainType, RoleType,
} from "./types";

// Database-backed data layer. Return shapes match the types in ./types so the
// pages and API responses are unchanged; Prisma enums are mapped at the edge.

export class NotFoundError extends Error {}
export class ForbiddenError extends Error {}

const DOMAIN_TO_DB = {
  Technical: "TECHNICAL", Web: "WEB", PR: "PR", "R&D": "RD", Design: "DESIGN", Media: "MEDIA",
} as const;
const DOMAIN_FROM_DB: Record<string, DomainType> = {
  TECHNICAL: "Technical", WEB: "Web", PR: "PR", RD: "R&D", DESIGN: "Design", MEDIA: "Media",
};
const ROLE_FROM_DB: Record<string, RoleType> = {
  MEMBER: "member", DOMAIN_ADMIN: "domain_admin", SUPER_ADMIN: "super_admin",
};

export const toDbDomain = (d: string) => DOMAIN_TO_DB[d as DomainType] as (typeof DOMAIN_TO_DB)[DomainType] | undefined;

type DbUser = Prisma.UserGetPayload<object>;
type DbWeek = Prisma.WeekGetPayload<object>;
type DbTask = Prisma.TaskGetPayload<{
  include: { user: true; week: true; evaluation: { include: { admin: true } } };
}>;

const taskInclude = { user: true, week: true, evaluation: { include: { admin: true } } } as const;

export function mapUser(u: DbUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: ROLE_FROM_DB[u.role],
    domain: DOMAIN_FROM_DB[u.domain],
    avatar: u.avatar ?? "",
    bio: u.bio ?? undefined,
    github: u.github ?? undefined,
    linkedin: u.linkedin ?? undefined,
    portfolio: u.portfolio ?? undefined,
    points: u.points,
    tasksCompleted: u.tasksCompleted,
    streakWeeks: u.streakWeeks,
    isActive: u.isActive,
  };
}

const dateOnly = (d: Date) => d.toISOString().slice(0, 10);

function mapWeek(w: DbWeek): Week {
  return {
    id: w.id,
    weekNumber: w.weekNumber,
    title: w.title,
    theme: w.theme,
    startDate: dateOnly(w.startDate),
    endDate: dateOnly(w.endDate),
    isActive: w.isActive,
    promptDescription: w.promptDescription ?? undefined,
  };
}

function mapTask(t: DbTask): Task {
  const e = t.evaluation;
  const evaluation: Evaluation | undefined = e
    ? {
        id: e.id,
        taskId: e.taskId,
        adminId: e.adminId,
        adminName: e.admin.name,
        score: e.score,
        criteriaScores:
          e.technicalDepth != null && e.innovation != null && e.completion != null && e.documentation != null
            ? {
                technicalDepth: e.technicalDepth,
                innovation: e.innovation,
                completion: e.completion,
                documentation: e.documentation,
              }
            : undefined,
        feedback: e.feedback,
        evaluatedAt: e.evaluatedAt.toISOString(),
      }
    : undefined;

  return {
    id: t.id,
    userId: t.userId,
    userName: t.user.name,
    userAvatar: t.user.avatar ?? "",
    domain: DOMAIN_FROM_DB[t.domain],
    weekId: t.weekId,
    weekNumber: t.week.weekNumber,
    title: t.title,
    description: t.description,
    githubUrl: t.githubUrl ?? undefined,
    liveUrl: t.liveUrl ?? undefined,
    figmaUrl: t.figmaUrl ?? undefined,
    notes: t.notes ?? undefined,
    status: t.status === "EVALUATED" ? "evaluated" : "submitted",
    submittedAt: t.submittedAt.toISOString(),
    evaluation,
  };
}

export async function getUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({ orderBy: [{ createdAt: "asc" }, { id: "asc" }] });
  return users.map(mapUser);
}

/** Public profile fields only: never exposes email or account status. */
export type PublicMember = Omit<User, "email" | "isActive">;

export async function getPublicMembers(): Promise<PublicMember[]> {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  return users.map((u) => {
    const { email: _email, isActive: _isActive, ...publicFields } = mapUser(u);
    void _email;
    void _isActive;
    return publicFields;
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  return user ? mapUser(user) : null;
}

export async function getWeeks(): Promise<Week[]> {
  const weeks = await prisma.week.findMany({ orderBy: { weekNumber: "asc" } });
  return weeks.map(mapWeek);
}

export interface TaskFilters {
  weekId?: string | null;
  domain?: string | null;
  userId?: string | null;
  status?: string | null;
}

export async function getTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const where: Prisma.TaskWhereInput = {};
  if (filters.weekId && filters.weekId !== "all") where.weekId = filters.weekId;
  if (filters.userId) where.userId = filters.userId;
  if (filters.domain && filters.domain !== "All") {
    const match = Object.entries(DOMAIN_TO_DB).find(([name]) => name.toLowerCase() === filters.domain!.toLowerCase());
    if (!match) return [];
    where.domain = match[1];
  }
  if (filters.status) {
    const status = filters.status.toLowerCase();
    if (status !== "submitted" && status !== "evaluated") return [];
    where.status = status === "evaluated" ? "EVALUATED" : "SUBMITTED";
  }
  const tasks = await prisma.task.findMany({ where, include: taskInclude, orderBy: { submittedAt: "desc" } });
  return tasks.map(mapTask);
}

export interface NewTask {
  userId: string;
  weekId: string;
  domain: DomainType;
  title: string;
  description: string;
  githubUrl?: string;
  liveUrl?: string;
  figmaUrl?: string;
  notes?: string;
}

export async function addTask(taskData: NewTask): Promise<Task> {
  const domain = toDbDomain(taskData.domain);
  if (!domain) throw new NotFoundError(`Unknown domain: ${taskData.domain}`);

  const [user, week] = await Promise.all([
    prisma.user.findUnique({ where: { id: taskData.userId }, select: { id: true } }),
    prisma.week.findUnique({ where: { id: taskData.weekId }, select: { id: true } }),
  ]);
  if (!user) throw new NotFoundError("Member account not found");
  if (!week) throw new NotFoundError("Sprint week not found");

  const created = await prisma.task.create({
    data: {
      userId: taskData.userId,
      weekId: taskData.weekId,
      domain,
      title: taskData.title,
      description: taskData.description,
      githubUrl: taskData.githubUrl || null,
      liveUrl: taskData.liveUrl || null,
      figmaUrl: taskData.figmaUrl || null,
      notes: taskData.notes || null,
    },
    include: taskInclude,
  });
  return mapTask(created);
}

export interface EvaluationInput {
  taskId: string;
  adminId: string;
  score: number;
  feedback: string;
  criteriaScores?: Evaluation["criteriaScores"];
  /** Domain leads may only grade tasks from their own domain. */
  restrictToDomain?: DomainType;
}

export async function evaluateTask({
  taskId, adminId, score, feedback, criteriaScores, restrictToDomain,
}: EvaluationInput): Promise<Task | null> {
  const admin = await prisma.user.findUnique({ where: { id: adminId }, select: { id: true } });
  if (!admin) throw new NotFoundError("Evaluator account not found");

  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({ where: { id: taskId }, include: { evaluation: true } });
    if (!task) return null;
    if (task.userId === adminId) throw new ForbiddenError("You cannot grade your own submission");
    if (restrictToDomain && task.domain !== toDbDomain(restrictToDomain)) {
      throw new ForbiddenError("You can only grade submissions from your own domain");
    }

    const previous = task.evaluation;
    const fields = {
      adminId,
      score,
      feedback,
      technicalDepth: criteriaScores?.technicalDepth ?? null,
      innovation: criteriaScores?.innovation ?? null,
      completion: criteriaScores?.completion ?? null,
      documentation: criteriaScores?.documentation ?? null,
      evaluatedAt: new Date(),
    };
    await tx.evaluation.upsert({
      where: { taskId },
      create: { taskId, ...fields },
      update: fields,
    });
    await tx.task.update({ where: { id: taskId }, data: { status: "EVALUATED" } });

    // Re-grading adjusts points by the difference instead of adding the score again.
    await tx.user.update({
      where: { id: task.userId },
      data: {
        points: { increment: score - (previous?.score ?? 0) },
        ...(previous ? {} : { tasksCompleted: { increment: 1 } }),
      },
    });

    const updated = await tx.task.findUniqueOrThrow({ where: { id: taskId }, include: taskInclude });
    return mapTask(updated);
  });
}

export async function getLeaderboard(domain?: string, period?: string): Promise<LeaderboardEntry[]> {
  void period; // TODO(PRD R10): real period filters and rank change

  const filterByDomain = !!domain && domain !== "All";
  const dbDomain = filterByDomain ? toDbDomain(domain) : undefined;
  if (filterByDomain && !dbDomain) return []; // unknown domain -> no results

  const users = await prisma.user.findMany({
    where: { role: "MEMBER", ...(dbDomain ? { domain: dbDomain } : {}) },
    include: { tasks: { where: { status: "EVALUATED" }, include: { evaluation: true } } },
  });

  const entries: LeaderboardEntry[] = users.map((user) => {
    const evaluated = user.tasks.filter((t) => t.evaluation);
    const totalScore =
      evaluated.reduce((sum, t) => sum + (t.evaluation?.score || 0), 0) +
      (user.points ? Math.floor(user.points * 0.7) : 0);
    const count = evaluated.length || user.tasksCompleted || 1;
    const avgScore = Math.round(totalScore / count);
    const userDomain = DOMAIN_FROM_DB[user.domain];

    const badges: string[] = [];
    if (totalScore >= 350) badges.push("Grandmaster");
    if (user.streakWeeks >= 4) badges.push("Streak Fire");
    if (userDomain === "Web") badges.push("Fullstack Pioneer");
    if (userDomain === "Technical") badges.push("Algo Titan");
    if (userDomain === "R&D") badges.push("Deep Innovator");
    if (userDomain === "Design") badges.push("Visual Architect");

    return {
      rank: 1,
      userId: user.id,
      name: user.name,
      avatar: user.avatar ?? "",
      domain: userDomain,
      totalScore,
      avgScore,
      tasksCompleted: count,
      streakWeeks: user.streakWeeks || 1,
      rankChange: Math.floor(Math.random() * 3) - 1, // placeholder until PRD R10
      badges,
    };
  });

  entries.sort((a, b) => b.totalScore - a.totalScore);
  entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });
  return entries;
}
