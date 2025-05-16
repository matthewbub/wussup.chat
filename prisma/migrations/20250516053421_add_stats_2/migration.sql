/*
  Warnings:

  - You are about to drop the column `totalChats` on the `Stats` table. All the data in the column will be lost.
  - You are about to drop the column `totalUsers` on the `Stats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stats" DROP COLUMN "totalChats",
DROP COLUMN "totalUsers";
