/*
  Warnings:

  - You are about to drop the column `totalMessages` on the `Stats` table. All the data in the column will be lost.
  - You are about to drop the column `totalTokens` on the `Stats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stats" DROP COLUMN "totalMessages",
DROP COLUMN "totalTokens",
ADD COLUMN     "messageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
