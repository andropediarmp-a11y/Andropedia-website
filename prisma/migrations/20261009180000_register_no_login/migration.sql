-- Login by register number + password. Both columns are filled by `npm run db:import-members`.
ALTER TABLE "User" ADD COLUMN "registerNo" TEXT;
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
CREATE UNIQUE INDEX "User_registerNo_key" ON "User"("registerNo");
-- "LoginCode" is intentionally kept for now: a deployment still running the old email-code login needs it.
