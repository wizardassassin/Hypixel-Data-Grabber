import { getAuctions, getEndedAuctions } from "./auctions";
import { getBazaar } from "./bazaar";
import prisma from "./database";
import { getBoosters, getLeaderboards, getPlayers, getWatchdog } from "./other";

export async function fetchBazaar() {
    const data = await getBazaar();

    // const obj = {};
    // for (const val of data.bazaarArr) {
    //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //     const { productID, ...tempval } = val;
    //     obj[val.productID] = tempval;
    // }

    await prisma.bazaarTimeLog.create({
        data: {
            lastUpdated: data.lastUpdated,
            totalSellVolume: data.totalSellVolume,
            totalBuyVolume: data.totalBuyVolume,
            totalSellOrders: data.totalSellOrders,
            totalBuyOrders: data.totalBuyOrders,
            // data: obj,
            itemIds: data.bazaarArr.map((x) => x.productID),
            sellPrice: data.bazaarArr.map((x) => x.sellPriceSum),
            buyPrice: data.bazaarArr.map((x) => x.buyPriceSum),
            sellPriceAvg: data.bazaarArr.map((x) => x.sellPrice),
            buyPriceAvg: data.bazaarArr.map((x) => x.buyPrice),
            sellMovingWeek: data.bazaarArr.map((x) => x.sellMovingWeek),
            buyMovingWeek: data.bazaarArr.map((x) => x.buyMovingWeek),
            sellVolume: data.bazaarArr.map((x) => x.sellVolume),
            buyVolume: data.bazaarArr.map((x) => x.buyVolume),
            sellOrders: data.bazaarArr.map((x) => x.sellOrders),
            buyOrders: data.bazaarArr.map((x) => x.buyOrders),
        },
    });
}

export async function fetchAuctions() {
    const data = await getAuctions();

    // const obj = {};
    // for (const val of data.auctions) {
    //     obj[val.id] = {
    //         count: val.count,
    //         bid: val.bid,
    //     };
    // }

    await prisma.auctionsTimeLog.create({
        data: {
            lastUpdated: data.lastUpdated,
            totalAuctions: data.totalItems,
            totalBinAuctions: data.totalBinItems,
            totalPages: data.totalPages,
            // data: obj,
            itemIds: data.auctions.map((x) => x.id),
            prices: data.auctions.map((x) => x.bid),
            amounts: data.auctions.map((x) => x.count),
        },
    });
}

export async function fetchEndedAuctions() {
    const data = await getEndedAuctions();

    // const obj = {};
    // for (const val of data.endedAuctions) {
    //     obj[val.id] = {
    //         bid: val.bid,
    //         count: val.bin,
    //     };
    // }

    await prisma.endedAuctionsTimeLog.create({
        data: {
            lastUpdated: data.lastUpdated,
            totalAuctions: data.totalItems,
            // data: obj,
            itemIds: data.endedAuctions.map((x) => x.id),
            prices: data.endedAuctions.map((x) => x.bid),
            isBin: data.endedAuctions.map((x) => x.bin),
        },
    });
}

export async function fetchPlayers() {
    const data = await getPlayers();

    await prisma.playersTimeLog.create({
        data: {
            lastUpdated: data.lastUpdated,
            playerCount: data.playerCount,
            data: data.games,
        },
    });
}

export async function fetchBoosters() {
    const data = await getBoosters();

    await prisma.boostersTimeLog.create({
        data: {
            lastUpdated: data.lastUpdated,
            isDecrementing: data.isDecrementing,
            data: data.boosters,
        },
    });
}

export async function fetchLeaderboards() {
    const data = await getLeaderboards();

    await prisma.leaderboardsTimeLog.create({
        data: {
            lastUpdated: data.lastUpdated,
            data: data.leaderboards,
        },
    });
}

export async function fetchWatchdog() {
    const data = await getWatchdog();

    await prisma.watchdogTimeLog.create({
        data: {
            lastUpdated: data.lastUpdated,
            data: data.watchdog,
        },
    });
}
