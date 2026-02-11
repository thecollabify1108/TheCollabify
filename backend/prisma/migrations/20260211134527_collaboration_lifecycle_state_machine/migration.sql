/*
  Warnings:

  - The `status` column on the `Collaboration` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CollaborationStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'IN_DISCUSSION', 'AGREED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Collaboration" ADD COLUMN     "statusHistory" JSONB,
ADD COLUMN     "statusUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "status",
ADD COLUMN     "status" "CollaborationStatus" NOT NULL DEFAULT 'REQUESTED';

-- CreateIndex
CREATE INDEX "Collaboration_status_idx" ON "Collaboration"("status");
