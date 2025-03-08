-- AlterTable
ALTER TABLE "universities" ADD COLUMN     "acronym" TEXT;

-- CreateIndex
CREATE INDEX "universities_acronym_idx" ON "universities"("acronym");
