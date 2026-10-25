/*
  Warnings:

  - The values [PLATINUM,GOLD,SILVER] on the enum `SponsorTier` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SponsorTier_new" AS ENUM ('SPONSOR', 'ORGANIZER', 'PARTNER', 'COLLABORATOR');
ALTER TABLE "public"."Sponsor" ALTER COLUMN "tier" DROP DEFAULT;
ALTER TABLE "Sponsor" ALTER COLUMN "tier" TYPE "SponsorTier_new" USING ("tier"::text::"SponsorTier_new");
ALTER TYPE "SponsorTier" RENAME TO "SponsorTier_old";
ALTER TYPE "SponsorTier_new" RENAME TO "SponsorTier";
DROP TYPE "public"."SponsorTier_old";
ALTER TABLE "Sponsor" ALTER COLUMN "tier" SET DEFAULT 'PARTNER';
COMMIT;
