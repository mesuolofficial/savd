-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "cnic" TEXT;

-- CreateIndex
CREATE INDEX "Person_cnic_idx" ON "Person"("cnic");
