import { getBazaar } from "./bazaar.js";
import { createClockTimeoutWrapper } from "./collectorCreators.js";
import { customCollectors } from "./collectors.js";
import prisma from "./database.js";
import { DateWrapper } from "./dateWrapper.js";

export function importBazaarCollectors() {
    const aggregatorHourly = createClockTimeoutWrapper(
        async () => await aggregateBazaarHourly(),
        DateWrapper.hourToMs,
        "Bazaar Aggregator Hourly",
        false,
        DateWrapper.floorUTCHours().valueOf() + DateWrapper.secToMs * 0
    );
    customCollectors["Bazaar Aggregator Hourly"] = aggregatorHourly;

    const aggregatorDaily = createClockTimeoutWrapper(
        async () => await aggregateBazaarDaily(),
        DateWrapper.dayToMs,
        "Bazaar Aggregator Daily",
        false,
        DateWrapper.floorUTCDays().valueOf() + DateWrapper.secToMs * 15
    );
    customCollectors["Bazaar Aggregator Daily"] = aggregatorDaily;

    const cleaner = createClockTimeoutWrapper(
        async () => await cleanBazaar(),
        DateWrapper.hourToMs,
        "Bazaar Cleaner",
        false,
        DateWrapper.floorUTCDays().valueOf() + DateWrapper.secToMs * 30
    );
    customCollectors["Bazaar Cleaner"] = cleaner;

    const collector = createClockTimeoutWrapper(
        async () => await fetchBazaar(),
        DateWrapper.minToMs,
        "Bazaar Collector",
        false,
        DateWrapper.floorUTCMinutes().valueOf() + DateWrapper.secToMs * 45
    );
    customCollectors["Bazaar Collector"] = collector;
}

async function fetchBazaar() {
    const data = await getBazaar();

    const { count } = await prisma.bazaarItemLog.createMany({
        data: data.bazaarArr.map((x) => ({
            logRange: "oneMinute",
            productId: x.productId,
            lastUpdated: new Date(data.lastUpdated),
            sellPriceSum: x.sellPriceSum,
            buyPriceSum: x.buyPriceSum,
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
    console.log("Added", count, "Items");
}

async function cleanBazaar() {
    const floorDate = DateWrapper.floorUTCHours();
    floorDate.setUTCHours(floorDate.getUTCHours() - 24 * 7);
    const { count } = await prisma.bazaarItemLog.deleteMany({
        where: {
            lastUpdated: {
                lt: floorDate,
            },
        },
    });
    console.log("Deleted", count, "Items");
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
            sellPriceSum: true,
            buyPriceSum: true,
            sellPrice: true,
            buyPrice: true,
            sellMovingWeek: true,
            buyMovingWeek: true,
            sellVolume: true,
            buyVolume: true,
            sellOrders: true,
            buyOrders: true,
        },
        _min: {
            lastUpdated: true,
        },
    });
    if (data.length === 0) {
        console.error("Can't find anything to aggregate.");
        return;
    }
    const { count } = await prisma.bazaarItemLog.createMany({
        data: data.map((x) => ({
            productId: x.productId,
            logRange: "oneHour",
            lastUpdated: x._min.lastUpdated,
            sellPriceSum: x._avg.sellPriceSum,
            buyPriceSum: x._avg.buyPriceSum,
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
    console.log("Aggregated", count, "Items");
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
            sellPriceSum: true,
            buyPriceSum: true,
            sellPrice: true,
            buyPrice: true,
            sellMovingWeek: true,
            buyMovingWeek: true,
            sellVolume: true,
            buyVolume: true,
            sellOrders: true,
            buyOrders: true,
        },
        _min: {
            lastUpdated: true,
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
            lastUpdated: x._min.lastUpdated,
            sellPriceSum: x._avg.sellPriceSum,
            buyPriceSum: x._avg.buyPriceSum,
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
    console.log("Aggregated", count, "Items");
}
