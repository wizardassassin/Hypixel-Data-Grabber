import { getBazaar } from "./bazaar.js";
import { createClockTimeoutWrapper } from "./collectorCreators.js";
import { customCollectors } from "./collectors.js";
import prisma from "./database.js";
import { DateWrapper } from "./dateWrapper.js";

export function importBazaarCollectors() {
    const collector = createClockTimeoutWrapper({
        collectorWrapper: fetchBazaar,
        interval: DateWrapper.minToMs,
        name: "Bazaar Collector",
        startTime:
            DateWrapper.floorUTCMinutes().valueOf() +
            DateWrapper.minToMs * 0 +
            DateWrapper.secToMs * 0,
    });
    customCollectors["Bazaar Collector"] = collector;

    const aggregatorHourly = createClockTimeoutWrapper({
        collectorWrapper: aggregateBazaarHourly,
        interval: DateWrapper.hourToMs,
        name: "Bazaar Aggregator Hourly",
        loggingLevel: 2,
        startTime:
            DateWrapper.floorUTCHours().valueOf() +
            DateWrapper.minToMs * 1 +
            DateWrapper.secToMs * 15,
    });
    customCollectors["Bazaar Aggregator Hourly"] = aggregatorHourly;

    const cleaner = createClockTimeoutWrapper({
        collectorWrapper: cleanBazaar,
        interval: DateWrapper.hourToMs,
        name: "Bazaar Cleaner",
        loggingLevel: 2,
        startTime:
            DateWrapper.floorUTCDays().valueOf() +
            DateWrapper.minToMs * 0 +
            DateWrapper.secToMs * 30,
    });
    customCollectors["Bazaar Cleaner"] = cleaner;

    const aggregatorDaily = createClockTimeoutWrapper({
        collectorWrapper: aggregateBazaarDaily,
        interval: DateWrapper.dayToMs,
        name: "Bazaar Aggregator Daily",
        loggingLevel: 2,
        startTime:
            DateWrapper.floorUTCDays().valueOf() +
            DateWrapper.minToMs * 2 +
            DateWrapper.secToMs * 45,
    });
    customCollectors["Bazaar Aggregator Daily"] = aggregatorDaily;
}

async function fetchBazaar() {
    const lastUpdated = DateWrapper.roundUTCMinutes(new Date());
    const data = await getBazaar();

    const { count } = await prisma.bazaarItemLog.createMany({
        data: data.bazaarArr.map((x) => ({
            logRange: "oneMinute",
            productId: x.productId,
            lastUpdated: lastUpdated,
            sellPriceTop: x.sellPriceSum,
            buyPriceTop: x.buyPriceSum,
            sellPrice: x.sellPrice,
            buyPrice: x.buyPrice,
            sellMovingWeek: x.sellMovingWeek,
            buyMovingWeek: x.buyMovingWeek,
            sellVolume: x.sellVolume,
            buyVolume: x.buyVolume,
            sellOrders: x.sellOrders,
            buyOrders: x.buyOrders,
        })),
    });
    this.log?.(() => console.log("Added", count, "Bazaar Items"), 2);
}

async function cleanBazaar() {
    const floorDate = DateWrapper.floorUTCHours();
    floorDate.setUTCHours(floorDate.getUTCHours() - 24 * 2);
    const { count } = await prisma.bazaarItemLog.deleteMany({
        where: {
            lastUpdated: {
                lt: floorDate,
            },
            logRange: "oneMinute",
        },
    });
    this.log?.(() => console.log("Deleted", count, "Bazaar Items"), 2);
}

async function aggregateBazaarHourly() {
    const floorDate = DateWrapper.floorUTCHours();
    floorDate.setUTCHours(floorDate.getUTCHours() - 1);
    const data = await prisma.bazaarItemLog.groupBy({
        by: ["productId"],
        where: {
            lastUpdated: {
                gte: floorDate,
            },
            logRange: "oneMinute",
        },
        _avg: {
            sellPriceTop: true,
            buyPriceTop: true,
            sellPrice: true,
            buyPrice: true,
            sellMovingWeek: true,
            buyMovingWeek: true,
            sellVolume: true,
            buyVolume: true,
            sellOrders: true,
            buyOrders: true,
        },
    });
    if (data.length === 0) {
        console.error("Can't find anything Bazaar items to aggregate.");
        return;
    }
    const { count } = await prisma.bazaarItemLog.createMany({
        data: data.map((x) => ({
            productId: x.productId,
            logRange: "oneHour",
            lastUpdated: floorDate,
            sellPriceTop: x._avg.sellPriceTop,
            buyPriceTop: x._avg.buyPriceTop,
            sellPrice: x._avg.sellPrice,
            buyPrice: x._avg.buyPrice,
            sellMovingWeek: x._avg.sellMovingWeek,
            buyMovingWeek: x._avg.buyMovingWeek,
            sellVolume: x._avg.sellVolume,
            buyVolume: x._avg.buyVolume,
            sellOrders: x._avg.sellOrders,
            buyOrders: x._avg.buyOrders,
        })),
    });
    this.log?.(() => console.log("Aggregated", count, "Bazaar Items"), 2);
}

async function aggregateBazaarDaily() {
    const floorDate = DateWrapper.floorUTCDays();
    floorDate.setUTCHours(floorDate.getUTCHours() - 24);
    const data = await prisma.bazaarItemLog.groupBy({
        by: ["productId"],
        where: {
            lastUpdated: {
                gte: floorDate,
            },
            logRange: "oneHour",
        },
        _avg: {
            sellPriceTop: true,
            buyPriceTop: true,
            sellPrice: true,
            buyPrice: true,
            sellMovingWeek: true,
            buyMovingWeek: true,
            sellVolume: true,
            buyVolume: true,
            sellOrders: true,
            buyOrders: true,
        },
    });
    if (data.length === 0) {
        console.error("Can't find anything to aggregate.");
        return;
    }
    const { count } = await prisma.bazaarItemLog.createMany({
        data: data.map((x) => ({
            productId: x.productId,
            logRange: "oneDay",
            lastUpdated: floorDate,
            sellPriceTop: x._avg.sellPriceTop,
            buyPriceTop: x._avg.buyPriceTop,
            sellPrice: x._avg.sellPrice,
            buyPrice: x._avg.buyPrice,
            sellMovingWeek: x._avg.sellMovingWeek,
            buyMovingWeek: x._avg.buyMovingWeek,
            sellVolume: x._avg.sellVolume,
            buyVolume: x._avg.buyVolume,
            sellOrders: x._avg.sellOrders,
            buyOrders: x._avg.buyOrders,
        })),
    });
    this.log?.(() => console.log("Aggregated", count, "Bazaar Items"), 2);
}
