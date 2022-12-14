import { importExitHandler } from "./exitHandler.js";
import { importCustomCollectors, startCustomCollectors } from "./collectors.js";
import { setMinLogLevel } from "./collectorCreators.js";
import * as dotenv from "dotenv";

dotenv.config();

setMinLogLevel(Number(process.env.MIN_LOG_LEVEL) || 0);

importExitHandler();

importCustomCollectors();

startCustomCollectors();

console.log("Initialized");
