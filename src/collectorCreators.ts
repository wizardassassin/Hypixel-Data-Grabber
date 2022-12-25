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
        };
        this._promise = new Promise((res, rej) => {
            this._res = res;
            this.rej = rej;
        });
        if (runOnReady) {
            workerCallback();
            return;
        }
        const waitTime = getInterval();
        this.nextRun = new Date(Date.now() + waitTime);
        this._timeout = setTimeout(workerCallback, waitTime);
        this.nextRun;
    },
    async stop() {
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
        if (logLevel <= loggingLevel) {
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
        getInterval: () => interval - ((Date.now() - startTime) % interval),
        name,
        runOnReady,
        loggingLevel,
    });
