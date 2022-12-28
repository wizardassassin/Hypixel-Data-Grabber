import { customCollectors } from "./collectors.js";
import prisma from "./database.js";

let pushedOnce = false;

export function importExitHandler() {
    console.time("Elapsed");
    // Linux
    // Also trigged with Ctrl+C in windows
    process.on("SIGINT", (code) => {
        handleUserExit(code);
    });

    // Windows
    // pm2 doesn't send SIGINT on windows apparently
    if (process.platform === "win32") {
        process.on("message", (msg) => {
            if (msg === "shutdown") {
                handleUserExit(msg);
            }
        });
    }

    process.on("SIGTERM", (code) => {
        handleUserExit(code);
    });
}

export async function handleUserExit(signal: unknown) {
    console.log({ Received: signal });
    if (pushedOnce) {
        console.log("Forcefully shutting down...");
        console.timeEnd("Elapsed");
        process.exit(1);
    }
    pushedOnce = true;
    console.log("Received Ctrl+C, gracefully shutting down...");
    console.log("Press Ctrl+C again to forcefully shutdown.");
    await Promise.all(Object.values(customCollectors).map((x) => x.stop()));
    await prisma.$disconnect();
    console.timeEnd("Elapsed");
    process.exit(0);
}
