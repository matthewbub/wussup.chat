/*
  Warnings:

  - You are about to drop the column `monthlyMessageCount` on the `Stats` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyResetDate` on the `Stats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stats" DROP COLUMN "monthlyMessageCount",
DROP COLUMN "monthlyResetDate";
