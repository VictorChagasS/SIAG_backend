-- DropForeignKey
ALTER TABLE "evaluation_items" DROP CONSTRAINT "evaluation_items_unitId_fkey";

-- DropForeignKey
ALTER TABLE "grades" DROP CONSTRAINT "grades_evaluationItemId_fkey";

-- DropForeignKey
ALTER TABLE "grades" DROP CONSTRAINT "grades_studentId_fkey";

-- DropForeignKey
ALTER TABLE "units" DROP CONSTRAINT "units_classId_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "currentPeriod" SET DEFAULT CONCAT(EXTRACT(YEAR FROM CURRENT_DATE)::TEXT, '.', CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE) > 6 THEN '2' ELSE '1' END);

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_items" ADD CONSTRAINT "evaluation_items_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_evaluationItemId_fkey" FOREIGN KEY ("evaluationItemId") REFERENCES "evaluation_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
