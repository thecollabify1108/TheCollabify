-- AlterTable
ALTER TABLE "CreatorProfile" ADD COLUMN     "followerMismatchPercentage" DOUBLE PRECISION,
ADD COLUMN     "followerRiskScore" TEXT,
ADD COLUMN     "selfReportedFollowers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "verificationLastUpdated" TIMESTAMP(3),
ADD COLUMN     "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "verifiedBy" TEXT,
ADD COLUMN     "verifiedFollowerRangeMax" INTEGER,
ADD COLUMN     "verifiedFollowerRangeMin" INTEGER;
