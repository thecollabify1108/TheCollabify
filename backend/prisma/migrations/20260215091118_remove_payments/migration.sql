/*
  Warnings:

  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropTable
DROP TABLE "Payment";

-- DropEnum
DROP TYPE "PaymentStatus";

-- CreateIndex
CREATE INDEX "Analytics_metrics_idx" ON "Analytics" USING GIN ("metrics");

-- CreateIndex
CREATE INDEX "CreatorProfile_location_idx" ON "CreatorProfile" USING GIN ("location");

-- CreateIndex
CREATE INDEX "PromotionRequest_location_idx" ON "PromotionRequest" USING GIN ("location");

-- CreateIndex
CREATE INDEX "TeamMember_organizationId_idx" ON "TeamMember"("organizationId");

-- CreateIndex
CREATE INDEX "TeamMember_userId_idx" ON "TeamMember"("userId");

-- CreateIndex
CREATE INDEX "TeamMember_permissions_idx" ON "TeamMember" USING GIN ("permissions");
