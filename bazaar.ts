export interface BItemObj {
    productID: string;
    sellPriceSum: number;
    buyPriceSum: number;
    sellPrice: number;
    buyPrice: number;
    sellMovingWeek: number;
    buyMovingWeek: number;
}

export async function getBazaar() {
    const res = await fetch("https://api.hypixel.net/skyblock/bazaar");
    const json = await res.json();
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
        });
    }
    return { lastUpdated: json.lastUpdated as number, bazaarArr };
}
