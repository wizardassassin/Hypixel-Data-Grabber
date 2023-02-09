import { importExitHandler } from "./exitHandler.js";
import { importCustomCollectors, startCustomCollectors } from "./collectors.js";
import { setMinLogLevel } from "./collectorCreators.js";
import * as dotenv from "dotenv";

dotenv.config();

setMinLogLevel(Number(process.env.MIN_LOG_LEVEL) || 0);

importExitHandler();

if (process.env.NODE_ENV === "production") {
    importCustomCollectors();
    startCustomCollectors();
}

if (process.env.NODE_ENV === "development") {
    const debugFile = await import("./debug.js");
    await debugFile.default();
}

console.log("Initialized");
