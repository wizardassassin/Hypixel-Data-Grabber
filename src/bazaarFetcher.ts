import { getBazaar } from "./bazaar.js";
import prisma from "./database.js";
import { DateWrapper } from "./dateWrapper.js";
import { FetcherWrapper } from "./fetcherWrapper.js";

export function bazaarFetcher() {
    const fetcher = new FetcherWrapper({
        name: "Bazaar",
        countType: "Item(s)",
    });
    fetcher.addCollector({
        runFunction: fetchBazaar,
        interval: DateWrapper.minToMs,
        dateOffset: DateWrapper.createOffset({ sec: 0 }),
        startOffset: DateWrapper.createOffset({ sec: 15 }),
        loggingLevel: 1,
    });
    fetcher.addAggregator({
        runFunction: bazaarHourly,
        interval: DateWrapper.hourToMs,
        dateOffset: DateWrapper.createOffset({ hour: -1 }),
        startOffset: DateWrapper.createOffset({ min: 1 }),
        loggingLevel: 2,
    });
    fetcher.addDeleter({
        runFunction: cleanBazaar,
        interval: DateWrapper.hourToMs,
        dateOffset: DateWrapper.createOffset({ day: -2 }),
        startOffset: DateWrapper.createOffset({ sec: 0 }),
        loggingLevel: 2,
    });
    fetcher.addAggregator({
        runFunction: aggregateBazaarDaily,
        interval: DateWrapper.dayToMs,
        dateOffset: DateWrapper.createOffset({ day: -1 }),
        startOffset: DateWrapper.createOffset({ min: 2 }),
        loggingLevel: 2,
    });
    return fetcher;
}

async function fetchBazaar(date: Date) {
    const data = await getBazaar();

    const { count } = await prisma.bazaarItemLog.createMany({
        data: data.bazaarArr.map((x) => ({
            logRange: "oneMinute",
            productId: x.productId,
            lastUpdated: date,
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
    return count;
}

async function cleanBazaar(date: Date) {
    const { count } = await prisma.bazaarItemLog.deleteMany({
        where: {
            lastUpdated: {
                lt: date,
            },
            logRange: "oneMinute",
        },
    });
    return count;
}

async function bazaarHourly(date: Date) {
    const data = await prisma.bazaarItemLog.groupBy({
        by: ["productId"],
        where: {
            lastUpdated: {
                gte: date,
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
        return 0;
    }
    const { count } = await prisma.bazaarItemLog.createMany({
        data: data.map((x) => ({
            productId: x.productId,
            logRange: "oneHour",
            lastUpdated: date,
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
    return count;
}

async function aggregateBazaarDaily(date: Date) {
    const data = await prisma.bazaarItemLog.groupBy({
        by: ["productId"],
        where: {
            lastUpdated: {
                gte: date,
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
        return 0;
    }
    const { count } = await prisma.bazaarItemLog.createMany({
        data: data.map((x) => ({
            productId: x.productId,
            logRange: "oneDay",
            lastUpdated: date,
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
    return count;
}
