-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- Same policy as every other table: RLS on with no policies, so only the app (database owner) can use it.
ALTER TABLE "RateLimit" ENABLE ROW LEVEL SECURITY;
