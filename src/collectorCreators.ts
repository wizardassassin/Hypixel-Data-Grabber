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

export const createTimeout = (
    collectorWrapper: { (): Promise<void> | boolean },
    getInterval: { (): number },
    name: string,
    runOnReady = false
): CollectorObj => ({
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

export const createTimeoutWrapper = (
    collectorWrapper: { (): Promise<void> | boolean },
    interval: number,
    name: string,
    runOnReady = false
) => createTimeout(collectorWrapper, () => interval, name, runOnReady);

export const createClockTimeoutWrapper = (
    collectorWrapper: { (): Promise<void> | boolean },
    interval: number,
    name: string,
    runOnReady = false,
    startTime: number = Date.now()
) =>
    createTimeout(
        collectorWrapper,
        // Seems to work with start times with at a max of ${interval} time in the future
        // Will still wait for ${interval} if Date.now() === startTime
        () => interval - ((Date.now() - startTime) % interval),
        name,
        runOnReady
    );
