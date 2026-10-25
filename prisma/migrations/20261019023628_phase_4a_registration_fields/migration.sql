-- AlterTable
ALTER TABLE "Competition" ADD COLUMN     "rulebookUrl" TEXT;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "leaderUniversityId" TEXT,
ADD COLUMN     "submittedIp" TEXT;

-- CreateIndex
CREATE INDEX "Registration_leaderUniversityId_idx" ON "Registration"("leaderUniversityId");

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_leaderUniversityId_fkey" FOREIGN KEY ("leaderUniversityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;
