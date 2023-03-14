/*
  Warnings:

  - A unique constraint covering the columns `[HourAuctionsItemId]` on the table `BinAuctionsItemLog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[DayAuctionsItemId]` on the table `BinAuctionsItemLog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[WeekAuctionsItemId]` on the table `BinAuctionsItemLog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[RecentAuctionsItemId]` on the table `BinAuctionsItemLog` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "BinAuctionsItemLog" ADD COLUMN     "ArchiveAuctionsItemId" TEXT,
ADD COLUMN     "DayAuctionsItemId" TEXT,
ADD COLUMN     "HourAuctionsItemId" TEXT,
ADD COLUMN     "RecentAuctionsItemId" TEXT,
ADD COLUMN     "WeekAuctionsItemId" TEXT;

-- CreateTable
CREATE TABLE "AuctionsItem" (
    "logId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "AuctionsItem_pkey" PRIMARY KEY ("logId")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuctionsItem_itemId_key" ON "AuctionsItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "BinAuctionsItemLog_HourAuctionsItemId_key" ON "BinAuctionsItemLog"("HourAuctionsItemId");

-- CreateIndex
CREATE UNIQUE INDEX "BinAuctionsItemLog_DayAuctionsItemId_key" ON "BinAuctionsItemLog"("DayAuctionsItemId");

-- CreateIndex
CREATE UNIQUE INDEX "BinAuctionsItemLog_WeekAuctionsItemId_key" ON "BinAuctionsItemLog"("WeekAuctionsItemId");

-- CreateIndex
CREATE UNIQUE INDEX "BinAuctionsItemLog_RecentAuctionsItemId_key" ON "BinAuctionsItemLog"("RecentAuctionsItemId");

-- AddForeignKey
ALTER TABLE "BinAuctionsItemLog" ADD CONSTRAINT "BinAuctionsItemLog_HourAuctionsItemId_fkey" FOREIGN KEY ("HourAuctionsItemId") REFERENCES "AuctionsItem"("itemId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BinAuctionsItemLog" ADD CONSTRAINT "BinAuctionsItemLog_DayAuctionsItemId_fkey" FOREIGN KEY ("DayAuctionsItemId") REFERENCES "AuctionsItem"("itemId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BinAuctionsItemLog" ADD CONSTRAINT "BinAuctionsItemLog_WeekAuctionsItemId_fkey" FOREIGN KEY ("WeekAuctionsItemId") REFERENCES "AuctionsItem"("itemId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BinAuctionsItemLog" ADD CONSTRAINT "BinAuctionsItemLog_RecentAuctionsItemId_fkey" FOREIGN KEY ("RecentAuctionsItemId") REFERENCES "AuctionsItem"("itemId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BinAuctionsItemLog" ADD CONSTRAINT "BinAuctionsItemLog_ArchiveAuctionsItemId_fkey" FOREIGN KEY ("ArchiveAuctionsItemId") REFERENCES "AuctionsItem"("itemId") ON DELETE SET NULL ON UPDATE CASCADE;
