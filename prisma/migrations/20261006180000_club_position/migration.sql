-- CreateEnum
CREATE TYPE "ClubPosition" AS ENUM ('PRESIDENT', 'VICE_PRESIDENT', 'CHIEF', 'LEAD', 'CO_LEAD', 'MEMBER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "position" "ClubPosition" NOT NULL DEFAULT 'MEMBER';

