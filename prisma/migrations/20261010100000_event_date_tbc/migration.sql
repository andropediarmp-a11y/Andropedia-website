-- Events whose real date is not known yet (shown as "Date to be announced", never open for registration).
ALTER TABLE "Event" ADD COLUMN "dateTbc" BOOLEAN NOT NULL DEFAULT false;
