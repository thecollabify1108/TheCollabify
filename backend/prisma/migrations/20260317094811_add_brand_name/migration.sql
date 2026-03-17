/*
  Warnings:

  - Changed the column `promotionType` on the `PromotionRequest` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.
  - Changed the column `targetCategory` on the `PromotionRequest` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterTable
ALTER TABLE "PromotionRequest" ADD COLUMN     "brandName" TEXT,
ALTER COLUMN "promotionType" SET DATA TYPE "PromotionType"[],
ALTER COLUMN "targetCategory" SET DATA TYPE "Category"[];
