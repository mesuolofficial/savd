-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('SOCIETY', 'INSTITUTE', 'AMBASSADOR');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "referralCode" TEXT;

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PartnerType" NOT NULL,
    "institution" TEXT,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "status" "PartnerStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Partner_referralCode_key" ON "Partner"("referralCode");

-- CreateIndex
CREATE INDEX "Registration_referralCode_idx" ON "Registration"("referralCode");

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_referralCode_fkey" FOREIGN KEY ("referralCode") REFERENCES "Partner"("referralCode") ON DELETE SET NULL ON UPDATE CASCADE;
