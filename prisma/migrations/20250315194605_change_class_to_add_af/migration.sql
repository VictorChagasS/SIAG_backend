/*
  Warnings:

  - You are about to drop the column `averageFormula` on the `evaluation_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "averageFormula" TEXT;

-- AlterTable
ALTER TABLE "evaluation_items" DROP COLUMN "averageFormula";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "currentPeriod" SET DEFAULT CONCAT(EXTRACT(YEAR FROM CURRENT_DATE)::TEXT, '.', CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE) > 6 THEN '2' ELSE '1' END);
