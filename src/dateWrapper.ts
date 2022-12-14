export class DateWrapper {
    static secToMs = 1000;

    static minToMs = DateWrapper.secToMs * 60;

    static hourToMs = DateWrapper.minToMs * 60;

    static dayToMs = DateWrapper.hourToMs * 24;

    static roundQuarterHour(date: Date | number = new Date()) {
        const returnDate = new Date(date);
        const newMinutes = Math.round(returnDate.getUTCMinutes() / 15) * 15;
        returnDate.setUTCMinutes(newMinutes, 0, 0);
        return returnDate;
    }

    static floorUTCFiveMinutes(date: Date | number = new Date()) {
        const returnDate = new Date(date);
        const newMinutes = Math.floor(returnDate.getUTCMinutes() / 5) * 5;
        returnDate.setUTCMinutes(newMinutes, 0, 0);
        return returnDate;
    }

    static floorUTCMinutes(date: Date | number = new Date()) {
        const returnDate = new Date(date);
        returnDate.setUTCSeconds(0, 0);
        return returnDate;
    }

    static floorUTCHours(date: Date | number = new Date()) {
        const returnDate = new Date(date);
        returnDate.setUTCMinutes(0, 0, 0);
        return returnDate;
    }

    static floorUTCDays(date: Date | number = new Date()) {
        const returnDate = new Date(date);
        returnDate.setUTCHours(0, 0, 0, 0);
        return returnDate;
    }
}
