-- CreateTable
CREATE TABLE "Game" (
    "logId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gameId" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "isGamemode" BOOLEAN NOT NULL,
    "GameLogId" TEXT,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("logId")
);

-- CreateTable
CREATE TABLE "PlayerCountLog" (
    "logId" TEXT NOT NULL,
    "logRange" "AggregationRange" NOT NULL,
    "gameId" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "playerCount" DOUBLE PRECISION NOT NULL,
    "ArchiveGameLogId" TEXT,
    "RecentGameLogId" TEXT,

    CONSTRAINT "PlayerCountLog_pkey" PRIMARY KEY ("logId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_gameId_key" ON "Game"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerCountLog_RecentGameLogId_key" ON "PlayerCountLog"("RecentGameLogId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerCountLog_gameId_lastUpdated_key" ON "PlayerCountLog"("gameId", "lastUpdated");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_GameLogId_fkey" FOREIGN KEY ("GameLogId") REFERENCES "Game"("logId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerCountLog" ADD CONSTRAINT "PlayerCountLog_ArchiveGameLogId_fkey" FOREIGN KEY ("ArchiveGameLogId") REFERENCES "Game"("gameId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerCountLog" ADD CONSTRAINT "PlayerCountLog_RecentGameLogId_fkey" FOREIGN KEY ("RecentGameLogId") REFERENCES "Game"("gameId") ON DELETE SET NULL ON UPDATE CASCADE;
