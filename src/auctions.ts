/* eslint-disable @typescript-eslint/no-explicit-any */
import * as nbt from "prismarine-nbt"; // No default export?
import { DateWrapper } from "./dateWrapper.js";
import { FetchWrapper } from "./fetchWrapper.js";
import { MathWrapper } from "./mathWrapper.js";

export interface EndedAuctionsObj {
    itemId: string;
    itemPrice: number;
    isBin: boolean;
}

export interface AuctionsObj {
    itemId: string;
    lowestBin: number;
    lowestBinAvg: number;
    count: number;
}

export interface IntermediateAuctionsObj {
    [key: string]: {
        bids: number[];
        count: number;
    };
}

export async function getEndedAuctions() {
    const json = await FetchWrapper.fetch(
        `https://api.hypixel.net/skyblock/auctions_ended`
    );
    const auctions = json.auctions as any[];
    const parsedAuctions: EndedAuctionsObj[] = await Promise.all(
        auctions.map(async (x) => ({
            itemId: await getNBTData(x.item_bytes),
            itemPrice: x.price,
            isBin: x.bin,
        }))
    );
    return {
        lastUpdated: DateWrapper.floorUTCMinutes(json.lastUpdated),
        totalItems: parsedAuctions.length,
        endedAuctions: parsedAuctions,
    };
}

export async function getAuctions() {
    const data = await fetchAuctionData();

    const auctions = Object.keys(data.data).map((key) => {
        const bids = data.data[key].bids;
        bids.sort((a, b) => a - b);
        const count = data.data[key].count;
        const valsToAvg = Math.max(Math.round(count * 0.15), 1);
        return {
            itemId: key,
            lowestBin: bids[0],
            lowestBinAvg: MathWrapper.average(bids.slice(0, valsToAvg)),
            count: count,
        } as AuctionsObj;
    });

    return {
        lastUpdated: DateWrapper.floorUTCMinutes(new Date(data.lastUpdated)),
        totalPages: data.totalPages,
        totalItems: data.totalItems,
        totalBinItems: auctions.reduce((a, b) => a + b.count, 0),
        auctions,
    };
}

async function fetchAuctionData() {
    const initA = await FetchWrapper.fetch(
        `https://api.hypixel.net/skyblock/auctions`
    ).then((json) => ({
        lastUpdated: json.lastUpdated as number,
        totalPages: json.totalPages as number,
        totalAuctions: json.totalAuctions as number,
        auctions: json.auctions as any[],
    }));
    const data: IntermediateAuctionsObj = {};
    const addData = (auctions: any[]) =>
        Promise.all(
            auctions
                .filter((x) => x.bin)
                .map(async (x) => {
                    const id = await getNBTData(x.item_bytes);
                    data[id] ??= { bids: [], count: 0 };
                    data[id].bids.push(x.starting_bid);
                    data[id].count++;
                })
        );
    const totalItems = initA.totalAuctions;
    const wait = Promise.all(
        Array.from({ length: initA.totalPages - 1 }, async (_, i) => {
            const json = await FetchWrapper.fetch(
                `https://api.hypixel.net/skyblock/auctions?page=${i + 1}`
            );
            const auctions = json.auctions as any[];
            const lastUpdated = json.lastUpdated as number;
            if (i + 1 === initA.totalPages - 1) {
                if (lastUpdated !== initA.lastUpdated) {
                    console.log(
                        "Auctions lastUpdated Missmatch:",
                        initA.lastUpdated,
                        lastUpdated
                    );
                }
                if (json.totalPages !== initA.totalPages) {
                    console.log(
                        "Auctions totalPages Missmatch:",
                        initA.totalPages,
                        json.totalPages
                    );
                }
                if (json.totalAuctions !== initA.totalAuctions) {
                    console.log(
                        "Auctions totalAuctions Missmatch:",
                        initA.totalAuctions,
                        json.totalAuctions
                    );
                }
            }
            await addData(auctions);
        })
    );
    await addData(initA.auctions);
    await wait;
    return {
        lastUpdated: initA.lastUpdated,
        totalPages: initA.totalPages,
        totalItems: totalItems,
        data,
    };
}

async function getNBTData(itemBytes: string) {
    const buffer = Buffer.from(itemBytes, "base64");
    const parsed = (await nbt.parse(buffer)).parsed;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const attr1 = parsed.value.i.value.value[0].tag.value.ExtraAttributes;
    const id = attr1.value.id.value;

    try {
        if (id === "POTION") {
            const type = attr1.value.potion.value;
            const level = attr1.value.potion_level.value;
            return `${id}_${type.toUpperCase()}_${level}`;
        } else if (id === "PET") {
            const info = JSON.parse(attr1.value.petInfo.value);
            const type = info.type;
            const tier = info.tier;
            return `${id}_${type}_${tier}`;
        } else {
            return `${id}`;
        }
    } catch (error) {
        console.error(error);
        console.error(attr1.value);
        return `${id}`;
    }
}
