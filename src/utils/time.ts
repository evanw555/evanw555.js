export function sleep(milliseconds: number): Promise<void> {
    return new Promise(r => setTimeout(r, milliseconds));
}

/**
 * @returns e.g. "12/25/2020"
 */
 export function getTodayDateString(): string {
    return new Date().toLocaleDateString('en-US');
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
 * @returns The current 24-hour time in the "HH:MM" format (e.g. "06:30", "17:14")
 */
export function getClockTime(): string {
    const now: Date = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
}