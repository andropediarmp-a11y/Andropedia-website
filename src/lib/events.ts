import type { Event as DbEvent } from "@prisma/client";
import { recordAudit } from "./audit";
import { ConflictError, NotFoundError } from "./data-store";
import type { EventCreateInput, EventPatchInput, TeamMemberInput } from "./events-schema";
import { prisma } from "./prisma";
import { emailKey } from "./recruitment/email-key";

export type EventStatus = "open" | "full" | "closed" | "past";

export interface PublicEvent {
  id: string;
  title: string;
  type: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string | null;
  capacity: number | null;
  /** Both set = team event: teams of teamMin..teamMax people register together. */
  teamMin: number | null;
  teamMax: number | null;
  prize: string | null;
  registrationOpen: boolean;
  /** The real date is not known yet. The date is hidden and the event counts as past. */
  dateTbc: boolean;
  /** Reservations (people for individual events, teams for team events). */
  rsvpCount: number;
  /** null when there is no seat limit. */
  seatsLeft: number | null;
  status: EventStatus;
}

export interface AdminEvent extends PublicEvent {
  isPublished: boolean;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  /** Team events only: one row per team member. */
  teamName?: string;
  isLeader?: boolean;
  mobile?: string;
  dept?: string;
  section?: string;
  year?: string;
  registerNo?: string;
}

/** Pure: what visitors can do with an event right now. */
export function eventStatus(
  e: { startsAt: Date; endsAt: Date | null; capacity: number | null; registrationOpen: boolean; dateTbc?: boolean },
  rsvpCount: number,
  now: Date = new Date()
): EventStatus {
  if (e.dateTbc) return "past"; // no real date yet: never open for registration
  if ((e.endsAt ?? e.startsAt) < now) return "past";
  if (!e.registrationOpen) return "closed";
  if (e.capacity != null && rsvpCount >= e.capacity) return "full";
  return "open";
}

function toAdmin(e: DbEvent, rsvpCount: number, now = new Date()): AdminEvent {
  return {
    id: e.id,
    title: e.title,
    type: e.type,
    description: e.description,
    location: e.location,
    startsAt: e.startsAt.toISOString(),
    endsAt: e.endsAt?.toISOString() ?? null,
    capacity: e.capacity,
    teamMin: e.teamMin,
    teamMax: e.teamMax,
    prize: e.prize,
    registrationOpen: e.registrationOpen,
    dateTbc: e.dateTbc,
    isPublished: e.isPublished,
    rsvpCount,
    seatsLeft: e.capacity == null ? null : Math.max(0, e.capacity - rsvpCount),
    status: eventStatus(e, rsvpCount, now),
  };
}

const withCount = { _count: { select: { rsvps: true } } } as const;

/** Published events, soonest first. Never includes attendee details. */
export async function listPublicEvents(): Promise<PublicEvent[]> {
  const rows = await prisma.event.findMany({ where: { isPublished: true }, orderBy: { startsAt: "asc" }, include: withCount });
  return rows.map(({ _count, ...e }) => {
    const { isPublished, ...pub } = toAdmin(e, _count.rsvps);
    void isPublished;
    return pub;
  });
}

export async function listAdminEvents(): Promise<AdminEvent[]> {
  const rows = await prisma.event.findMany({ orderBy: { startsAt: "desc" }, include: withCount });
  return rows.map(({ _count, ...e }) => toAdmin(e, _count.rsvps));
}

function checkDates(startsAt: Date, endsAt: Date | null | undefined) {
  if (endsAt && endsAt < startsAt) throw new ConflictError("The end time must be after the start time.");
}

function checkTeamSize(min: number | null | undefined, max: number | null | undefined) {
  if ((min == null) !== (max == null)) throw new ConflictError("Set both the minimum and maximum team size, or neither.");
  if (min != null && max != null && min > max) throw new ConflictError("The minimum team size cannot be larger than the maximum.");
}

