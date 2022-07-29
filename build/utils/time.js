"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelativeDateTimeString = exports.getDurationString = exports.toDayOfWeekString = exports.toTimeString = exports.getClockTime = exports.getNumberOfDaysSince = exports.getTomorrow = exports.toCalendarDate = exports.toDateString = exports.getTodayDateString = exports.sleep = void 0;
function sleep(milliseconds) {
    return new Promise(r => setTimeout(r, milliseconds));
}
exports.sleep = sleep;
/**
 * @returns e.g. "12/25/2020"
 */
function getTodayDateString() {
    return toDateString(new Date());
}
exports.getTodayDateString = getTodayDateString;
/**
 * @param date input date
 * @returns e.g. "12/25/2020"
 */
function toDateString(date) {
    return date.toLocaleDateString('en-US', { dateStyle: 'short' });
}
exports.toDateString = toDateString;
/**
 * @param date input date
 * @returns e.g. "12/25"
 */
function toCalendarDate(date) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
}
exports.toCalendarDate = toCalendarDate;
/**
 * @returns The current date-time plus 24 hours
 */
function getTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
}
exports.getTomorrow = getTomorrow;
/**
 * Gets the number of days since the provided date string (e.g. 1/20/2022)
 * @param start date string
 * @returns number of days since that date
 */
function getNumberOfDaysSince(start) {
    const startDate = new Date(start);
    const todayDate = new Date(getTodayDateString());
    return Math.round((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}
exports.getNumberOfDaysSince = getNumberOfDaysSince;
/**
 * @returns The current 24-hour time in the "HH:MM" format (e.g. "06:30", "17:14")
 */
function getClockTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
}
exports.getClockTime = getClockTime;
/**
 * @param date input date
 * @returns The 12-hour time of the date (e.g. "5:40 PM")
 */
function toTimeString(date) {
    return date.toLocaleTimeString('en-US', { hour12: true, timeStyle: 'short' });
}
exports.toTimeString = toTimeString;
/**
 * @param date input date
 * @returns The day of the week (e.g. "Tuesday")
 */
function toDayOfWeekString(date) {
    const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekday[date.getDay()];
}
exports.toDayOfWeekString = toDayOfWeekString;
/**
 * For some duration value, return an English expression representing that duration.
 * @param milliseconds the duration in milliseconds
 * @returns a phrase representing the provided duration
 */
function getDurationString(milliseconds) {
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
exports.getDurationString = getDurationString;
/**
 * Creates a human-readable representation of the given date compared to right now.
 * (e.g. "5:40 PM", "tomorrow at 5:40 PM", "Tuesday at 5:40 PM", "12/25/2020 at 5:40 PM")
 */
function getRelativeDateTimeString(date) {
    const now = new Date();
    // If the provided date is in the past, show something dumb
    if (date.getTime() < now.getTime()) {
        return 'in the past';
    }
    // If the provided date is more than a week away (or in a different month), render the whole date (to keep things simple)
    const daysUntilDate = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
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
exports.getRelativeDateTimeString = getRelativeDateTimeString;
//# sourceMappingURL=time.js.map