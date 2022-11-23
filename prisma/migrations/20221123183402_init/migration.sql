-- CreateTable
CREATE TABLE "BazaarLog" (
    "timestamp" INT8 NOT NULL,
    "item_ids" STRING[],
    "sell_prices" FLOAT8[],
    "buy_prices" FLOAT8[],
    "sell_moving_weeks" INT4[],
    "buy_moving_weeks" INT4[],

    CONSTRAINT "BazaarLog_pkey" PRIMARY KEY ("timestamp")
);

-- CreateTable
CREATE TABLE "AuctionsLog" (
    "timestamp" INT8 NOT NULL,
    "total_pages" INT4 NOT NULL,
    "total_items" INT4 NOT NULL,
    "item_ids" STRING[],
    "lowest_bids" FLOAT8[],
    "item_counts" INT4[],

    CONSTRAINT "AuctionsLog_pkey" PRIMARY KEY ("timestamp")
);

-- CreateTable
CREATE TABLE "EndedAuctionsLog" (
    "timestamp" INT8 NOT NULL,
    "total_items" INT4 NOT NULL,
    "item_ids" STRING[],
    "bid_prices" FLOAT8[],
    "is_bin" BOOL[],

    CONSTRAINT "EndedAuctionsLog_pkey" PRIMARY KEY ("timestamp")
);

-- CreateTable
CREATE TABLE "PlayersLog" (
    "timestamp" INT8 NOT NULL,
    "player_count" INT4 NOT NULL,
    "games" JSONB NOT NULL,

    CONSTRAINT "PlayersLog_pkey" PRIMARY KEY ("timestamp")
);
