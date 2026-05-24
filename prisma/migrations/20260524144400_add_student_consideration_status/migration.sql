-- CreateEnum
CREATE TYPE "ConsiderationStatus" AS ENUM ('REGULAR', 'SCHOLARSHIP', 'SPECIAL_DUE');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "considerationStatus" "ConsiderationStatus" NOT NULL DEFAULT 'REGULAR';
