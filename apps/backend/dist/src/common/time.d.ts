export declare function zonedDayStart(date: string, tz: string): Date;
export declare function addDaysToDate(date: string, days: number): string;
export declare function zonedRange(from: string, to: string, tz: string): {
    gte: Date;
    lt: Date;
};
export declare function localDate(instant: Date, tz: string): string;
export declare function localMinuteAndDay(instant: Date, tz: string): {
    minute: number;
    day: number;
};
