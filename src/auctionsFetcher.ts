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
            DateWrapper.secToMs * 0,
    });
    customCollectors["Auctions Collector"] = collector;

    const aggregatorHourly = createClockTimeoutWrapper({
        collectorWrapper: aggregateAuctionsHourly,
        interval: DateWrapper.hourToMs,
        name: "Auctions Aggregator Hourly",
        startTime:
            DateWrapper.floorUTCHours().valueOf() + DateWrapper.secToMs * 15,
    });
    customCollectors["Auctions Aggregator Hourly"] = aggregatorHourly;

    const cleaner = createClockTimeoutWrapper({
        collectorWrapper: cleanAuctions,
        interval: DateWrapper.hourToMs,
        name: "Auctions Cleaner",
        startTime:
            DateWrapper.floorUTCDays().valueOf() + DateWrapper.secToMs * 30,
    });
    customCollectors["Auctions Cleaner"] = cleaner;

    const aggregatorDaily = createClockTimeoutWrapper({
        collectorWrapper: aggregateAuctionsDaily,
        interval: DateWrapper.dayToMs,
        name: "Auctions Aggregator Daily",
        startTime:
            DateWrapper.floorUTCDays().valueOf() + DateWrapper.secToMs * 45,
    });
    customCollectors["Auctions Aggregator Daily"] = aggregatorDaily;
}

export async function fetchAuctions() {
    const data = await getAuctions();
    const lastUpdated = DateWrapper.floorUTCMinutes(new Date(data.lastUpdated));

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
    console.log("Added", count, "Auctions Items");
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
    console.log("Deleted", count, "Auctions Items");
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
        _min: {
            lastUpdated: true,
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
            lastUpdated: x._min.lastUpdated,
            lowestBin: x._avg.lowestBin,
            lowestBinAvg: x._avg.lowestBinAvg,
            count: x._avg.count,
        })),
    });
    console.log("Aggregated", count, "Auctions Items");
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
        _min: {
            lastUpdated: true,
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
            lastUpdated: x._min.lastUpdated,
            lowestBin: x._avg.lowestBin,
            lowestBinAvg: x._avg.lowestBinAvg,
            count: x._avg.count,
        })),
    });
    console.log("Aggregated", count, "Auctions Items");
}
