-- AlterTable
ALTER TABLE "Competition" ADD COLUMN     "allowMultipleTeams" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "leaderCnic" TEXT;

-- AlterTable
ALTER TABLE "RegistrationMember" ADD COLUMN     "cnic" TEXT;
