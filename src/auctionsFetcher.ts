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
        loggingLevel: 1,
        offset: DateWrapper.createOffset({ sec: 15 }),
    });
    fetcher.addAggregator({
        runFunction: aggregateAuctionsHourly,
        interval: DateWrapper.hourToMs,
        loggingLevel: 2,
        offset: DateWrapper.createOffset({ min: 1 }),
    });
    fetcher.addDeleter({
        runFunction: cleanAuctions,
        interval: DateWrapper.hourToMs,
        loggingLevel: 2,
        offset: DateWrapper.createOffset({ sec: 0 }),
    });
    fetcher.addAggregator({
        runFunction: aggregateAuctionsDaily,
        interval: DateWrapper.dayToMs,
        loggingLevel: 2,
        offset: DateWrapper.createOffset({ min: 2 }),
    });
    return fetcher;
}

export async function fetchAuctions(date: Date) {
    const newDate = date;
    const data = await getAuctions();

    const { count } = await prisma.binAuctionsItemLog.createMany({
        data: data.auctions.map((x) => ({
            logRange: "fiveMinutes",
            itemId: x.itemId,
            lastUpdated: newDate,
            lowestBin: x.lowestBin,
            lowestBinAvg: x.lowestBinAvg,
            count: x.count,
        })),
    });
    return count;
}

async function cleanAuctions(date: Date) {
    const newDate = DateWrapper.modifyDate(
        date,
        DateWrapper.createOffset({ day: -2 })
    );
    const { count } = await prisma.binAuctionsItemLog.deleteMany({
        where: {
            lastUpdated: {
                lt: newDate,
            },
            logRange: "fiveMinutes",
        },
    });
    return count;
}

async function aggregateAuctionsHourly(date: Date) {
    const newDate = DateWrapper.modifyDate(
        date,
        DateWrapper.createOffset({ hour: -1 })
    );
    const data = await prisma.binAuctionsItemLog.groupBy({
        by: ["itemId"],
        where: {
            lastUpdated: {
                gte: newDate,
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
            lastUpdated: newDate,
            lowestBin: x._avg.lowestBin,
            lowestBinAvg: x._avg.lowestBinAvg,
            count: x._avg.count,
        })),
    });
    return count;
}

async function aggregateAuctionsDaily(date: Date) {
    const newDate = DateWrapper.modifyDate(
        date,
        DateWrapper.createOffset({ day: -1 })
    );
    const data = await prisma.binAuctionsItemLog.groupBy({
        by: ["itemId"],
        where: {
            lastUpdated: {
                gte: newDate,
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
            lastUpdated: newDate,
            lowestBin: x._avg.lowestBin,
            lowestBinAvg: x._avg.lowestBinAvg,
            count: x._avg.count,
        })),
    });
    return count;
}
