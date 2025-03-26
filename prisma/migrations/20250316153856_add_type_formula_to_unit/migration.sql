-- CreateEnum
CREATE TYPE "TypeFormula" AS ENUM ('simple', 'personalized');

-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "typeFormula" "TypeFormula" NOT NULL DEFAULT 'simple';

-- AlterTable
ALTER TABLE "units" ADD COLUMN     "typeFormula" "TypeFormula" NOT NULL DEFAULT 'simple';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "currentPeriod" SET DEFAULT CONCAT(EXTRACT(YEAR FROM CURRENT_DATE)::TEXT, '.', CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE) > 6 THEN '2' ELSE '1' END);
