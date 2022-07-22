"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDurationString = exports.getClockTime = exports.getNumberOfDaysSince = exports.getTomorrow = exports.toCalendarDate = exports.getTodayDateString = exports.sleep = void 0;
function sleep(milliseconds) {
    return new Promise(r => setTimeout(r, milliseconds));
}
exports.sleep = sleep;
/**
 * @returns e.g. "12/25/2020"
 */
function getTodayDateString() {
    return new Date().toLocaleDateString('en-US');
}
exports.getTodayDateString = getTodayDateString;
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
//# sourceMappingURL=time.js.map