import { getAuctions } from "./auctions.js";
import prisma from "./database.js";
import { DateWrapper } from "./dateWrapper.js";
import { FetcherWrapper } from "./fetcherWrapper.js";

export function auctionsFetcher() {
    const fetcher = new FetcherWrapper({
        name: "Auctions",
        countType: "Item(s)",
    });
    fetcher.addCollector({
        runFunction: fetchAuctions,
        interval: DateWrapper.minToMs * 5,
        dateOffset: DateWrapper.createOffset({ sec: 0 }),
        startOffset: DateWrapper.createOffset({ sec: 15 }),
        loggingLevel: 1,
    });
    fetcher.addAggregator({
        runFunction: aggregateAuctionsHourly,
        interval: DateWrapper.hourToMs,
        dateOffset: DateWrapper.createOffset({ hour: -1 }),
        startOffset: DateWrapper.createOffset({ min: 1 }),
        loggingLevel: 2,
    });
    fetcher.addDeleter({
        runFunction: cleanAuctions,
        interval: DateWrapper.hourToMs,
        dateOffset: DateWrapper.createOffset({ day: -2 }),
        startOffset: DateWrapper.createOffset({ sec: 0 }),
        loggingLevel: 2,
    });
    fetcher.addAggregator({
        runFunction: aggregateAuctionsDaily,
        interval: DateWrapper.dayToMs,
        dateOffset: DateWrapper.createOffset({ day: -1 }),
        startOffset: DateWrapper.createOffset({ min: 2 }),
        loggingLevel: 2,
    });
    return fetcher;
}

export async function fetchAuctions(date: Date) {
    const data = await getAuctions();

    const { count } = await prisma.binAuctionsItemLog.createMany({
        data: data.auctions.map((x) => ({
            logRange: "fiveMinutes",
            itemId: x.itemId,
            lastUpdated: date,
            lowestBin: x.lowestBin,
            lowestBinAvg: x.lowestBinAvg,
            count: x.count,
        })),
    });
    return count;
}

async function cleanAuctions(date: Date) {
    const { count } = await prisma.binAuctionsItemLog.deleteMany({
        where: {
            lastUpdated: {
                lt: date,
            },
            logRange: "fiveMinutes",
        },
    });
    return count;
}

async function aggregateAuctionsHourly(date: Date) {
    const data = await prisma.binAuctionsItemLog.groupBy({
        by: ["itemId"],
        where: {
            lastUpdated: {
                gte: date,
            },
            logRange: "fiveMinutes",
        },
        _avg: {
            lowestBin: true,
            lowestBinAvg: true,
            count: true,
        },
    });
    if (data.length === 0) {
        return 0;
    }
    const { count } = await prisma.binAuctionsItemLog.createMany({
        data: data.map((x) => ({
            itemId: x.itemId,
            logRange: "oneHour",
            lastUpdated: date,
            lowestBin: x._avg.lowestBin,
            lowestBinAvg: x._avg.lowestBinAvg,
            count: x._avg.count,
        })),
    });
    return count;
}

async function aggregateAuctionsDaily(date: Date) {
    const data = await prisma.binAuctionsItemLog.groupBy({
        by: ["itemId"],
        where: {
            lastUpdated: {
                gte: date,
            },
            logRange: "oneHour",
        },
        _avg: {
            lowestBin: true,
            lowestBinAvg: true,
            count: true,
        },
    });
    if (data.length === 0) {
        return 0;
    }
    const { count } = await prisma.binAuctionsItemLog.createMany({
        data: data.map((x) => ({
            itemId: x.itemId,
            logRange: "oneDay",
            lastUpdated: date,
            lowestBin: x._avg.lowestBin,
            lowestBinAvg: x._avg.lowestBinAvg,
            count: x._avg.count,
        })),
    });
    return count;
}
