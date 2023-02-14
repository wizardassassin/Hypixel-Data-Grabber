import { auctionsFetcher } from "./auctionsFetcher.js";
import { bazaarFetcher } from "./bazaarFetcher.js";
import { CollectorObj } from "./collectorCreators.js";

export const customCollectors = {} as { [key: string]: CollectorObj };

export function loadCollectors() {
    bazaarFetcher();
    auctionsFetcher();
}

export function startCollectors() {
    Object.values(customCollectors).map((x) => x.start());
}
