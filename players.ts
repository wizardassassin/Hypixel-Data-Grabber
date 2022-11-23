export interface GamesObj {
    [key: string]: {
        players: number;
        modes?: {
            [key: string]: number;
        };
    };
}

export async function getPlayers() {
    const res = await fetch(
        `https://api.hypixel.net/counts?key=${process.env.HYPIXEL_API_KEY}`
    );
    const json = await res.json();

    return {
        lastUpdated: Date.now(),
        playerCount: json.playerCount as number,
        games: json.games as GamesObj,
    };
}
