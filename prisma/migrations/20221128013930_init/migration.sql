-- CreateTable
CREATE TABLE "BazaarTimeLog" (
    "lastUpdated" INT8 NOT NULL,
    "totalSellVolume" INT4 NOT NULL,
    "totalBuyVolume" INT4 NOT NULL,
    "totalSellOrders" INT4 NOT NULL,
    "totalBuyOrders" INT4 NOT NULL,
    "itemIds" STRING[],
    "sellPrice" FLOAT8[],
    "buyPrice" FLOAT8[],
    "sellPriceAvg" FLOAT8[],
    "buyPriceAvg" FLOAT8[],
    "sellMovingWeek" INT4[],
    "buyMovingWeek" INT4[],
    "sellVolume" INT4[],
    "buyVolume" INT4[],
    "sellOrders" INT4[],
    "buyOrders" INT4[],

    CONSTRAINT "BazaarTimeLog_pkey" PRIMARY KEY ("lastUpdated")
);

-- CreateTable
CREATE TABLE "AuctionsTimeLog" (
    "lastUpdated" INT8 NOT NULL,
    "totalAuctions" INT4 NOT NULL,
    "totalBinAuctions" INT4 NOT NULL,
    "totalPages" INT4 NOT NULL,
    "itemIds" STRING[],
    "prices" FLOAT8[],
    "amounts" INT4[],

    CONSTRAINT "AuctionsTimeLog_pkey" PRIMARY KEY ("lastUpdated")
);

-- CreateTable
CREATE TABLE "EndedAuctionsTimeLog" (
    "lastUpdated" INT8 NOT NULL,
    "totalAuctions" INT4 NOT NULL,
    "itemIds" STRING[],
    "prices" FLOAT8[],
    "isBin" BOOL[],

    CONSTRAINT "EndedAuctionsTimeLog_pkey" PRIMARY KEY ("lastUpdated")
);

-- CreateTable
CREATE TABLE "PlayersTimeLog" (
    "lastUpdated" INT8 NOT NULL,
    "playerCount" INT4 NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "PlayersTimeLog_pkey" PRIMARY KEY ("lastUpdated")
);

-- CreateTable
CREATE TABLE "BoostersTimeLog" (
    "lastUpdated" INT8 NOT NULL,
    "isDecrementing" BOOL NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "BoostersTimeLog_pkey" PRIMARY KEY ("lastUpdated")
);

-- CreateTable
CREATE TABLE "LeaderboardsTimeLog" (
    "lastUpdated" INT8 NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "LeaderboardsTimeLog_pkey" PRIMARY KEY ("lastUpdated")
);

-- CreateTable
CREATE TABLE "WatchdogTimeLog" (
    "lastUpdated" INT8 NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "WatchdogTimeLog_pkey" PRIMARY KEY ("lastUpdated")
);