export async function createEvent(input: EventCreateInput, actorId: string): Promise<AdminEvent> {
  const startsAt = new Date(input.startsAt);
  const endsAt = input.endsAt ? new Date(input.endsAt) : null;
  checkDates(startsAt, endsAt);
  checkTeamSize(input.teamMin, input.teamMax);
  const created = await prisma.event.create({
    data: {
      title: input.title,
      type: input.type,
      description: input.description,
      location: input.location,
      startsAt,
      endsAt,
      capacity: input.capacity ?? null,
      teamMin: input.teamMin ?? null,
      teamMax: input.teamMax ?? null,
      prize: input.prize || null,
      isPublished: input.isPublished ?? false,
      registrationOpen: input.registrationOpen ?? true,
      dateTbc: input.dateTbc ?? false,
    },
  });
  await recordAudit({ actorId, action: "event.create", target: created.id, meta: { title: created.title } });
  return toAdmin(created, 0);
}

export async function updateEvent(id: string, patch: EventPatchInput, actorId: string): Promise<AdminEvent> {
  const current = await prisma.event.findUnique({ where: { id }, include: withCount });
  if (!current) throw new NotFoundError("Event not found.");

  const startsAt = patch.startsAt !== undefined ? new Date(patch.startsAt) : undefined;
  const endsAt = patch.endsAt === undefined ? undefined : patch.endsAt === null ? null : new Date(patch.endsAt);
  checkDates(startsAt ?? current.startsAt, endsAt === undefined ? current.endsAt : endsAt);
  checkTeamSize(
    patch.teamMin === undefined ? current.teamMin : patch.teamMin,
    patch.teamMax === undefined ? current.teamMax : patch.teamMax
  );
  const sizeChanged =
    (patch.teamMin !== undefined && patch.teamMin !== current.teamMin) || (patch.teamMax !== undefined && patch.teamMax !== current.teamMax);
  if (sizeChanged && current._count.rsvps > 0) {
    throw new ConflictError("Team size cannot change after registrations have started.");
  }
  if (patch.capacity != null && patch.capacity < current._count.rsvps) {
    throw new ConflictError(`${current._count.rsvps} people have already reserved seats; capacity cannot go below that.`);
  }

  const updated = await prisma.event.update({
    where: { id },
    data: {
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.type !== undefined ? { type: patch.type } : {}),
      ...(patch.description !== undefined ? { description: patch.description } : {}),
      ...(patch.location !== undefined ? { location: patch.location } : {}),
      ...(startsAt ? { startsAt } : {}),
      ...(endsAt !== undefined ? { endsAt } : {}),
      ...(patch.capacity !== undefined ? { capacity: patch.capacity } : {}),
      ...(patch.teamMin !== undefined ? { teamMin: patch.teamMin } : {}),
      ...(patch.teamMax !== undefined ? { teamMax: patch.teamMax } : {}),
      ...(patch.prize !== undefined ? { prize: patch.prize || null } : {}),
      ...(patch.isPublished !== undefined ? { isPublished: patch.isPublished } : {}),
      ...(patch.registrationOpen !== undefined ? { registrationOpen: patch.registrationOpen } : {}),
      ...(patch.dateTbc !== undefined ? { dateTbc: patch.dateTbc } : {}),
    },
  });
  await recordAudit({ actorId, action: "event.update", target: id, meta: { fields: Object.keys(patch) } });
  return toAdmin(updated, current._count.rsvps);
}

export async function deleteEvent(id: string, actorId: string): Promise<void> {
  const current = await prisma.event.findUnique({ where: { id }, include: withCount });
  if (!current) throw new NotFoundError("Event not found.");
  await prisma.event.delete({ where: { id } });
  await recordAudit({ actorId, action: "event.delete", target: id, meta: { title: current.title, rsvps: current._count.rsvps } });
}

export async function listAttendees(eventId: string): Promise<Attendee[]> {
  const rows = await prisma.eventRsvp.findMany({
    where: { eventId },
    orderBy: { createdAt: "asc" },
    include: { members: { orderBy: [{ isLeader: "desc" }, { name: "asc" }] } },
  });
  return rows.flatMap((r): Attendee[] =>
    r.teamName
      ? r.members.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          createdAt: r.createdAt.toISOString(),
          teamName: r.teamName ?? undefined,
          isLeader: m.isLeader,
          mobile: m.mobile,
          dept: m.dept,
          section: m.section,
          year: m.year,
          registerNo: m.registerNo,
        }))
      : [{ id: r.id, name: r.name, email: r.email, createdAt: r.createdAt.toISOString() }]
  );
}

export interface RsvpResult {
  rsvpId: string;
  event: Pick<DbEvent, "id" | "title" | "location" | "startsAt" | "endsAt">;
}

