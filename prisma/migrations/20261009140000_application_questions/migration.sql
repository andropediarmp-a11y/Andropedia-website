-- The Application table was empty when this ran. Replace the old free-text answer columns with
-- the new basic details and a JSON answers column (one key per question).
ALTER TABLE "Application"
  DROP COLUMN "skills",
  DROP COLUMN "motivation",
  DROP COLUMN "domainAnswer",
  DROP COLUMN "portfolioUrl",
  ADD COLUMN "registerNo" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "department" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "phone" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "profile" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "answers" JSONB NOT NULL DEFAULT '{}';

ALTER TABLE "Application"
  ALTER COLUMN "registerNo" DROP DEFAULT,
  ALTER COLUMN "department" DROP DEFAULT,
  ALTER COLUMN "phone" DROP DEFAULT,
  ALTER COLUMN "profile" DROP DEFAULT,
  ALTER COLUMN "answers" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Application_domain_idx" ON "Application"("domain");
