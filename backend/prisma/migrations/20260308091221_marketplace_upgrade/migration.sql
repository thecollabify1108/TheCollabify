/*
  Warnings:

  - You are about to drop the column `deliverables` on the `Collaboration` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FollowerRange" AS ENUM ('RANGE_1K_5K', 'RANGE_5K_10K', 'RANGE_10K_50K', 'RANGE_50K_100K', 'RANGE_100K_PLUS');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('PENDING_DEPOSIT', 'DEPOSITED', 'HELD', 'RELEASED', 'REFUNDED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "DeliverableStatus" AS ENUM ('PENDING', 'SUBMITTED', 'REVISION_REQUESTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED_CREATOR', 'RESOLVED_BRAND', 'CLOSED');

-- AlterTable
ALTER TABLE "Collaboration" DROP COLUMN "deliverables",
ADD COLUMN     "deliverableItems" TEXT[];

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "creatorMsgCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isEscrowUnlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sellerMsgCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CreatorProfile" ADD COLUMN     "engagementRateWarning" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "followerRange" "FollowerRange",
ADD COLUMN     "followerRangeChangedAt" TIMESTAMP(3),
ADD COLUMN     "profileLastEditedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "BrandProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "website" TEXT,
    "instagramBusinessUrl" TEXT,
    "description" TEXT,
    "locationCity" TEXT,
    "locationState" TEXT,
    "locationCountry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityCampaign" (
    "id" TEXT NOT NULL,
    "creatorProfileId" TEXT NOT NULL,
    "creatorUserId" TEXT NOT NULL,
    "niche" "Category" NOT NULL,
    "locationCity" TEXT,
    "locationState" TEXT,
    "locationCountry" TEXT,
    "deliverablesOffered" TEXT[],
    "collaborationBudgetMin" DOUBLE PRECISION NOT NULL,
    "collaborationBudgetMax" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "durationDays" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscrowPayment" (
    "id" TEXT NOT NULL,
    "collaborationId" TEXT NOT NULL,
    "brandUserId" TEXT NOT NULL,
    "creatorUserId" TEXT NOT NULL,
    "collaborationAmount" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "totalDeposited" DOUBLE PRECISION NOT NULL,
    "status" "EscrowStatus" NOT NULL DEFAULT 'PENDING_DEPOSIT',
    "stripePaymentIntentId" TEXT,
    "stripeTransferId" TEXT,
    "depositedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EscrowPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaborationDeliverable" (
    "id" TEXT NOT NULL,
    "collaborationId" TEXT NOT NULL,
    "submittedByUserId" TEXT NOT NULL,
    "revisionCount" INTEGER NOT NULL DEFAULT 0,
    "maxRevisions" INTEGER NOT NULL DEFAULT 3,
    "contentLinks" TEXT[],
    "screenshotUrls" TEXT[],
    "fileUrls" TEXT[],
    "description" TEXT,
    "status" "DeliverableStatus" NOT NULL DEFAULT 'PENDING',
    "revisionNotes" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollaborationDeliverable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaborationDispute" (
    "id" TEXT NOT NULL,
    "collaborationId" TEXT NOT NULL,
    "raisedByUserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "evidence" TEXT[],
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedByAdminId" TEXT,
    "resolutionNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollaborationDispute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrandProfile_userId_key" ON "BrandProfile"("userId");

-- CreateIndex
CREATE INDEX "BrandProfile_category_idx" ON "BrandProfile"("category");

-- CreateIndex
CREATE INDEX "AvailabilityCampaign_niche_idx" ON "AvailabilityCampaign"("niche");

-- CreateIndex
CREATE INDEX "AvailabilityCampaign_isActive_expiresAt_idx" ON "AvailabilityCampaign"("isActive", "expiresAt");

-- CreateIndex
CREATE INDEX "AvailabilityCampaign_locationCity_idx" ON "AvailabilityCampaign"("locationCity");

-- CreateIndex
CREATE UNIQUE INDEX "EscrowPayment_collaborationId_key" ON "EscrowPayment"("collaborationId");

-- CreateIndex
CREATE INDEX "EscrowPayment_brandUserId_idx" ON "EscrowPayment"("brandUserId");

-- CreateIndex
CREATE INDEX "EscrowPayment_creatorUserId_idx" ON "EscrowPayment"("creatorUserId");

-- CreateIndex
CREATE INDEX "EscrowPayment_status_idx" ON "EscrowPayment"("status");

-- CreateIndex
CREATE INDEX "CollaborationDeliverable_collaborationId_status_idx" ON "CollaborationDeliverable"("collaborationId", "status");

-- CreateIndex
CREATE INDEX "CollaborationDispute_collaborationId_idx" ON "CollaborationDispute"("collaborationId");

-- CreateIndex
CREATE INDEX "CollaborationDispute_status_idx" ON "CollaborationDispute"("status");

-- AddForeignKey
ALTER TABLE "BrandProfile" ADD CONSTRAINT "BrandProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityCampaign" ADD CONSTRAINT "AvailabilityCampaign_creatorProfileId_fkey" FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscrowPayment" ADD CONSTRAINT "EscrowPayment_collaborationId_fkey" FOREIGN KEY ("collaborationId") REFERENCES "Collaboration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationDeliverable" ADD CONSTRAINT "CollaborationDeliverable_collaborationId_fkey" FOREIGN KEY ("collaborationId") REFERENCES "Collaboration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationDispute" ADD CONSTRAINT "CollaborationDispute_collaborationId_fkey" FOREIGN KEY ("collaborationId") REFERENCES "Collaboration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
