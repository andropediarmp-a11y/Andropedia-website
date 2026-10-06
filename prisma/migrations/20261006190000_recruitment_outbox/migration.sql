-- CreateTable
CREATE TABLE "RecruitmentOutbox" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailSentAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "RecruitmentOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecruitmentOutbox_reference_key" ON "RecruitmentOutbox"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "RecruitmentOutbox_emailHash_key" ON "RecruitmentOutbox"("emailHash");

-- CreateIndex
CREATE INDEX "RecruitmentOutbox_sentAt_idx" ON "RecruitmentOutbox"("sentAt");
