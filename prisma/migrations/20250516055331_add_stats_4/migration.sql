/*
  Warnings:

  - You are about to drop the column `messageCount` on the `Stats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stats" DROP COLUMN "messageCount",
ADD COLUMN     "dailyMessageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lifetimeMessageCount" INTEGER NOT NULL DEFAULT 0;
