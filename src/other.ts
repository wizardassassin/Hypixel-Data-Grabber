import { FetchWrapper } from "./fetchWrapper.js";

export interface GamesObj {
    [key: string]: {
        players: number;
        modes?: {
            [key: string]: number;
        };
    };
}

export interface BoostersObj {
    [key: string]: {
        _id: string; // Not necessary
        purchaserUuid: string;
        amount: number;
        originalLength: number;
        length: number;
        gameType: number;
        dateActivated: number;
        stacked?: string[] | boolean;
    };
}

export interface LeaderboardsObj {
    [key: string]: {
        path: string;
        prefix: string;
        title: string;
        location: string;
        count: number;
        leaders: string[];
    }[];
}

export interface WatchdogObj {
    watchdogLastMinute: number;
    staffRollingDaily: number;
    watchdogTotal: number;
    watchdogRollingDaily: number;
    staffTotal: number;
}

export async function getPlayers() {
    const json = await FetchWrapper.fetch(
        `https://api.hypixel.net/counts?key=${process.env.HYPIXEL_API_KEY}`
    );

    return {
        lastUpdated: Date.now(),
        playerCount: json.playerCount as number,
        games: json.games as GamesObj,
    };
}

export async function getBoosters() {
    const json = await FetchWrapper.fetch(
        `https://api.hypixel.net/boosters?key=${process.env.HYPIXEL_API_KEY}`
    );
    // _id looks like mongoDB xd

    return {
        lastUpdated: Date.now(),
        isDecrementing: json.boosterState.decrementing as boolean,
        boosters: json.boosters as BoostersObj,
    };
}

export async function getLeaderboards() {
    const json = await FetchWrapper.fetch(
        `https://api.hypixel.net/leaderboards?key=${process.env.HYPIXEL_API_KEY}`
    );

    return {
        lastUpdated: Date.now(),
        leaderboards: json.leaderboards as LeaderboardsObj,
    };
}

export async function getWatchdog() {
    const json = await FetchWrapper.fetch(
        `https://api.hypixel.net/punishmentstats?key=${process.env.HYPIXEL_API_KEY}`
    );

    // errors when I assign it the type WatchdogObj
    const obj = {
        watchdogLastMinute: json.watchdog_lastMinute as number,
        staffRollingDaily: json.staff_rollingDaily as number,
        watchdogRollingDaily: json.watchdog_rollingDaily as number,
        watchdogTotal: json.watchdog_total as number,
        staffTotal: json.staff_total as number,
    };

    return {
        lastUpdated: Date.now(),
        watchdog: obj,
    };
}
