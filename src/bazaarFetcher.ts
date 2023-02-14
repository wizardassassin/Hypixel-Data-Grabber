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
        loggingLevel: 1,
        offset: DateWrapper.createOffset({ sec: 15 }),
    });
    fetcher.addAggregator({
        runFunction: bazaarHourly,
        interval: DateWrapper.hourToMs,
        loggingLevel: 2,
        offset: DateWrapper.createOffset({ min: 1 }),
    });
    fetcher.addDeleter({
        runFunction: cleanBazaar,
        interval: DateWrapper.hourToMs,
        loggingLevel: 2,
        offset: DateWrapper.createOffset({ sec: 0 }),
    });
    fetcher.addAggregator({
        runFunction: aggregateBazaarDaily,
        interval: DateWrapper.dayToMs,
        loggingLevel: 2,
        offset: DateWrapper.createOffset({ min: 2 }),
    });
}

export function importBazaarCollectors() {
    return;
}

async function fetchBazaar(date: Date) {
    const newDate = date;
    const data = await getBazaar();

    const { count } = await prisma.bazaarItemLog.createMany({
        data: data.bazaarArr.map((x) => ({
            logRange: "oneMinute",
            productId: x.productId,
            lastUpdated: newDate,
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
    const newDate = DateWrapper.modifyDate(
        date,
        DateWrapper.createOffset({ day: -2 })
    );
    const { count } = await prisma.bazaarItemLog.deleteMany({
        where: {
            lastUpdated: {
                lt: newDate,
            },
            logRange: "oneMinute",
        },
    });
    return count;
}

async function bazaarHourly(date: Date) {
    const newDate = DateWrapper.modifyDate(
        date,
        DateWrapper.createOffset({ hour: -1 })
    );
    const data = await prisma.bazaarItemLog.groupBy({
        by: ["productId"],
        where: {
            lastUpdated: {
                gte: newDate,
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
            lastUpdated: newDate,
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
    const newDate = DateWrapper.modifyDate(
        date,
        DateWrapper.createOffset({ day: -1 })
    );
    const data = await prisma.bazaarItemLog.groupBy({
        by: ["productId"],
        where: {
            lastUpdated: {
                gte: newDate,
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
            lastUpdated: newDate,
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
