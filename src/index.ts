import { importExitHandler } from "./exitHandler.js";
import { importCustomCollectors, startCustomCollectors } from "./collectors.js";
import * as dotenv from "dotenv";

dotenv.config();

importExitHandler();

importCustomCollectors();

startCustomCollectors();

console.log("Initialized");
