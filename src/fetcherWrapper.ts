import {
    CollectorObj,
    createClockTimeoutWrapper,
} from "./collectorCreators.js";
import { customCollectors } from "./collectors.js";
import { DateWrapper } from "./dateWrapper.js";

export interface WordObj {
    past: string;
    noun: string;
}

export class FetcherWrapper {
    static fetchers: FetcherWrapper[] = [];
    static countLoggingLevel = 2;
    static collectorWords: WordObj = {
        past: "Collected",
        noun: "Collector",
    };
    static aggregatorWords: WordObj = {
        past: "Aggregated",
        noun: "Aggregator",
    };
    static deleterWords: WordObj = {
        past: "Deleted",
        noun: "Deleter",
    };
    static timeIntervals = new Map([
        [DateWrapper.hourToMs, "Hourly"],
        [DateWrapper.dayToMs, "Daily"],
    ]);

    name: string;
    countType: string;

    collectors: CollectorObj[];
    aggregators: CollectorObj[];
    deleters: CollectorObj[];

    constructor(config: { name: string; countType: string }) {
        this.name = config.name;
        this.countType = config.countType;
        this.collectors = [];
        this.aggregators = [];
        this.deleters = [];
        FetcherWrapper.fetchers.push(this);
    }

    createGeneric({
        runFunction,
        interval,
        dateOffset = 0,
        startOffset = 0,
        loggingLevel = 1,
        runType,
        objArr,
    }: {
        runFunction: { (date: Date): Promise<number> };
        interval: number;
        dateOffset?: number;
        startOffset?: number;
        loggingLevel?: number;
        runType: WordObj;
        objArr: CollectorObj[];
    }) {
        const intervalType = FetcherWrapper.timeIntervals.has(interval)
            ? ` ${FetcherWrapper.timeIntervals.get(interval)}`
            : "";
        const getTime = (dateOffset = 0) =>
            DateWrapper.modifyDate(
                DateWrapper.flatUTCTime(new Date(), Math.round, interval),
                dateOffset
            );
        const newName = `${this.name} ${runType.noun}${intervalType}`;
        const nameInfo = this.name;
        const typeInfo = this.countType;
        const startTime = getTime().valueOf() + startOffset;
        const repeater = createClockTimeoutWrapper({
            async collectorWrapper() {
                const time = getTime(dateOffset);
                const count = await runFunction(time);
                this.log?.(
                    () => console.log(runType.past, count, nameInfo, typeInfo),
                    FetcherWrapper.countLoggingLevel
                );
            },
            interval: interval,
            name: newName,
            loggingLevel: loggingLevel,
            runOnReady: false,
            startTime: startTime,
        });
        customCollectors[newName] = repeater;
        objArr.push(repeater);
    }

    addCollector({
        runFunction,
        interval,
        dateOffset = 0,
        startOffset = 0,
        loggingLevel = 1,
    }: {
        runFunction: { (date: Date): Promise<number> };
        interval: number;
        dateOffset?: number;
        startOffset?: number;
        loggingLevel?: number;
    }) {
        this.createGeneric({
            runFunction,
            interval,
            dateOffset,
            startOffset,
            loggingLevel,
            runType: FetcherWrapper.collectorWords,
            objArr: this.collectors,
        });
    }

    addAggregator({
        runFunction,
        interval,
        dateOffset = 0,
        startOffset = 0,
        loggingLevel = 1,
    }: {
        runFunction: { (date: Date): Promise<number> };
        interval: number;
        dateOffset?: number;
        startOffset?: number;
        loggingLevel?: number;
    }) {
        this.createGeneric({
            runFunction,
            interval,
            dateOffset,
            startOffset,
            loggingLevel,
            runType: FetcherWrapper.aggregatorWords,
            objArr: this.aggregators,
        });
    }

    addDeleter({
        runFunction,
        interval,
        dateOffset = 0,
        startOffset = 0,
        loggingLevel = 1,
    }: {
        runFunction: { (date: Date): Promise<number> };
        interval: number;
        dateOffset?: number;
        startOffset?: number;
        loggingLevel?: number;
    }) {
        this.createGeneric({
            runFunction,
            interval,
            dateOffset,
            startOffset,
            loggingLevel,
            runType: FetcherWrapper.deleterWords,
            objArr: this.deleters,
        });
    }
}
