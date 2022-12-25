import { getAuctions } from "./auctions.js";
import { createClockTimeoutWrapper } from "./collectorCreators.js";
import { customCollectors } from "./collectors.js";
import prisma from "./database.js";
import { DateWrapper } from "./dateWrapper.js";

export function importAuctionsCollectors() {
    const collector = createClockTimeoutWrapper({
        collectorWrapper: fetchAuctions,
        interval: DateWrapper.minToMs * 5,
        name: "Auctions Collector",
        startTime:
            DateWrapper.floorUTCFiveMinutes().valueOf() +
            DateWrapper.minToMs * 0 +
            DateWrapper.secToMs * 0,
    });
    customCollectors["Auctions Collector"] = collector;

    const aggregatorHourly = createClockTimeoutWrapper({
        collectorWrapper: aggregateAuctionsHourly,
        interval: DateWrapper.hourToMs,
        name: "Auctions Aggregator Hourly",
        loggingLevel: 2,
        startTime:
            DateWrapper.floorUTCHours().valueOf() +
            DateWrapper.minToMs * 1 +
            DateWrapper.secToMs * 15,
    });
    customCollectors["Auctions Aggregator Hourly"] = aggregatorHourly;

    const cleaner = createClockTimeoutWrapper({
        collectorWrapper: cleanAuctions,
        interval: DateWrapper.hourToMs,
        name: "Auctions Cleaner",
        loggingLevel: 2,
        startTime:
            DateWrapper.floorUTCDays().valueOf() +
            DateWrapper.minToMs * 0 +
            DateWrapper.secToMs * 30,
    });
    customCollectors["Auctions Cleaner"] = cleaner;

    const aggregatorDaily = createClockTimeoutWrapper({
        collectorWrapper: aggregateAuctionsDaily,
        interval: DateWrapper.dayToMs,
        name: "Auctions Aggregator Daily",
        loggingLevel: 2,
        startTime:
            DateWrapper.floorUTCDays().valueOf() +
            DateWrapper.minToMs * 2 +
            DateWrapper.secToMs * 45,
    });
    customCollectors["Auctions Aggregator Daily"] = aggregatorDaily;
}

export async function fetchAuctions() {
    const lastUpdated = DateWrapper.floorUTCMinutes(new Date());
    const data = await getAuctions();

    const { count } = await prisma.binAuctionsItemLog.createMany({
        data: data.auctions.map((x) => ({
            logRange: "fiveMinutes",
            itemId: x.itemId,
            lastUpdated: lastUpdated,
            lowestBin: x.lowestBin,
            lowestBinAvg: x.lowestBinAvg,
            count: x.count,
        })),
    });
    this.log?.(() => console.log("Added", count, "Auctions Items"), 2);
}

async function cleanAuctions() {
    const floorDate = DateWrapper.floorUTCHours();
    floorDate.setUTCHours(floorDate.getUTCHours() - 24 * 2);
    const { count } = await prisma.binAuctionsItemLog.deleteMany({
        where: {
            lastUpdated: {
                lt: floorDate,
            },
            logRange: "fiveMinutes",
        },
    });
    this.log?.(() => console.log("Deleted", count, "Auctions Items"), 2);
}

async function aggregateAuctionsHourly() {
    const floorDate = DateWrapper.floorUTCHours();
    floorDate.setUTCHours(floorDate.getUTCHours() - 1);
    const data = await prisma.binAuctionsItemLog.groupBy({
        by: ["itemId"],
        where: {
            lastUpdated: {
                gte: floorDate,
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
        console.error("Can't find any Auctions items to aggregate.");
        return;
    }
    const { count } = await prisma.binAuctionsItemLog.createMany({
        data: data.map((x) => ({
            itemId: x.itemId,
            logRange: "oneHour",
            lastUpdated: floorDate,
            lowestBin: x._avg.lowestBin,
            lowestBinAvg: x._avg.lowestBinAvg,
            count: x._avg.count,
        })),
    });
    this.log?.(() => console.log("Aggregated", count, "Auctions Items"), 2);
}

async function aggregateAuctionsDaily() {
    const floorDate = DateWrapper.floorUTCHours();
    floorDate.setUTCHours(floorDate.getUTCHours() - 1);
    const data = await prisma.binAuctionsItemLog.groupBy({
        by: ["itemId"],
        where: {
            lastUpdated: {
                gte: floorDate,
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
        console.error("Can't find any Auctions items to aggregate.");
        return;
    }
    const { count } = await prisma.binAuctionsItemLog.createMany({
        data: data.map((x) => ({
            itemId: x.itemId,
            logRange: "oneDay",
            lastUpdated: floorDate,
            lowestBin: x._avg.lowestBin,
            lowestBinAvg: x._avg.lowestBinAvg,
            count: x._avg.count,
        })),
    });
    this.log?.(() => console.log("Aggregated", count, "Auctions Items"), 2);
}
