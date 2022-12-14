-- CreateTable
CREATE TABLE "BinAuctionsItemLog" (
    "logId" TEXT NOT NULL,
    "logRange" "AggregationRange" NOT NULL,
    "itemId" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "lowestBin" DOUBLE PRECISION NOT NULL,
    "lowestBinAvg" DOUBLE PRECISION NOT NULL,
    "count" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BinAuctionsItemLog_pkey" PRIMARY KEY ("logId")
);

-- CreateIndex
CREATE UNIQUE INDEX "BinAuctionsItemLog_itemId_lastUpdated_logRange_key" ON "BinAuctionsItemLog"("itemId", "lastUpdated", "logRange");
