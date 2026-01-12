import { getNumberBetween } from "./misc";
import { randInt } from "./random";

export function sleep(milliseconds: number): Promise<void> {
    return new Promise(r => setTimeout(r, milliseconds));
}

/**
 * @returns e.g. "12/25/2020"
 */
export function getTodayDateString(): string {
    return toDateString(new Date());
}

/**
 * @param date input date
 * @returns e.g. "12/25/2020"
 */
export function toDateString(date: Date): string {
    return date.toLocaleDateString('en-US', { dateStyle: 'short' });
}

/**
 * @param date input date
 * @returns e.g. "12/25"
 */
export function toCalendarDate(date: Date): string {
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * @returns The current date-time plus 24 hours
 */
export function getTomorrow(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
}


// TODO: Write tests for this
/**
 * Given two dates, returns true if they're on the same day.
 * If either are null or undefined, then it returns false by default.
 * @param a First date (or unix timestamp)
 * @param b Second date (or unix timestamp)
 * @returns True if these two dates are on the same day
 */
export function isSameDay(a: Date | number | null | undefined, b: Date | number | null | undefined): boolean {
    if (!a || !b) {
        return false;
    }
    const d1 = new Date(a);
    const d2 = new Date(b);
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

/**
 * Given some date, returns true if it's today.
 * @param date Date (or unix timestamp)
 * @returns True if the provided date is today
 */
export function isToday(date: Date | number | null | undefined): boolean {
    return isSameDay(date, new Date());
}

/**
 * Given some date, returns true if it's tomorrow.
 * @param date Date (or unix timestamp)
 * @returns True if the provided date is tomorrow
 */
export function isTomorrow(date: Date | number | null | undefined): boolean {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return isSameDay(date, tomorrow);
}

/**
 * Given some date, returns true if it falls on the day after tomorrow.
 * @param date Date (or unix timestamp)
 * @returns True if the provided date is the day after tomorrow
 */
export function isDayAfterTomorrow(date: Date | number | null | undefined): boolean {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return isSameDay(date, tomorrow);
}

/**
 * Given some date, returns true if it's some time in the past.
 * @param date Date (or unix timestamp)
 * @returns True if the provided date is in the past
 */
export function isPast(date: Date | number | null | undefined): boolean {
    if (!date) {
        return false;
    }
    const d = new Date(date);
    return d.getTime() < new Date().getTime();
}

/**
 * Gets the number of days between the provided dates or date strings (e.g. 1/20/2022)
 * @param start date (or date string, or Unix timestamp)
 * @param end date (or date string, or Unix timestamp)
 * @returns number of days between those dates
 */
export function getNumberOfDaysBetween(start: Date | number | string, end: Date | number | string): number {
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Gets the number of days since the provided date or date string (e.g. 1/20/2022)
 * @param start date (or date string, or Unix timestamp)
 * @returns number of days since that date
 */
export function getNumberOfDaysSince(date: Date | number | string): number {
    return getNumberOfDaysBetween(date, new Date());
}

/**
 * Gets the number of days until the provided date or date string (e.g. 1/20/2022)
 * @param end date (or date string, or Unix timestamp)
 * @returns number of days until that date
 */
export function getNumberOfDaysUntil(end: Date | number | string): number {
    return getNumberOfDaysBetween(new Date(), end);
}

/**
 * Computes a date between the two provided dates, as specified by the optional "along" factor.
 * If the user wants a date 0.5 "along", it will return a date exactly halfway between the two.
 * If the user wants a date 0.25 "along", it will return a date a quarter of the way between the two.
 * @param start the min date
 * @param end the max date
 * @param along the "along" factor specifying where the "between" point is (defaults to 0.5)
 * @returns a date between the provided dates
 */
export function getDateBetween(start: Date, end: Date, along: number = 0.5): Date {
    return new Date(getNumberBetween(start.getTime(), end.getTime(), along));
}

/**
 * Gets a random date between the two provided dates, with an optional Bates distribution.
 * @param start the min date
 * @param end the max date
 * @param options.minAlong min "along" factor where the "between" point can be (defaults to 0)
 * @param options.maxAlong max "along" factor where the "between" point can be (defaults to 1)
 * @param options.bates Bates distribution value (defaults to 1)
 * @returns a date between the provided dates
 */
 export function getRandomDateBetween(start: Date, end: Date, options?: { minAlong?: number, maxAlong?: number, bates?: number }): Date {
    const minAlong = options?.minAlong ?? 0;
    const maxAlong = options?.maxAlong ?? 1;
    const bates = options?.bates ?? 1;

    const loTime = getNumberBetween(start.getTime(), end.getTime(), minAlong);
    const hiTime = getNumberBetween(start.getTime(), end.getTime(), maxAlong);
    return new Date(randInt(loTime, hiTime, bates));
}

/**
 * @returns The current 24-hour time in the "HH:MM" format (e.g. "06:30", "17:14")
 */
export function getClockTime(): string {
    const now: Date = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
}

/**
 * @param date input date
 * @returns The 12-hour time of the date (e.g. "5:40 PM")
 */
export function toTimeString(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour12: true, timeStyle: 'short' });
}

/**
 * @param date input date
 * @returns The day of the week (e.g. "Tuesday")
 */
export function getDayOfWeekName(date: Date): string {
    const weekday: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekday[date.getDay()];
}

/**
 * @param date input date
 * @returns The month (e.g. "February")
 */
export function getMonthName(date: Date): string {
    const monthNames: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName: string = monthNames[date.getMonth()];
    return monthName;
}

/**
 * For some duration value, return an English expression representing that duration.
 * @param milliseconds the duration in milliseconds
 * @returns a phrase representing the provided duration
 */
export function getDurationString(milliseconds: number) {
    if (milliseconds === 0) {
        return 'no time at all';
    }
    if (milliseconds === 1) {
        return '1 millisecond';
    }
    if (milliseconds < 1000) {
        return `${milliseconds} milliseconds`;
    }
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds === 1) {
        return '1 second';
    }
    if (seconds < 60) {
        return `${seconds} seconds`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) {
        return '1 minute';
    }
    if (minutes < 60) {
        return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours === 1) {
        return '1 hour';
    }
    if (hours < 48) {
        return `${hours} hours`;
    }
    const days = Math.floor(hours / 24);
    return `${days} days`;
}

