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

/**
 * Gets the number of days since the provided date string (e.g. 1/20/2022)
 * @param start date string
 * @returns number of days since that date
 */
export function getNumberOfDaysSince(start: string): number {
    const startDate: Date = new Date(start);
    const todayDate: Date = new Date(getTodayDateString());
    return Math.round((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
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
    return new Date(start.getTime() + along * (end.getTime() - start.getTime()));
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
export function toDayOfWeekString(date: Date): string {
    const weekday: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekday[date.getDay()];
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
    return `${toDayOfWeekString(date)} at ${toTimeString(date)}`;
}
