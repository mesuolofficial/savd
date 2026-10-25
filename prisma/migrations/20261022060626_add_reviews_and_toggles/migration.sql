-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "ambassadorOpen" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "partnerOpen" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sponsorOpen" BOOLEAN NOT NULL DEFAULT true;
