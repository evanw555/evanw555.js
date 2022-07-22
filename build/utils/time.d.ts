export declare function sleep(milliseconds: number): Promise<void>;
/**
 * @returns e.g. "12/25/2020"
 */
export declare function getTodayDateString(): string;
/**
 * @param date input date
 * @returns e.g. "12/25"
 */
export declare function toCalendarDate(date: Date): string;
/**
 * @returns The current date-time plus 24 hours
 */
export declare function getTomorrow(): Date;
/**
 * Gets the number of days since the provided date string (e.g. 1/20/2022)
 * @param start date string
 * @returns number of days since that date
 */
export declare function getNumberOfDaysSince(start: string): number;
/**
 * @returns The current 24-hour time in the "HH:MM" format (e.g. "06:30", "17:14")
 */
export declare function getClockTime(): string;
/**
 * For some duration value, return an English expression representing that duration.
 * @param milliseconds the duration in milliseconds
 * @returns a phrase representing the provided duration
 */
export declare function getDurationString(milliseconds: number): string;
//# sourceMappingURL=time.d.ts.map