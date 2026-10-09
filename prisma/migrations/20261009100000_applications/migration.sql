-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "emailKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "domainAnswer" TEXT NOT NULL,
    "portfolioUrl" TEXT NOT NULL DEFAULT '',
    "consent" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'new',
    "emailSentAt" TIMESTAMP(3),
    "sheetSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Application_reference_key" ON "Application"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Application_emailKey_key" ON "Application"("emailKey");

-- CreateIndex
CREATE INDEX "Application_createdAt_idx" ON "Application"("createdAt");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- Applicant data: lock the Supabase Data API out (the app uses Prisma as the table owner).
ALTER TABLE "Application" ENABLE ROW LEVEL SECURITY;
