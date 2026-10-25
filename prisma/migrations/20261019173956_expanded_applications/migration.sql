-- AlterTable
ALTER TABLE "Partner" ADD COLUMN     "additionalInfo" TEXT,
ADD COLUMN     "advisorEmail" TEXT,
ADD COLUMN     "advisorName" TEXT,
ADD COLUMN     "advisorPhone" TEXT,
ADD COLUMN     "campus" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "contactDesignation" TEXT,
ADD COLUMN     "logoTransparent" TEXT,
ADD COLUMN     "logoWithBg" TEXT,
ADD COLUMN     "presidentEmail" TEXT,
ADD COLUMN     "presidentName" TEXT,
ADD COLUMN     "presidentPhone" TEXT,
ADD COLUMN     "presidentSocial" TEXT,
ADD COLUMN     "socialMediaUrl" TEXT,
ADD COLUMN     "submittedBy" TEXT,
ADD COLUMN     "submittedByDesignation" TEXT,
ALTER COLUMN "contactName" DROP NOT NULL,
ALTER COLUMN "contactEmail" DROP NOT NULL,
ALTER COLUMN "contactPhone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Sponsor" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "status" "PartnerStatus" NOT NULL DEFAULT 'APPROVED';
