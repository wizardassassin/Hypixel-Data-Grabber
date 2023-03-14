/*
  Warnings:

  - A unique constraint covering the columns `[HourGameLogId]` on the table `PlayerCountLog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[DayGameLogId]` on the table `PlayerCountLog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[WeekGameLogId]` on the table `PlayerCountLog` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PlayerCountLog" ADD COLUMN     "DayGameLogId" TEXT,
ADD COLUMN     "HourGameLogId" TEXT,
ADD COLUMN     "WeekGameLogId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PlayerCountLog_HourGameLogId_key" ON "PlayerCountLog"("HourGameLogId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerCountLog_DayGameLogId_key" ON "PlayerCountLog"("DayGameLogId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerCountLog_WeekGameLogId_key" ON "PlayerCountLog"("WeekGameLogId");

-- AddForeignKey
ALTER TABLE "PlayerCountLog" ADD CONSTRAINT "PlayerCountLog_HourGameLogId_fkey" FOREIGN KEY ("HourGameLogId") REFERENCES "Game"("gameId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerCountLog" ADD CONSTRAINT "PlayerCountLog_DayGameLogId_fkey" FOREIGN KEY ("DayGameLogId") REFERENCES "Game"("gameId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerCountLog" ADD CONSTRAINT "PlayerCountLog_WeekGameLogId_fkey" FOREIGN KEY ("WeekGameLogId") REFERENCES "Game"("gameId") ON DELETE SET NULL ON UPDATE CASCADE;
