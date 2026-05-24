/*
  Warnings:

  - You are about to drop the column `isPresent` on the `Attendance` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT');

-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('SCHOOL', 'MADRASA');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'PAID', 'UNPAID', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TierPackage" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_institutionId_fkey";

-- DropIndex
DROP INDEX "Institution_ownerId_key";

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "isPresent",
ADD COLUMN     "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Institution" ADD COLUMN     "autoPause" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "ownerEmail" TEXT,
ADD COLUMN     "ownerName" TEXT,
ADD COLUMN     "packageTier" TEXT NOT NULL DEFAULT 'BASIC',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'TRIAL',
ADD COLUMN     "subscriptionPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "trialDays" INTEGER NOT NULL DEFAULT 14,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'SCHOOL';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'STUDENT',
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "institutionId" DROP NOT NULL;

-- DropEnum
DROP TYPE "SystemRole";

-- CreateTable
CREATE TABLE "Notice" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "authorId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notice_institutionId_idx" ON "Notice"("institutionId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
