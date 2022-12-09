-- CreateEnum
CREATE TYPE "AggregationRange" AS ENUM ('oneMinute', 'fiveMinutes', 'oneHour', 'oneDay');

-- CreateTable
CREATE TABLE "BazaarItemLog" (
    "logId" TEXT NOT NULL,
    "logRange" "AggregationRange" NOT NULL,
    "productId" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "sellPriceSum" DOUBLE PRECISION NOT NULL,
    "buyPriceSum" DOUBLE PRECISION NOT NULL,
    "sellPrice" DOUBLE PRECISION NOT NULL,
    "buyPrice" DOUBLE PRECISION NOT NULL,
    "sellMovingWeek" DOUBLE PRECISION NOT NULL,
    "buyMovingWeek" DOUBLE PRECISION NOT NULL,
    "sellVolume" DOUBLE PRECISION NOT NULL,
    "buyVolume" DOUBLE PRECISION NOT NULL,
    "sellOrders" DOUBLE PRECISION NOT NULL,
    "buyOrders" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BazaarItemLog_pkey" PRIMARY KEY ("logId")
);

-- CreateIndex
CREATE UNIQUE INDEX "BazaarItemLog_productId_lastUpdated_logRange_key" ON "BazaarItemLog"("productId", "lastUpdated", "logRange");