/**
 * Reserves a seat. The event row is locked for the duration of the transaction, so two people
 * cannot both take the last seat; the unique (event, canonical email) index stops one person
 * reserving twice.
 */
export async function rsvpToEvent(eventId: string, person: { name: string; email: string }): Promise<RsvpResult> {
  try {
    return await prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "Event" WHERE "id" = ${eventId} AND "isPublished" = true FOR UPDATE`;
      if (locked.length === 0) throw new NotFoundError("Event not found.");

      const event = await tx.event.findUniqueOrThrow({ where: { id: eventId } });
      const taken = await tx.eventRsvp.count({ where: { eventId } });
      if (event.teamMax != null) throw new ConflictError("This event is for teams. Please register your team.");
      const status = eventStatus(event, taken);
      if (status === "past") throw new ConflictError("This event has already taken place.");
      if (status === "closed") throw new ConflictError("Reservations for this event are closed.");
      if (status === "full") throw new ConflictError("Sorry, this event is full.");

      const rsvp = await tx.eventRsvp.create({
        data: { eventId, name: person.name, email: person.email, emailKey: emailKey(person.email) },
      });
      return { rsvpId: rsvp.id, event: { id: event.id, title: event.title, location: event.location, startsAt: event.startsAt, endsAt: event.endsAt } };
    });
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") {
      throw new ConflictError("You have already reserved a seat for this event.");
    }
    throw err;
  }
}

export interface TeamRsvpResult {
  rsvpId: string;
  event: Pick<DbEvent, "id" | "title" | "location" | "startsAt" | "endsAt">;
}

/**
 * Registers a team (first member = leader). Same locking as a single RSVP; capacity counts teams.
 * Unique indexes stop anyone appearing on two teams, or the same register number being reused.
 */
export async function rsvpTeam(eventId: string, team: { teamName: string; members: TeamMemberInput[] }): Promise<TeamRsvpResult> {
  try {
    return await prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "Event" WHERE "id" = ${eventId} AND "isPublished" = true FOR UPDATE`;
      if (locked.length === 0) throw new NotFoundError("Event not found.");

      const event = await tx.event.findUniqueOrThrow({ where: { id: eventId } });
      if (event.teamMin == null || event.teamMax == null) throw new ConflictError("This event takes individual reservations, not teams.");
      if (team.members.length < event.teamMin || team.members.length > event.teamMax) {
        throw new ConflictError(
          event.teamMin === event.teamMax
            ? `Teams must have exactly ${event.teamMin} members.`
            : `Teams must have ${event.teamMin} to ${event.teamMax} members.`
        );
      }
      const keys = team.members.map((m) => emailKey(m.email));
      if (new Set(keys).size !== keys.length) throw new ConflictError("Each team member needs a different email address.");
      if (new Set(team.members.map((m) => m.registerNo)).size !== team.members.length) {
        throw new ConflictError("Each team member needs a different register number.");
      }

      const taken = await tx.eventRsvp.count({ where: { eventId } });
      const status = eventStatus(event, taken);
      if (status === "past") throw new ConflictError("This event has already taken place.");
      if (status === "closed") throw new ConflictError("Registrations for this event are closed.");
      if (status === "full") throw new ConflictError("Sorry, this event is full.");

      const [leader] = team.members;
      const rsvp = await tx.eventRsvp.create({
        data: {
          eventId,
          name: leader.name,
          email: leader.email,
          emailKey: keys[0],
          teamName: team.teamName,
          members: {
            create: team.members.map((m, i) => ({
              eventId,
              isLeader: i === 0,
              name: m.name,
              mobile: m.mobile,
              email: m.email,
              emailKey: keys[i],
              dept: m.dept,
              section: m.section,
              year: m.year,
              registerNo: m.registerNo,
            })),
          },
        },
      });
      return { rsvpId: rsvp.id, event: { id: event.id, title: event.title, location: event.location, startsAt: event.startsAt, endsAt: event.endsAt } };
    });
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") {
      const target = JSON.stringify((err as { meta?: unknown }).meta ?? "");
      throw new ConflictError(
        target.includes("registerNo")
          ? "One of these register numbers is already registered for this event."
          : "One of these people is already registered for this event."
      );
    }
    throw err;
  }
}

export async function markRsvpEmailSent(rsvpId: string): Promise<void> {
  await prisma.eventRsvp.update({ where: { id: rsvpId }, data: { emailSentAt: new Date() } });
}
