-- CreateTable
CREATE TABLE "BazaarLog" (
    "timestamp" INT8 NOT NULL,
    "item_ids" STRING[],
    "sell_prices" DECIMAL(65,30)[],
    "buy_prices" DECIMAL(65,30)[],
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
    "lowest_bids" DECIMAL(65,30)[],
    "item_counts" INT4[],

    CONSTRAINT "AuctionsLog_pkey" PRIMARY KEY ("timestamp")
);

-- CreateTable
CREATE TABLE "EndedAuctionsLog" (
    "timestamp" INT8 NOT NULL,
    "total_items" INT4 NOT NULL,
    "item_ids" STRING[],
    "bid_prices" DECIMAL(65,30)[],
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
