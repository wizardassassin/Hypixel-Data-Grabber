export class DateWrapper {
    static secToMs = 1000;

    static minToMs = DateWrapper.secToMs * 60;

    static hourToMs = DateWrapper.minToMs * 60;

    static dayToMs = DateWrapper.hourToMs * 24;

    static flatUTCTime(
        date: Date | number = new Date(),
        flatFunc: (x: number) => number,
        interval: number
    ) {
        const milliseconds = Number(date);
        const newMilliseconds = flatFunc(milliseconds / interval) * interval;
        return new Date(newMilliseconds);
    }

    static flatUTCMinutes(
        date: Date | number = new Date(),
        flatFunc: (x: number) => number,
        interval: number
    ) {
        return DateWrapper.flatUTCTime(
            date,
            flatFunc,
            interval * DateWrapper.minToMs
        );
    }

    static flatUTCHours(
        date: Date | number = new Date(),
        flatFunc: (x: number) => number,
        interval: number
    ) {
        return DateWrapper.flatUTCTime(
            date,
            flatFunc,
            interval * DateWrapper.hourToMs
        );
    }

    static flatUTCDays(
        date: Date | number = new Date(),
        flatFunc: (x: number) => number,
        interval: number
    ) {
        return DateWrapper.flatUTCTime(
            date,
            flatFunc,
            interval * DateWrapper.dayToMs
        );
    }

    static floorUTCMinutes(date: Date | number = new Date()) {
        return DateWrapper.flatUTCMinutes(date, Math.floor, 1);
    }

    static roundUTCMinutes(date: Date | number = new Date()) {
        return DateWrapper.flatUTCMinutes(date, Math.round, 1);
    }

    static floorUTCFiveMinutes(date: Date | number = new Date()) {
        return DateWrapper.flatUTCMinutes(date, Math.floor, 5);
    }

    static roundUTCFiveMinutes(date: Date | number = new Date()) {
        return DateWrapper.flatUTCMinutes(date, Math.round, 5);
    }

    static floorUTCHours(date: Date | number = new Date()) {
        return DateWrapper.flatUTCHours(date, Math.floor, 1);
    }

    static roundUTCHours(date: Date | number = new Date()) {
        return DateWrapper.flatUTCHours(date, Math.round, 1);
    }

    static floorUTCDays(date: Date | number = new Date()) {
        return DateWrapper.flatUTCDays(date, Math.floor, 1);
    }

    static roundUTCDays(date: Date | number = new Date()) {
        return DateWrapper.flatUTCDays(date, Math.round, 1);
    }

    static createOffset({
        day = 0,
        hour = 0,
        min = 0,
        sec = 0,
        scaler = 1,
    }: {
        day?: number;
        hour?: number;
        min?: number;
        sec?: number;
        scaler?: number;
    }) {
        return (
            (DateWrapper.dayToMs * day +
                DateWrapper.hourToMs * hour +
                DateWrapper.minToMs * min +
                DateWrapper.secToMs * sec) *
            scaler
        );
    }

    static modifyDate(date: Date | number = new Date(), offset: number) {
        return new Date(Number(date) + offset);
    }
}
