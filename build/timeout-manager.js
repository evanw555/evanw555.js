"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeoutManager = exports.PastTimeoutStrategy = void 0;
const time_1 = require("./utils/time");
/**
 * How to handle a timeout which is registered for sometime in the past.
 * The action will be taken on timeout registration (e.g. when the timeouts are loaded).
 */
var PastTimeoutStrategy;
(function (PastTimeoutStrategy) {
    /**
     * Delete and clear the timeout.
     */
    PastTimeoutStrategy["Delete"] = "DELETE";
    /**
     * Invoke the timeout as soon as possible.
     */
    PastTimeoutStrategy["Invoke"] = "INVOKE";
    /**
     * Postpone the timeout by an hour.
     */
    PastTimeoutStrategy["IncrementHour"] = "INCREMENT_HOUR";
    /**
     * Postone the timeout by 24 hours.
     */
    PastTimeoutStrategy["IncrementDay"] = "INCREMENT_DAY";
})(PastTimeoutStrategy = exports.PastTimeoutStrategy || (exports.PastTimeoutStrategy = {}));
/**
 * T represents the timeout type. Can either be a generic string or a string-backed enum.
 */
class TimeoutManager {
    constructor(storage, callbacks, options) {
        var _a;
        this.storage = storage;
        this.callbacks = callbacks;
        this.timeouts = {};
        this.instances = {};
        this.timeoutFileName = (_a = options === null || options === void 0 ? void 0 : options.fileName) !== null && _a !== void 0 ? _a : TimeoutManager.DEFAULT_FILE_NAME;
        this.previousTimeoutId = 0;
    }
    getNextTimeoutId() {
        // Iterate to next available ID and return
        while (this.timeouts.hasOwnProperty(++this.previousTimeoutId)) { }
        return this.previousTimeoutId.toString();
    }
    loadTimeouts() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Loading up timeouts...');
            let timeouts = {};
            try {
                timeouts = yield this.storage.readJson(this.timeoutFileName);
            }
            catch (err) { }
            for (const id of Object.keys(timeouts)) {
                const timeout = timeouts[id];
                const date = new Date(timeout.date.trim());
                yield this.addTimeoutForId(id, timeout.type, date, timeout.options);
            }
            ;
            yield this.dumpTimeouts();
        });
    }
    dumpTimeouts() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.storage.write(this.timeoutFileName, JSON.stringify(this.timeouts, null, 2));
            console.log(`Dumped timeouts as ${JSON.stringify(this.timeouts)}`);
        });
    }
    addTimeoutForId(id, type, date, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const pastStrategy = (_a = options.pastStrategy) !== null && _a !== void 0 ? _a : TimeoutManager.DEFAULT_PAST_STRATEGY;
            const millisUntilMessage = date.getTime() - new Date().getTime();
            if (millisUntilMessage > 2147483647) {
                // If the timeout is too far in the future (more than 24 days, max 32-bit signed int), save it but don't schedule timeout
                this.timeouts[id] = {
                    type,
                    date: date.toJSON(),
                    options
                };
                // Schedule a timeout to try again in 10 days
                this.instances[id] = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    // First, un-associate this ID with this timeout instance
                    delete this.instances[id];
                    // Then, try to add the timeout again
                    yield this.addTimeoutForId(id, type, date, options);
                }), 1000 * 60 * 60 * 24 * 10);
                console.log(`Timeout for \`${type}\` at ${date.toLocaleString()} is too far out, trying again in 10 days`);
            }
            else if (millisUntilMessage > 0) {
                // If timeout is in the future, then set a timeout for it as per usual
                this.timeouts[id] = {
                    type,
                    date: date.toJSON(),
                    options
                };
                // Schedule and save the actual timeout
                this.instances[id] = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    // First, un-associate this ID with this timeout instance
                    delete this.instances[id];
                    // Perform the actual callback
                    yield this.callbacks[type](options.arg);
                    // Clear the timeout info
                    delete this.timeouts[id];
                    // Dump the timeouts
                    yield this.dumpTimeouts();
                }), millisUntilMessage);
                console.log(`Added timeout for \`${type}\` at ${date.toLocaleString()}`);
            }
            else if (pastStrategy === PastTimeoutStrategy.Invoke) {
                // Timeout is in the past, so just invoke the callback now
                yield this.callbacks[type](options.arg);
            }
            else if (pastStrategy === PastTimeoutStrategy.IncrementDay) {
                // Timeout is in the past, so try again with the day incremented
                const tomorrow = new Date(date);
                tomorrow.setDate(tomorrow.getDate() + 1);
                console.log(`Incrementing timeout for \`${type}\` at ${date.toLocaleString()} by 1 day`);
                yield this.addTimeoutForId(id, type, tomorrow, options);
            }
            else if (pastStrategy === PastTimeoutStrategy.IncrementHour) {
                // Timeout is in the past, so try again with the hour incremented
                const nextHour = new Date(date);
                nextHour.setHours(nextHour.getHours() + 1);
                console.log(`Incrementing timeout for \`${type}\` at ${date.toLocaleString()} by 1 hour`);
                yield this.addTimeoutForId(id, type, nextHour, options);
            }
            else if (pastStrategy === PastTimeoutStrategy.Delete) {
                // Timeout is in the past, so just delete the timeout altogether
                console.log(`Deleted timeout for \`${type}\` at ${date.toLocaleString()}`);
            }
        });
    }
    /**
     * Registers a timeout.
     * @param type
     * @param date
     * @param options
     * @returns The ID of the newly scheduled timeout
     */
    registerTimeout(type, date, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = this.getNextTimeoutId();
            yield this.addTimeoutForId(id, type, date, options);
            yield this.dumpTimeouts();
            return id;
        });
    }
    /**
     * Cancels an existing timeout.
     * @param id ID of the timeout to be canceled
     * @throws Error if no timeout with this ID is currently scheduled
     */
    cancelTimeout(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.instances[id] || !this.timeouts[id]) {
                throw new Error(`Cannot cancel non-existent timeout with ID ${id}`);
            }
            // Actually cancel the timeout in the Node runtime
            clearTimeout(this.instances[id]);
            // Delete it from the revelant maps
            delete this.instances[id];
            delete this.timeouts[id];
            // Dump the timeouts
            yield this.dumpTimeouts();
        });
    }
    /**
     * Postpones an existing timeout to a later date.
     * @param id ID of the timeout to be postponed
     * @param value Either the new date (as a Date object), or a number (in milliseconds) indicating how long to postpone
     * @throws Error if no timeout with this ID is currently scheduled
     */
    postponeTimeout(id, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.instances[id] || !this.timeouts[id]) {
                throw new Error(`Cannot postpone non-existent timeout with ID ${id}`);
            }
            const timeout = this.timeouts[id];
            // Cancel the existing timeout
            yield this.cancelTimeout(id);
            // Determine the new date
            const previousDate = new Date(timeout.date);
            let newDate;
            if (value instanceof Date) {
                newDate = value;
            }
            else {
                newDate = new Date(previousDate.getTime() + value);
            }
            // Add and schedule the new timeout
            yield this.addTimeoutForId(id, timeout.type, newDate, timeout.options);
            // Dump the updated timeouts
            yield this.dumpTimeouts();
        });
    }
    hasTimeoutWithId(id) {
        return id in this.timeouts && id in this.instances;
    }
    getDateForTimeoutWithId(id) {
        if (id in this.timeouts) {
            return new Date(this.timeouts[id].date);
        }
    }
    /**
     * @returns the date of some currently scheduled timeout of the given type, or undefined if none exists.
     */
    getDateForTimeoutWithType(type) {
        for (const timeoutInfo of Object.values(this.timeouts)) {
            if (timeoutInfo.type === type) {
                return new Date(timeoutInfo.date.trim());
            }
        }
    }
    /**
     * @returns true if a timeout with the given type is currently scheduled.
     */
    hasTimeoutWithType(type) {
        return Object.values(this.timeouts).some(t => t.type === type);
    }
    /**
     * @returns list of human-readable strings representing each timeout (in ascending date order)
     */
    toStrings() {
        return Object.values(this.timeouts)
            .sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime())
            .map(timeout => {
            var _a;
            return `**${(0, time_1.getRelativeDateTimeString)(new Date(timeout.date))}:** \`${timeout.type}(${(_a = JSON.stringify(timeout.options.arg)) !== null && _a !== void 0 ? _a : ''}) -> ${timeout.options.pastStrategy}\``;
        });
    }
}
exports.TimeoutManager = TimeoutManager;
TimeoutManager.DEFAULT_PAST_STRATEGY = PastTimeoutStrategy.Delete;
TimeoutManager.DEFAULT_FILE_NAME = 'timeouts.json';
//# sourceMappingURL=timeout-manager.js.map