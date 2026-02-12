-- AlterTable
ALTER TABLE "CreatorProfile" ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pastExperience" TEXT,
ADD COLUMN     "portfolioLinks" TEXT[],
ADD COLUMN     "profileCompletionPercentage" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "CreatorProfile_profileCompletionPercentage_idx" ON "CreatorProfile"("profileCompletionPercentage");
