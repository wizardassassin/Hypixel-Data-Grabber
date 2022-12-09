import { importAuctionsCollectors } from "./auctionsFetcher.js";
import { importBazaarCollectors } from "./bazaarFetcher.js";
import { CollectorObj } from "./collectorCreators.js";

export const customCollectors = {} as { [key: string]: CollectorObj };

export function importCustomCollectors() {
    importBazaarCollectors();
    importAuctionsCollectors();
}

export function startCustomCollectors() {
    Object.values(customCollectors).map((x) => x.start());
}
