/*
  Warnings:

  - You are about to drop the column `active` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `classes` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "classes_active_idx";

-- AlterTable
ALTER TABLE "classes" DROP COLUMN "active",
DROP COLUMN "year",
ALTER COLUMN "period" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currentPeriod" TEXT;

-- CreateIndex
CREATE INDEX "classes_period_idx" ON "classes"("period");
