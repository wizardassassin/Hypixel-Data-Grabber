import {
    createClockTimeoutIntervalPromise,
    createTimeoutPromise,
    handleUserExit,
    importExitHandler,
    minToMs,
} from "./util";
import {
    fetchBazaar,
    fetchAuctions,
    fetchEndedAuctions,
    fetchPlayers,
    fetchBoosters,
    fetchLeaderboards,
    fetchWatchdog,
} from "./fetchFunctions";
import prisma from "./database";
import * as dotenv from "dotenv";

dotenv.config();

importExitHandler();

async function main() {
    console.time("Elapsed");
    try {
        const wait1 = createTimeoutPromise(fetchBazaar, minToMs * 1, "Bazaar");
        const wait2 = createTimeoutPromise(
            fetchAuctions,
            minToMs * 5,
            "Auctions"
        );
        const wait3 = createClockTimeoutIntervalPromise(
            fetchEndedAuctions,
            minToMs * 1,
            "EndedAuctions"
        );
        const wait4 = createTimeoutPromise(
            fetchPlayers,
            minToMs * 5,
            "Players"
        );
        const wait5 = createTimeoutPromise(
            fetchBoosters,
            minToMs * 60,
            "Boosters"
        );
        const wait6 = createTimeoutPromise(
            fetchLeaderboards,
            minToMs * 60,
            "Leaderboards"
        );
        const wait7 = createTimeoutPromise(
            fetchWatchdog,
            minToMs * 60,
            "Watchdog"
        );

        await Promise.all([wait1, wait2, wait3, wait4, wait5, wait6, wait7]);
    } catch (error) {
        console.error(error);
    }
    await prisma.$disconnect();
    console.timeEnd("Elapsed");
    process.exit(0);
}

main();

// Debugging
// setTimeout(() => handleUserExit("Timeout"), minToMs * 0);
