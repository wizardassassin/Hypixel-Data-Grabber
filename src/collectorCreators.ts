export interface CollectorObj {
    isRunning: boolean;
    nextRun: Date;
    _timeout: NodeJS.Timeout;
    _stopRunning: boolean;
    _promise: Promise<unknown>;
    _res: (value: unknown) => void;
    _rej: (value: unknown) => void;
    start(): void;
    stop(): Promise<unknown>;
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
    start() {
        const workerCallback = async () => {
            console.log("Started", name);
            console.time(name);
            this.isRunning = true;
            try {
                await collectorWrapper();
            } catch (error) {
                console.error(error);
            }
            this.isRunning = false;
            console.timeEnd(name);
            if (this._stopRunning) {
                console.log("Stopped", name);
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
            console.log("Stopped", name);
            return;
        }
        console.log("Waiting for", name, "to finish...");
        await this._promise;
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
