-- CreateTable
CREATE TABLE "Collaboration" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "deliverables" TEXT[],
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "milestones" JSONB,
    "termsAccepted" BOOLEAN NOT NULL DEFAULT true,
    "sellerFeedback" JSONB,
    "creatorFeedback" JSONB,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collaboration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Collaboration_matchId_key" ON "Collaboration"("matchId");

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "MatchedCreator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
