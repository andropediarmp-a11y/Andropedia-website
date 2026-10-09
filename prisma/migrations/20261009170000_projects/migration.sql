-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "github" TEXT,
    "live" TEXT,
    "status" TEXT NOT NULL DEFAULT 'In progress',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_isPublished_createdAt_idx" ON "Project"("isPublished", "createdAt");

-- Same policy as every other table: RLS on with no policies, so only the app (database owner) can use it.
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
