export class DateWrapper {
    static secToMs = 1000;

    static minToMs = DateWrapper.secToMs * 60;

    static hourToMs = DateWrapper.minToMs * 60;

    static dayToMs = DateWrapper.hourToMs * 24;

    static flatUTCMinutes(
        date: Date | number = new Date(),
        flatFunc: (x: number) => number,
        interval: number
    ) {
        const returnDate = new Date(date);
        const newMinutes =
            flatFunc(returnDate.getUTCMinutes() / interval) * interval;
        returnDate.setUTCMinutes(newMinutes, 0, 0);
        return returnDate;
    }

    static flatUTCHours(
        date: Date | number = new Date(),
        flatFunc: (x: number) => number,
        interval: number
    ) {
        const returnDate = new Date(date);
        const newHours =
            flatFunc(returnDate.getUTCHours() / interval) * interval;
        returnDate.setUTCHours(newHours, 0, 0, 0);
        return returnDate;
    }

    static flatUTCDays(
        date: Date | number = new Date(),
        flatFunc: (x: number) => number,
        interval: number
    ) {
        const returnDate = new Date(date);
        const newDays = flatFunc(returnDate.getUTCDate() / interval) * interval;
        returnDate.setUTCDate(newDays);
        returnDate.setUTCHours(0, 0, 0, 0);
        return returnDate;
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
}
