/*
  Warnings:

  - A unique constraint covering the columns `[HourBazaarProductId]` on the table `BazaarItemLog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[DayBazaarProductId]` on the table `BazaarItemLog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[WeekBazaarProductId]` on the table `BazaarItemLog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[RecentBazaarProductId]` on the table `BazaarItemLog` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "BazaarItemLog" ADD COLUMN     "ArchiveBazaarProductId" TEXT,
ADD COLUMN     "DayBazaarProductId" TEXT,
ADD COLUMN     "HourBazaarProductId" TEXT,
ADD COLUMN     "RecentBazaarProductId" TEXT,
ADD COLUMN     "WeekBazaarProductId" TEXT;

-- CreateTable
CREATE TABLE "BazaarItem" (
    "logId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "BazaarItem_pkey" PRIMARY KEY ("logId")
);

-- CreateIndex
CREATE UNIQUE INDEX "BazaarItem_productId_key" ON "BazaarItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "BazaarItemLog_HourBazaarProductId_key" ON "BazaarItemLog"("HourBazaarProductId");

-- CreateIndex
CREATE UNIQUE INDEX "BazaarItemLog_DayBazaarProductId_key" ON "BazaarItemLog"("DayBazaarProductId");

-- CreateIndex
CREATE UNIQUE INDEX "BazaarItemLog_WeekBazaarProductId_key" ON "BazaarItemLog"("WeekBazaarProductId");

-- CreateIndex
CREATE UNIQUE INDEX "BazaarItemLog_RecentBazaarProductId_key" ON "BazaarItemLog"("RecentBazaarProductId");

-- AddForeignKey
ALTER TABLE "BazaarItemLog" ADD CONSTRAINT "BazaarItemLog_HourBazaarProductId_fkey" FOREIGN KEY ("HourBazaarProductId") REFERENCES "BazaarItem"("productId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BazaarItemLog" ADD CONSTRAINT "BazaarItemLog_DayBazaarProductId_fkey" FOREIGN KEY ("DayBazaarProductId") REFERENCES "BazaarItem"("productId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BazaarItemLog" ADD CONSTRAINT "BazaarItemLog_WeekBazaarProductId_fkey" FOREIGN KEY ("WeekBazaarProductId") REFERENCES "BazaarItem"("productId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BazaarItemLog" ADD CONSTRAINT "BazaarItemLog_RecentBazaarProductId_fkey" FOREIGN KEY ("RecentBazaarProductId") REFERENCES "BazaarItem"("productId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BazaarItemLog" ADD CONSTRAINT "BazaarItemLog_ArchiveBazaarProductId_fkey" FOREIGN KEY ("ArchiveBazaarProductId") REFERENCES "BazaarItem"("productId") ON DELETE SET NULL ON UPDATE CASCADE;
