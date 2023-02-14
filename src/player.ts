/* eslint-disable @typescript-eslint/no-explicit-any */
import { FetchWrapper } from "./fetchWrapper.js";

export interface GameCount {
    gameId: string;
    gameName: string;
    isGamemode: boolean;
    playerCount: number;
    superGame?: string;
}

export async function getPlayers() {
    const json = await FetchWrapper.fetch(
        `https://api.hypixel.net/counts?key=${process.env.HYPIXEL_API_KEY}`
    );

    const games: GameCount[] = Object.entries(json.games).flatMap(
        ([gameName, gameData]: [string, any]) => [
            {
                gameId: gameName,
                gameName: gameName,
                isGamemode: false,
                playerCount: gameData.players as number,
            },
            ...Object.entries(gameData.modes || {}).map(
                ([modeName, modeData]: [string, number]) => ({
                    gameId: `${gameName}_${modeName}`,
                    gameName: modeName,
                    isGamemode: true,
                    superGame: gameName,
                    playerCount: modeData,
                })
            ),
        ]
    );
    games.unshift({
        gameId: "SERVER",
        gameName: "SERVER",
        isGamemode: false,
        playerCount: json.playerCount,
    });
    // console.log(games);

    return {
        lastUpdated: Date.now(),
        playerCount: json.playerCount as number,
        games: games,
        gameNames: games.map((x) => x.gameId),
    };
}
