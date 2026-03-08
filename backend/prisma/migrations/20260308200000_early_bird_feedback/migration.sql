-- CreateTable: PlatformSetting
CREATE TABLE IF NOT EXISTS "PlatformSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PlatformSetting_key_key" ON "PlatformSetting"("key");
CREATE INDEX IF NOT EXISTS "PlatformSetting_key_idx" ON "PlatformSetting"("key");

-- Seed default EARLY_BIRD_MODE = true
INSERT INTO "PlatformSetting" ("id", "key", "value", "updatedAt")
VALUES (gen_random_uuid(), 'EARLY_BIRD_MODE', 'true', NOW())
ON CONFLICT ("key") DO NOTHING;

-- CreateTable: CollaborationFeedback
CREATE TABLE IF NOT EXISTS "CollaborationFeedback" (
    "id" TEXT NOT NULL,
    "collaborationId" TEXT NOT NULL,
    "submittedByUserId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "creatorProfessionalism" INTEGER,
    "campaignQuality" INTEGER,
    "overallBrandExperience" INTEGER,
    "brandCommunication" INTEGER,
    "campaignClarity" INTEGER,
    "overallCreatorExperience" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollaborationFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CollaborationFeedback_collaborationId_role_key" ON "CollaborationFeedback"("collaborationId", "role");
CREATE INDEX IF NOT EXISTS "CollaborationFeedback_collaborationId_idx" ON "CollaborationFeedback"("collaborationId");

-- AddForeignKey: CollaborationFeedback → Collaboration
ALTER TABLE "CollaborationFeedback" ADD CONSTRAINT "CollaborationFeedback_collaborationId_fkey"
    FOREIGN KEY ("collaborationId") REFERENCES "Collaboration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
