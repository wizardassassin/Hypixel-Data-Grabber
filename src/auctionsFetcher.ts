import { getAuctions } from "./auctions.js";
import { createClockTimeoutWrapper } from "./collectorCreators.js";
import { customCollectors } from "./collectors.js";
import prisma from "./database.js";
import { DateWrapper } from "./dateWrapper.js";

export async function initializeAuctions() {}

export function importAuctionsCollectors() {}

export async function fetchAuctions() {
    const data = await getAuctions();
}

async function cleanBazaar() {}

async function aggregateBazaarHourly() {}

async function aggregateBazaarDaily() {}
