export declare function sleep(milliseconds: number): Promise<void>;
/**
 * @returns e.g. "12/25/2020"
 */
export declare function getTodayDateString(): string;
/**
 * @param date input date
 * @returns e.g. "12/25/2020"
 */
export declare function toDateString(date: Date): string;
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
 * @param date input date
 * @returns The 12-hour time of the date (e.g. "5:40 PM")
 */
export declare function toTimeString(date: Date): string;
/**
 * @param date input date
 * @returns The day of the week (e.g. "Tuesday")
 */
export declare function toDayOfWeekString(date: Date): string;
/**
 * For some duration value, return an English expression representing that duration.
 * @param milliseconds the duration in milliseconds
 * @returns a phrase representing the provided duration
 */
export declare function getDurationString(milliseconds: number): string;
/**
 * Creates a human-readable representation of the given date compared to right now.
 * (e.g. "5:40 PM", "tomorrow at 5:40 PM", "Tuesday at 5:40 PM", "12/25/2020 at 5:40 PM")
 */
export declare function getRelativeDateTimeString(date: Date): string;
//# sourceMappingURL=time.d.ts.map