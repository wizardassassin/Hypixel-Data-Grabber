import { PrismaClient } from "@prisma/client";
import { getBazaar } from "./bazaar";
import { getAuctions, getEndedAuctions } from "./auctions";
import { getPlayers } from "./players";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function fetchBazaar() {
    const { lastUpdated, bazaarArr } = await getBazaar();
    const bazaarObj = {
        productID: [] as string[],
        sellPriceSum: [] as number[],
        buyPriceSum: [] as number[],
        sellPrice: [] as number[],
        buyPrice: [] as number[],
        sellMovingWeek: [] as number[],
        buyMovingWeek: [] as number[],
    };
    for (const item of bazaarArr) {
        bazaarObj.productID.push(item.productID);
        bazaarObj.sellPriceSum.push(item.sellPriceSum);
        bazaarObj.buyPriceSum.push(item.buyPriceSum);
        bazaarObj.sellPrice.push(item.sellPrice);
        bazaarObj.buyPrice.push(item.buyPrice);
        bazaarObj.sellMovingWeek.push(item.sellMovingWeek);
        bazaarObj.buyMovingWeek.push(item.buyMovingWeek);
    }
    try {
        // Precision errors when the type wasn't explicity cast
        await prisma.bazaarLog.create({
            data: {
                timestamp: lastUpdated,
                item_ids: bazaarObj.productID,
                sell_prices: bazaarObj.sellPriceSum,
                buy_prices: bazaarObj.buyPriceSum,
                buy_moving_weeks: bazaarObj.buyMovingWeek,
                sell_moving_weeks: bazaarObj.sellMovingWeek,
            },
        });
    } catch (error) {
        if (error.code === "P2002") {
            console.log("Not unique", error.meta);
        } else {
            console.error(error);
        }
    }
}

async function fetchAuctions() {
    const { lastUpdated, totalPages, totalItems, auctions } =
        await getAuctions();
    const auctionsObj = {
        productID: [] as string[],
        lowestBid: [] as number[],
        itemCount: [] as number[],
    };
    for (const item of auctions) {
        auctionsObj.productID.push(item.id);
        auctionsObj.lowestBid.push(item.bid);
        auctionsObj.itemCount.push(item.count);
    }
    try {
        await prisma.auctionsLog.create({
            data: {
                timestamp: lastUpdated,
                total_pages: totalPages,
                total_items: totalItems,
                item_ids: auctionsObj.productID,
                lowest_bids: auctionsObj.lowestBid,
                item_counts: auctionsObj.itemCount,
            },
        });
    } catch (error) {
        if (error.code === "P2002") {
            console.log("Not unique", error.meta);
        } else {
            console.error(error);
        }
    }
}

async function fetchEndedAuctions() {
    const { lastUpdated, totalItems, Endedauctions } = await getEndedAuctions();
    const endedAuctionsObj = {
        productID: [] as string[],
        bidPrice: [] as number[],
        isBin: [] as boolean[],
    };
    for (const item of Endedauctions) {
        endedAuctionsObj.productID.push(item.id);
        endedAuctionsObj.bidPrice.push(item.bid);
        endedAuctionsObj.isBin.push(item.bin);
    }
    try {
        await prisma.endedAuctionsLog.create({
            data: {
                timestamp: lastUpdated,
                total_items: totalItems,
                item_ids: endedAuctionsObj.productID,
                bid_prices: endedAuctionsObj.bidPrice,
                is_bin: endedAuctionsObj.isBin,
            },
        });
    } catch (error) {
        if (error.code === "P2002") {
            console.log("Not unique", error.meta);
        } else {
            console.error(error);
        }
    }
}

async function fetchPlayers() {
    const { lastUpdated, playerCount, games } = await getPlayers();

    try {
        await prisma.playersLog.create({
            data: {
                timestamp: lastUpdated,
                player_count: playerCount,
                games: games,
            },
        });
    } catch (error) {
        if (error.code === "P2002") {
            console.log("Not unique", error.meta);
        } else {
            console.error(error);
        }
    }
}

const createPromise = (
    awaitFunction: { (): Promise<void> },
    runInterval: number,
    name: string
) =>
    new Promise((resolve) => {
        const promiseRun = async () => {
            console.log("Start:", name);
            console.time(name);
            intervalWorkers[name] = {
                resolve() {
                    console.log("Waiting on", name, "to finish...");
                },
            };
            try {
                await awaitFunction();
            } catch (error) {
                console.error(error);
            }
            console.timeEnd(name);
            if (pushedOnce) {
                console.log(name, "Finished");
                console.log(name, "Done");
                resolve("Done");
                return;
            }
            const nextTimeout = setTimeout(promiseRun, runInterval);
            intervalWorkers[name] = {
                resolve() {
                    clearTimeout(nextTimeout);
                    console.log(name, "Done");
                    resolve("Done");
                },
            };
        };
        promiseRun();
    });

async function main() {
    console.time("Elapsed");
    try {
        const minToMs = 60000;
        const wait1 = createPromise(fetchBazaar, minToMs * 1, "Bazaar");
        const wait2 = createPromise(fetchAuctions, minToMs * 5, "Auctions");
        // prettier-ignore
        const wait3 = createPromise(fetchEndedAuctions, minToMs * 2.5, "EndedAuctions");
        const wait4 = createPromise(fetchPlayers, minToMs * 5, "Players");
        await Promise.all([wait1, wait2, wait3, wait4]);
    } catch (error) {
        console.error(error);
    }
    await prisma.$disconnect();
    console.timeEnd("Elapsed");
    process.exit(0);
}

let pushedOnce = false;
const intervalWorkers: {
    [key: string]: {
        resolve: { (): void };
    };
} = {};

function handleUserExit(signal: unknown) {
    console.log({ Received: signal });
    if (pushedOnce) {
        console.log("Forcefully shutting down...");
        process.exit(1);
    }
    pushedOnce = true;
    console.log("Received Ctrl+C, gracefully shutting down...");
    console.log("Press Ctrl+C again to forcefully shutdown.");
    for (const key in intervalWorkers) {
        intervalWorkers[key].resolve();
    }
}

// Linux
process.on("SIGINT", (code) => {
    handleUserExit(code);
});

// Windows
process.on("message", function (msg) {
    // Loose equals
    if (msg == "shutdown") {
        handleUserExit(msg);
    }
});

process.on("SIGTERM", (code) => {
    handleUserExit(code);
});

main();
