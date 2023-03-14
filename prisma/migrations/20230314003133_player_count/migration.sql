/*
  Warnings:

  - A unique constraint covering the columns `[gameId,lastUpdated,logRange]` on the table `PlayerCountLog` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PlayerCountLog_gameId_lastUpdated_key";

-- CreateIndex
CREATE UNIQUE INDEX "PlayerCountLog_gameId_lastUpdated_logRange_key" ON "PlayerCountLog"("gameId", "lastUpdated", "logRange");
