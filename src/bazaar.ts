export interface BItemObj {
    productID: string;
    sellPriceSum: number;
    buyPriceSum: number;
    sellPrice: number;
    buyPrice: number;
    sellMovingWeek: number;
    buyMovingWeek: number;
    sellVolume: number;
    buyVolume: number;
    sellOrders: number;
    buyOrders: number;
}

export async function getBazaar() {
    const res = await fetch("https://api.hypixel.net/skyblock/bazaar");
    const json = await res.json();
    let totalSellVolume = 0;
    let totalBuyVolume = 0;
    let totalSellOrders = 0;
    let totalBuyOrders = 0;
    const bazaarArr: BItemObj[] = [];
    for (const key in json.products) {
        const quick_status = json.products[key].quick_status;
        bazaarArr.push({
            productID: key,
            sellPriceSum: json.products[key].sell_summary[0]?.pricePerUnit ?? 0,
            buyPriceSum: json.products[key].buy_summary[0]?.pricePerUnit ?? 0,
            sellPrice: quick_status.sellPrice,
            buyPrice: quick_status.buyPrice,
            sellMovingWeek: quick_status.sellMovingWeek,
            buyMovingWeek: quick_status.buyMovingWeek,
            sellVolume: quick_status.sellVolume,
            buyVolume: quick_status.buyVolume,
            sellOrders: quick_status.sellOrders,
            buyOrders: quick_status.buyOrders,
        });
        totalSellVolume += quick_status.sellVolume;
        totalBuyVolume += quick_status.buyVolume;
        totalSellOrders += quick_status.sellOrders;
        totalBuyOrders += quick_status.buyOrders;
    }
    return {
        lastUpdated: json.lastUpdated as number,
        totalSellVolume,
        totalBuyVolume,
        totalSellOrders,
        totalBuyOrders,
        bazaarArr,
    };
}