/* eslint-disable @typescript-eslint/no-explicit-any */
import * as nbt from "prismarine-nbt"; // No default export?

export interface EAuctionObj {
    id: string;
    bid: number;
    bin: boolean;
}

export interface AuctionObj {
    id: string;
    bid: number;
    count: number;
}

export interface AuctionsObj {
    [key: string]: {
        bid: number;
        count: number;
    };
}

export async function getEndedAuctions() {
    const res = await fetch("https://api.hypixel.net/skyblock/auctions_ended");
    const json = await res.json();
    const auctions = json.auctions as any[];
    const parsedAuctions: EAuctionObj[] = await Promise.all(
        auctions.map(async (x) => ({
            id: await getNBTData(x.item_bytes),
            bid: x.price,
            bin: x.bin,
        }))
    );
    return {
        lastUpdated: json.lastUpdated as number,
        totalItems: parsedAuctions.length,
        endedAuctions: parsedAuctions,
    };
}

export async function getAuctions() {
    const data = await fetchAuctionData();

    const auctions = Object.keys(data.data).map(
        (key) =>
            ({
                id: key,
                bid: data.data[key].bid,
                count: data.data[key].count,
            } as AuctionObj)
    );

    return {
        lastUpdated: data.lastUpdated,
        totalPages: data.totalPages,
        totalItems: data.totalItems,
        totalBinItems: auctions.reduce((a, b) => a + b.count, 0),
        auctions,
    };
}

async function fetchAuctionData() {
    const initA = await fetch(`https://api.hypixel.net/skyblock/auctions`)
        .then((res) => res.json())
        .then((json) => ({
            lastUpdated: json.lastUpdated as number,
            totalPages: json.totalPages as number,
            totalAuctions: json.totalAuctions as number,
            auctions: json.auctions as any[],
        }));
    const data: AuctionsObj = {};
    const addData = (auctions: any[]) =>
        auctions
            .filter((x) => x.bin)
            .forEach(async (x) => {
                const id = await getNBTData(x.item_bytes);
                data[id] ??= { bid: Infinity, count: 0 };
                data[id].bid = Math.min(data[id].bid, x.starting_bid);
                data[id].count++;
            });
    const totalItems = initA.totalAuctions;
    const wait = Promise.all(
        Array.from({ length: initA.totalPages - 1 }, async (_, i) => {
            const json = await fetch(
                `https://api.hypixel.net/skyblock/auctions?page=${i + 1}`
            ).then((res) => res.json());
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
            addData(auctions);
        })
    );
    addData(initA.auctions);
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

    if (id === "POTION") {
        const type = attr1.value.potion.value;
        const level = attr1.value.potion_level.value;
        return `${type}-${level}`;
    } else if (id === "PET") {
        const info = JSON.parse(attr1.value.petInfo.value);
        const type = info.type;
        const tier = info.tier;
        return `${type}-${tier}`;
    } else {
        return `${id}`;
    }
}
