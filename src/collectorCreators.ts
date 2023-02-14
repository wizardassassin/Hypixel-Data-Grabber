export interface CollectorObj {
    isRunning: boolean;
    nextRun: Date;
    _timeout: NodeJS.Timeout;
    _stopRunning: boolean;
    _promise: Promise<unknown>;
    _collectorWrapper: { (): Promise<void> };
    _res: (value: unknown) => void;
    _rej: (value: unknown) => void;
    start(): void;
    stop(): Promise<unknown>;
    log(logWrapper: () => void, logLevel: number): void;
}

let minLogLevel = 0;
export const setMinLogLevel = (x: number) => (minLogLevel = x);
export const getMinLogLevel = () => minLogLevel;

export const createTimeout = ({
    collectorWrapper,
    getInterval,
    name,
    runOnReady = false,
    loggingLevel = 1,
}: {
    collectorWrapper: { (): Promise<void> };
    getInterval: { (): number };
    name: string;
    runOnReady?: boolean;
    loggingLevel?: number;
}): CollectorObj => ({
    isRunning: null,
    nextRun: null,
    _timeout: null,
    _stopRunning: null,
    _promise: null,
    _res: null,
    _rej: null,
    _collectorWrapper: collectorWrapper, // this
    start() {
        this.log(() => console.log("Starting", name), 3);
        const workerCallback = async () => {
            this.log(() => console.log("Started", name), 3);
            this.log(() => console.time(name), 3);
            this.isRunning = true;
            try {
                await this._collectorWrapper();
            } catch (error) {
                console.error(error);
            }
            this.isRunning = false;
            this.log(() => console.timeEnd(name), 3);
            if (this._stopRunning) {
                this.log(() => console.log("Stopped", name), 1);
                this._res("Done");
                return;
            }
            const waitTime = getInterval();
            this.nextRun = new Date(Date.now() + waitTime);
            this._timeout = setTimeout(workerCallback, waitTime);
            this.log(() => console.log(`Next ${name}:`, this.nextRun), 3);
        };
        this._promise = new Promise((res, rej) => {
            this._res = res;
            this.rej = rej;
        });
        if (runOnReady) {
            this.log(() => console.log(`First ${name} in`, 0, "seconds"), 1);
            this.log(() => console.log(`First ${name}:`, new Date()), 1);
            workerCallback();
            return;
        }
        const waitTime = getInterval();
        this.nextRun = new Date(Date.now() + waitTime);
        this._timeout = setTimeout(workerCallback, waitTime);
        this.log(
            () => console.log(`First ${name} in`, waitTime / 1000, "seconds"),
            1
        );
        this.log(() => console.log(`First ${name}:`, this.nextRun), 1);
    },
    async stop() {
        this.log(() => console.log("Stopping", name), 3);
        this._stopRunning = true;
        clearInterval(this._timeout);
        if (!this.isRunning) {
            this.log(() => console.log("Stopped", name), 1);
            return;
        }
        this.log(() => console.log("Waiting for", name, "to finish..."), 1);
        await this._promise;
    },
    log(logWrapper, logLevel) {
        if (logLevel <= Math.max(loggingLevel, minLogLevel)) {
            logWrapper();
        }
    },
});

export const createTimeoutWrapper = ({
    collectorWrapper,
    interval,
    name,
    runOnReady = false,
    loggingLevel = 1,
}: {
    collectorWrapper: { (): Promise<void> };
    interval: number;
    name: string;
    runOnReady?: boolean;
    loggingLevel?: number;
}) =>
    createTimeout({
        collectorWrapper,
        getInterval: () => interval,
        name,
        runOnReady,
        loggingLevel,
    });

export const createClockTimeoutWrapper = ({
    collectorWrapper,
    interval,
    name,
    runOnReady = false,
    loggingLevel = 1,
    startTime = Date.now(),
}: {
    collectorWrapper: { (): Promise<void> };
    interval: number;
    name: string;
    runOnReady?: boolean;
    loggingLevel?: number;
    startTime?: number;
}) =>
    createTimeout({
        collectorWrapper,
        // Seems to work with start times with at a max of ${interval} time in the future
        // Will still wait for ${interval} if Date.now() === startTime
        getInterval: () =>
            (interval - ((Date.now() - startTime) % interval)) % interval,
        name,
        runOnReady,
        loggingLevel,
    });
