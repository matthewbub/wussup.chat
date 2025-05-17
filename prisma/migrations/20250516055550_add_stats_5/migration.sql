/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Stats` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Stats_userId_key" ON "Stats"("userId");
