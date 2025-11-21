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
 * Gets the number of days since the provided date or date string (e.g. 1/20/2022)
 * @param start date or date string
 * @returns number of days since that date
 */
export declare function getNumberOfDaysSince(start: string | Date): number;
/**
 * Gets the number of days until the provided date or date string (e.g. 1/20/2022)
 * @param end date or date string
 * @returns number of days until that date
 */
export declare function getNumberOfDaysUntil(end: string | Date): number;
/**
 * Given two dates, returns true if they're on the same day.
 * If either are null or undefined, then it returns false by default.
 * @param a First date (or unix timestamp)
 * @param b Second date (or unix timestamp)
 * @returns True if these two dates are on the same day
 */
export declare function isSameDay(a: Date | number | null | undefined, b: Date | number | null | undefined): boolean;
/**
 * Given some date, returns true if it's today.
 * @param date Date (or unix timestamp)
 * @returns True if the provided date is today
 */
export declare function isToday(date: Date | number | null | undefined): boolean;
/**
 * Given some date, returns true if it's tomorrow.
 * @param date Date (or unix timestamp)
 * @returns True if the provided date is tomorrow
 */
export declare function isTomorrow(date: Date | number | null | undefined): boolean;
/**
 * Given some date, returns true if it falls on the day after tomorrow.
 * @param date Date (or unix timestamp)
 * @returns True if the provided date is the day after tomorrow
 */
export declare function isDayAfterTomorrow(date: Date | number | null | undefined): boolean;
/**
 * Gets the number of days between the provided dates or date strings (e.g. 1/20/2022)
 * @param start date or date string
 * @param end date or date string
 * @returns number of days between those dates
 */
export declare function getNumberOfDaysBetween(start: string | Date, end: string | Date): number;
/**
 * Computes a date between the two provided dates, as specified by the optional "along" factor.
 * If the user wants a date 0.5 "along", it will return a date exactly halfway between the two.
 * If the user wants a date 0.25 "along", it will return a date a quarter of the way between the two.
 * @param start the min date
 * @param end the max date
 * @param along the "along" factor specifying where the "between" point is (defaults to 0.5)
 * @returns a date between the provided dates
 */
export declare function getDateBetween(start: Date, end: Date, along?: number): Date;
/**
 * Gets a random date between the two provided dates, with an optional Bates distribution.
 * @param start the min date
 * @param end the max date
 * @param options.minAlong min "along" factor where the "between" point can be (defaults to 0)
 * @param options.maxAlong max "along" factor where the "between" point can be (defaults to 1)
 * @param options.bates Bates distribution value (defaults to 1)
 * @returns a date between the provided dates
 */
export declare function getRandomDateBetween(start: Date, end: Date, options?: {
    minAlong?: number;
    maxAlong?: number;
    bates?: number;
}): Date;
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
export declare function getDayOfWeekName(date: Date): string;
/**
 * @param date input date
 * @returns The month (e.g. "February")
 */
export declare function getMonthName(date: Date): string;
/**
 * For some duration value, return an English expression representing that duration.
 * @param milliseconds the duration in milliseconds
 * @returns a phrase representing the provided duration
 */
export declare function getDurationString(milliseconds: number): string;
/**
 * For some duration value, return a succint string representation of that exact duration.
 *
 * TODO: Should we show ms?
 *
 * @param milliseconds the duration in milliseconds
 * @returns a string representing the precise time in a succint format (without ms)
 */
export declare function getPreciseDurationString(milliseconds: number): string;
/**
 * Creates a human-readable representation of the given date compared to right now.
 * (e.g. "5:40 PM", "tomorrow at 5:40 PM", "Tuesday at 5:40 PM", "12/25/2020 at 5:40 PM")
 */
export declare function getRelativeDateTimeString(date: Date): string;
//# sourceMappingURL=time.d.ts.map