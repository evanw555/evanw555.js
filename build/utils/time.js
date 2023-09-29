"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelativeDateTimeString = exports.getPreciseDurationString = exports.getDurationString = exports.toDayOfWeekString = exports.toTimeString = exports.getClockTime = exports.getRandomDateBetween = exports.getDateBetween = exports.getNumberOfDaysBetween = exports.getNumberOfDaysUntil = exports.getNumberOfDaysSince = exports.getTomorrow = exports.toCalendarDate = exports.toDateString = exports.getTodayDateString = exports.sleep = void 0;
const misc_1 = require("./misc");
const random_1 = require("./random");
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
 * Gets the number of days since the provided date or date string (e.g. 1/20/2022)
 * @param start date or date string
 * @returns number of days since that date
 */
function getNumberOfDaysSince(start) {
    return getNumberOfDaysBetween(start, new Date());
}
exports.getNumberOfDaysSince = getNumberOfDaysSince;
/**
 * Gets the number of days until the provided date or date string (e.g. 1/20/2022)
 * @param end date or date string
 * @returns number of days until that date
 */
function getNumberOfDaysUntil(end) {
    return getNumberOfDaysBetween(new Date(), end);
}
exports.getNumberOfDaysUntil = getNumberOfDaysUntil;
/**
 * Gets the number of days between the provided dates or date strings (e.g. 1/20/2022)
 * @param start date or date string
 * @param end date or date string
 * @returns number of days between those dates
 */
function getNumberOfDaysBetween(start, end) {
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}
exports.getNumberOfDaysBetween = getNumberOfDaysBetween;
/**
 * Computes a date between the two provided dates, as specified by the optional "along" factor.
 * If the user wants a date 0.5 "along", it will return a date exactly halfway between the two.
 * If the user wants a date 0.25 "along", it will return a date a quarter of the way between the two.
 * @param start the min date
 * @param end the max date
 * @param along the "along" factor specifying where the "between" point is (defaults to 0.5)
 * @returns a date between the provided dates
 */
function getDateBetween(start, end, along = 0.5) {
    return new Date((0, misc_1.getNumberBetween)(start.getTime(), end.getTime(), along));
}
exports.getDateBetween = getDateBetween;
/**
 * Gets a random date between the two provided dates, with an optional Bates distribution.
 * @param start the min date
 * @param end the max date
 * @param options.minAlong min "along" factor where the "between" point can be (defaults to 0)
 * @param options.maxAlong max "along" factor where the "between" point can be (defaults to 1)
 * @param options.bates Bates distribution value (defaults to 1)
 * @returns a date between the provided dates
 */
function getRandomDateBetween(start, end, options) {
    var _a, _b, _c;
    const minAlong = (_a = options === null || options === void 0 ? void 0 : options.minAlong) !== null && _a !== void 0 ? _a : 0;
    const maxAlong = (_b = options === null || options === void 0 ? void 0 : options.maxAlong) !== null && _b !== void 0 ? _b : 1;
    const bates = (_c = options === null || options === void 0 ? void 0 : options.bates) !== null && _c !== void 0 ? _c : 1;
    const loTime = (0, misc_1.getNumberBetween)(start.getTime(), end.getTime(), minAlong);
    const hiTime = (0, misc_1.getNumberBetween)(start.getTime(), end.getTime(), maxAlong);
    return new Date((0, random_1.randInt)(loTime, hiTime, bates));
}
exports.getRandomDateBetween = getRandomDateBetween;
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
 * For some duration value, return a succint string representation of that exact duration.
 *
 * TODO: Should we show ms?
 *
 * @param milliseconds the duration in milliseconds
 * @returns a string representing the precise time in a succint format (without ms)
 */
function getPreciseDurationString(milliseconds) {
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
exports.getPreciseDurationString = getPreciseDurationString;
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