let pushedOnce = false;

export const hasPushed = () => pushedOnce;
export const setPushed = (val: boolean) => (pushedOnce = val);

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const minToMs = 60000;

export function importExitHandler() {
    // Linux
    // Also trigged with Ctrl+C in windows
    process.on("SIGINT", (code) => {
        handleUserExit(code);
    });

    // Windows
    process.on("message", function (msg) {
        // Loose equals
        if (msg == "shutdown") {
            handleUserExit(msg);
        }
    });

    process.on("SIGTERM", (code) => {
        handleUserExit(code);
    });
}

export function handleUserExit(signal: unknown) {
    console.log({ Received: signal });
    if (pushedOnce) {
        console.log("Forcefully shutting down...");
        process.exit(1);
    }
    pushedOnce = true;
    console.log("Received Ctrl+C, gracefully shutting down...");
    console.log("Press Ctrl+C again to forcefully shutdown.");
    for (const key in intervalWorkers) {
        intervalWorkers[key].resolve();
    }
}

export const intervalWorkers: {
    [key: string]: {
        resolve: { (): void };
    };
} = {};

export const createTimeoutPromise = (
    awaitFunction: { (): Promise<void> },
    runInterval: number,
    name: string
) =>
    new Promise((resolve) => {
        const promiseRun = async () => {
            console.log("Start:", name);
            console.time(name);
            isRunning = true;
            try {
                await awaitFunction();
            } catch (error) {
                console.error(error);
            }
            console.timeEnd(name);
            if (shouldExit) {
                console.log(name, "Finished");
                console.log(name, "Done");
                resolve("Done");
                return;
            }
            isRunning = false;
            timeout = setTimeout(promiseRun, runInterval);
        };
        let isRunning = false;
        let shouldExit = false;
        let timeout: NodeJS.Timeout;
        intervalWorkers[name] = {
            resolve() {
                shouldExit = true;
                clearTimeout(timeout);
                if (isRunning) {
                    console.log("Waiting on", name, "to finish...");
                    return;
                }
                console.log(name, "Done");
                resolve("Done");
            },
        };
        promiseRun();
    });

export const createTimeoutIntervalPromise = (
    awaitFunction: { (): Promise<void> },
    runInterval: number,
    name: string
) =>
    new Promise((resolve) => {
        const promiseRun = async () => {
            console.log("Start:", name);
            console.time(name);
            isRunning = true;
            const start = performance.now();
            try {
                await awaitFunction();
            } catch (error) {
                console.error(error);
            }
            const stop = performance.now();
            console.timeEnd(name);
            if (shouldExit) {
                console.log(name, "Finished");
                console.log(name, "Done");
                resolve("Done");
                return;
            }
            isRunning = false;
            timeout = setTimeout(promiseRun, runInterval - (stop - start));
        };
        let isRunning = false;
        let shouldExit = false;
        let timeout: NodeJS.Timeout;
        intervalWorkers[name] = {
            resolve() {
                shouldExit = true;
                clearTimeout(timeout);
                if (isRunning) {
                    console.log("Waiting on", name, "to finish...");
                    return;
                }
                console.log(name, "Done");
                resolve("Done");
            },
        };
        promiseRun();
    });

export const createClockTimeoutIntervalPromise = (
    awaitFunction: { (): Promise<void> },
    runInterval: number,
    name: string,
    startDate: number | undefined = undefined
) =>
    new Promise((resolve) => {
        const promiseRun = async () => {
            console.log("Start:", name);
            console.time(name);
            isRunning = true;
            try {
                await awaitFunction();
            } catch (error) {
                console.error(error);
            }
            console.timeEnd(name);
            if (shouldExit) {
                console.log(name, "Finished");
                console.log(name, "Done");
                resolve("Done");
                return;
            }
            isRunning = false;
            timeout = setTimeout(
                promiseRun,
                runInterval - ((Date.now() - startDate) % runInterval)
            );
        };
        let isRunning = false;
        let shouldExit = false;
        let timeout: NodeJS.Timeout;
        intervalWorkers[name] = {
            resolve() {
                shouldExit = true;
                clearTimeout(timeout);
                if (isRunning) {
                    console.log("Waiting on", name, "to finish...");
                    return;
                }
                console.log(name, "Done");
                resolve("Done");
            },
        };
        if (startDate === undefined) {
            startDate = Date.now();
            promiseRun();
            return;
        }
        timeout = setTimeout(
            promiseRun,
            runInterval - ((Date.now() - startDate) % runInterval)
        );
    });

export const createIntervalPromise = (
    awaitFunction: { (): Promise<void> },
    runInterval: number,
    name: string
) =>
    new Promise((resolve) => {
        const promiseRun = async () => {
            const currRunner = runnerCount++;
            console.log("Start:", name);
            console.time(name);
            runners++;
            try {
                await awaitFunction();
            } catch (error) {
                console.error(error);
            }
            console.timeEnd(name);
            if (pushedOnce) {
                console.log(name, "Finished", currRunner);
                console.log(name, "Done", currRunner);
                resolve("Done");
                return;
            }
            runners--;
        };
        let runners = 0;
        let runnerCount = 0;
        const interval = setInterval(promiseRun, runInterval);
        intervalWorkers[name] = {
            resolve() {
                clearInterval(interval);
                if (runners !== 0) {
                    console.log("Waiting on", name, "to finish...");
                    return;
                }
                console.log(name, "Done");
                resolve("Done");
            },
        };
        promiseRun();
    });