/**
 * For some duration value, return a succint string representation of that exact duration.
 *
 * TODO: Should we show ms?
 *
 * @param milliseconds the duration in milliseconds
 * @returns a string representing the precise time in a succint format (without ms)
 */
export function getPreciseDurationString(milliseconds: number): string {
    if (milliseconds < 1000) {
        return '0s';
    }

    let result = '';

    const seconds = Math.floor(milliseconds / 1000);
    if (seconds % 60 !== 0) {
        result = `${seconds % 60}s`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes % 60 !== 0) {
        result = `${minutes % 60}m${result}`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours % 24 !== 0) {
        result = `${hours % 24}h${result}`;
    }

    const days = Math.floor(hours / 24);
    if (days % 7 !== 0) {
        result = `${days % 7}d${result}`;
    }

    const weeks = Math.floor(days / 7);
    if (weeks !== 0) {
        result = `${weeks}w${result}`;
    }

    return result;
}

/**
 * Creates a human-readable representation of the given date compared to right now.
 * (e.g. "5:40 PM", "tomorrow at 5:40 PM", "Tuesday at 5:40 PM", "12/25/2020 at 5:40 PM")
 */
export function getRelativeDateTimeString(date: Date): string {
    const now: Date = new Date();

    // If the provided date is in the past, show something dumb
    if (date.getTime() < now.getTime()) {
        return 'in the past';
    }

    // If the provided date is more than a week away (or in a different month), render the whole date (to keep things simple)
    const daysUntilDate: number = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysUntilDate >= 6 || now.getMonth() !== date.getMonth()) {
        return `${toDateString(date)} at ${toTimeString(date)}`;
    }

    // If the provided date is today, render only the time
    if (now.getDate() === date.getDate()) {
        return toTimeString(date);
    }

    // If the provided date is tomorrow, render it as such
    if (date.getDate() === now.getDate() + 1) {
        return `tomorrow at ${toTimeString(date)}`;
    }

    // Otherwise, render the DOW
    return `${getDayOfWeekName(date)} at ${toTimeString(date)}`;
}
