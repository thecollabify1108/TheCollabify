/*
  Warnings:

  - You are about to drop the column `stripeAccountId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeOnboardingComplete` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_stripeAccountId_key";

-- DropIndex
DROP INDEX "User_stripeCustomerId_key";

-- AlterTable
ALTER TABLE "CreatorProfile" ADD COLUMN     "reliabilityScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "stripeAccountId",
DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripeOnboardingComplete",
ADD COLUMN     "reliabilityScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- CreateTable
CREATE TABLE "FrictionEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FrictionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Embedding" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "vector" JSONB NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'text-embedding-004',
    "dimensions" INTEGER NOT NULL DEFAULT 768,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Embedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorQualityIndex" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "engagementConsistency" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "followerGrowthStability" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "commentAuthenticity" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "postingFrequency" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "nicheAuthority" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "audienceRetention" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "fraudRiskScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dataPoints" INTEGER NOT NULL DEFAULT 0,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "version" INTEGER NOT NULL DEFAULT 1,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorQualityIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CQISnapshot" (
    "id" TEXT NOT NULL,
    "cqiId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "subscores" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CQISnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignPrediction" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "predictedEngagement" DOUBLE PRECISION NOT NULL,
    "predictedReach" INTEGER NOT NULL,
    "predictedROI" DOUBLE PRECISION NOT NULL,
    "confidenceInterval" JSONB NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "featureSnapshot" JSONB NOT NULL,
    "modelVersion" TEXT NOT NULL DEFAULT 'v1.0',
    "modelType" TEXT NOT NULL DEFAULT 'gradient_boost',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignFeedbackRecord" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "predictedEngagement" DOUBLE PRECISION,
    "predictedROI" DOUBLE PRECISION,
    "predictedReach" INTEGER,
    "actualEngagement" DOUBLE PRECISION,
    "actualROI" DOUBLE PRECISION,
    "actualReach" INTEGER,
    "actualConversions" INTEGER,
    "creatorMetrics" JSONB NOT NULL,
    "brandCategory" "Category" NOT NULL,
    "contentFormat" "PromotionType" NOT NULL,
    "campaignDuration" INTEGER,
    "agreedAmount" DOUBLE PRECISION,
    "engagementError" DOUBLE PRECISION,
    "roiError" DOUBLE PRECISION,
    "modelVersion" TEXT NOT NULL DEFAULT 'v1.0',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignFeedbackRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FraudSignal" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "signalType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "confidence" DOUBLE PRECISION NOT NULL,
    "evidence" JSONB NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FraudSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceProfile" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "demographics" JSONB NOT NULL,
    "interests" JSONB NOT NULL,
    "brandFitScores" JSONB NOT NULL,
    "authenticity" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "activeRatio" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "dataSource" TEXT NOT NULL DEFAULT 'inferred',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudienceProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringWeightConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weights" JSONB NOT NULL,
    "campaignsUsed" INTEGER NOT NULL DEFAULT 0,
    "avgSuccessRate" DOUBLE PRECISION,
    "optimizedFrom" TEXT,
    "optimizationLog" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoringWeightConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MLModelVersion" (
    "id" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "hyperparameters" JSONB,
    "metrics" JSONB NOT NULL,
    "trainingDataSize" INTEGER NOT NULL DEFAULT 0,
    "trainingDuration" DOUBLE PRECISION,
    "trainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isProduction" BOOLEAN NOT NULL DEFAULT false,
    "deployedAt" TIMESTAMP(3),
    "previousVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MLModelVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeightOptimizationRun" (
    "id" TEXT NOT NULL,
    "previousWeights" JSONB NOT NULL,
    "newWeights" JSONB NOT NULL,
    "trigger" TEXT NOT NULL,
    "beforeMetrics" JSONB NOT NULL,
    "afterMetrics" JSONB,
    "campaignsSampled" INTEGER NOT NULL,
    "improvement" DOUBLE PRECISION,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "appliedAt" TIMESTAMP(3),
    "rolledBack" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeightOptimizationRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FrictionEvent_type_idx" ON "FrictionEvent"("type");

-- CreateIndex
CREATE INDEX "FrictionEvent_createdAt_idx" ON "FrictionEvent"("createdAt");

-- CreateIndex
CREATE INDEX "FrictionEvent_userId_idx" ON "FrictionEvent"("userId");

-- CreateIndex
CREATE INDEX "Embedding_entityType_idx" ON "Embedding"("entityType");

-- CreateIndex
CREATE INDEX "Embedding_entityId_idx" ON "Embedding"("entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Embedding_entityType_entityId_key" ON "Embedding"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "CreatorQualityIndex_score_idx" ON "CreatorQualityIndex"("score");

-- CreateIndex
CREATE INDEX "CreatorQualityIndex_fraudRiskScore_idx" ON "CreatorQualityIndex"("fraudRiskScore");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorQualityIndex_creatorId_key" ON "CreatorQualityIndex"("creatorId");

-- CreateIndex
CREATE INDEX "CQISnapshot_cqiId_createdAt_idx" ON "CQISnapshot"("cqiId", "createdAt");

-- CreateIndex
CREATE INDEX "CampaignPrediction_campaignId_idx" ON "CampaignPrediction"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignPrediction_creatorId_idx" ON "CampaignPrediction"("creatorId");

-- CreateIndex
CREATE INDEX "CampaignPrediction_modelVersion_idx" ON "CampaignPrediction"("modelVersion");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignPrediction_campaignId_creatorId_key" ON "CampaignPrediction"("campaignId", "creatorId");

-- CreateIndex
CREATE INDEX "CampaignFeedbackRecord_brandCategory_idx" ON "CampaignFeedbackRecord"("brandCategory");

-- CreateIndex
CREATE INDEX "CampaignFeedbackRecord_status_idx" ON "CampaignFeedbackRecord"("status");

-- CreateIndex
CREATE INDEX "CampaignFeedbackRecord_modelVersion_idx" ON "CampaignFeedbackRecord"("modelVersion");

-- CreateIndex
CREATE INDEX "CampaignFeedbackRecord_createdAt_idx" ON "CampaignFeedbackRecord"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignFeedbackRecord_campaignId_creatorId_key" ON "CampaignFeedbackRecord"("campaignId", "creatorId");

-- CreateIndex
CREATE INDEX "FraudSignal_creatorId_idx" ON "FraudSignal"("creatorId");

-- CreateIndex
CREATE INDEX "FraudSignal_signalType_idx" ON "FraudSignal"("signalType");

-- CreateIndex
CREATE INDEX "FraudSignal_severity_idx" ON "FraudSignal"("severity");

-- CreateIndex
CREATE INDEX "FraudSignal_createdAt_idx" ON "FraudSignal"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AudienceProfile_creatorId_key" ON "AudienceProfile"("creatorId");

-- CreateIndex
CREATE INDEX "AudienceProfile_authenticity_idx" ON "AudienceProfile"("authenticity");

-- CreateIndex
CREATE UNIQUE INDEX "ScoringWeightConfig_name_key" ON "ScoringWeightConfig"("name");

-- CreateIndex
CREATE INDEX "MLModelVersion_modelName_isProduction_idx" ON "MLModelVersion"("modelName", "isProduction");

-- CreateIndex
CREATE UNIQUE INDEX "MLModelVersion_modelName_version_key" ON "MLModelVersion"("modelName", "version");

-- CreateIndex
CREATE INDEX "WeightOptimizationRun_createdAt_idx" ON "WeightOptimizationRun"("createdAt");

-- AddForeignKey
ALTER TABLE "CreatorQualityIndex" ADD CONSTRAINT "CreatorQualityIndex_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CQISnapshot" ADD CONSTRAINT "CQISnapshot_cqiId_fkey" FOREIGN KEY ("cqiId") REFERENCES "CreatorQualityIndex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignPrediction" ADD CONSTRAINT "CampaignPrediction_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "PromotionRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignFeedbackRecord" ADD CONSTRAINT "CampaignFeedbackRecord_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "PromotionRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceProfile" ADD CONSTRAINT "AudienceProfile_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
