-- AlterTable
ALTER TABLE "Event" ADD COLUMN "teamMin" INTEGER,
ADD COLUMN "teamMax" INTEGER;

-- AlterTable
ALTER TABLE "EventRsvp" ADD COLUMN "teamName" TEXT;

-- CreateTable
CREATE TABLE "EventMember" (
    "id" TEXT NOT NULL,
    "rsvpId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailKey" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "registerNo" TEXT NOT NULL,

    CONSTRAINT "EventMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventMember_rsvpId_idx" ON "EventMember"("rsvpId");

-- CreateIndex
CREATE UNIQUE INDEX "EventMember_eventId_emailKey_key" ON "EventMember"("eventId", "emailKey");

-- CreateIndex
CREATE UNIQUE INDEX "EventMember_eventId_registerNo_key" ON "EventMember"("eventId", "registerNo");

-- AddForeignKey
ALTER TABLE "EventMember" ADD CONSTRAINT "EventMember_rsvpId_fkey" FOREIGN KEY ("rsvpId") REFERENCES "EventRsvp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Teams must have a sensible size range, set together or not at all.
ALTER TABLE "Event" ADD CONSTRAINT "Event_team_size_check"
  CHECK (("teamMin" IS NULL AND "teamMax" IS NULL) OR ("teamMin" >= 1 AND "teamMax" >= "teamMin" AND "teamMax" <= 10));

-- Row Level Security (see earlier migrations).
ALTER TABLE "EventMember" ENABLE ROW LEVEL SECURITY;
