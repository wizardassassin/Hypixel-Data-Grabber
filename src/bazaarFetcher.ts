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

    const collector = createClockTimeoutWrapper(
        async () => await fetchBazaar(),
        DateWrapper.minToMs,
        "Bazaar Collector",
        false,
        DateWrapper.floorUTCMinutes().valueOf() + DateWrapper.secToMs * 30
    );
    customCollectors["Bazaar Collector"] = collector;

    const cleaner = createClockTimeoutWrapper(
        async () => await cleanBazaar(),
        DateWrapper.hourToMs,
        "Bazaar Cleaner",
        false,
        DateWrapper.floorUTCDays().valueOf() + DateWrapper.secToMs * 45
    );
    customCollectors["Bazaar Cleaner"] = cleaner;
}

async function fetchBazaar() {
    const data = await getBazaar();
    const lastUpdated = DateWrapper.floorUTCMinutes(new Date(data.lastUpdated));

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
    console.log("Added", count, "Bazaar Items");
}

async function cleanBazaar() {
    const floorDate = DateWrapper.floorUTCHours();
    floorDate.setUTCHours(floorDate.getUTCHours() - 24 * 2);
    const { count } = await prisma.bazaarItemLog.deleteMany({
        where: {
            lastUpdated: {
                lt: floorDate,
            },
        },
    });
    console.log("Deleted", count, "Bazaar Items");
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
        _min: {
            lastUpdated: true,
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
            lastUpdated: x._min.lastUpdated,
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
    console.log("Aggregated", count, "Bazaar Items");
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
    console.log("Aggregated", count, "Bazaar Items");
}
