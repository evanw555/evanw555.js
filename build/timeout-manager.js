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
        var _a, _b;
        this.storage = storage;
        // Allow the user to pass in a map-of-callbacks, but transform it to a master typed callback for internal use
        if (callbacks instanceof Function) {
            this.callbacks = callbacks;
        }
        else {
            this.callbacks = (_type, _arg) => __awaiter(this, void 0, void 0, function* () {
                yield callbacks[_type](_arg);
            });
        }
        this.onError = (_a = options === null || options === void 0 ? void 0 : options.onError) !== null && _a !== void 0 ? _a : (() => __awaiter(this, void 0, void 0, function* () { }));
        this.timeouts = {};
        this.instances = {};
        this.timeoutFileName = (_b = options === null || options === void 0 ? void 0 : options.fileName) !== null && _b !== void 0 ? _b : TimeoutManager.DEFAULT_FILE_NAME;
        this.previousTimeoutId = 0;
    }
    getNextTimeoutId() {
        // Iterate to next available ID and return
        while (this.timeouts.hasOwnProperty(++this.previousTimeoutId)) { }
        return this.previousTimeoutId.toString();
    }
    loadTimeouts() {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log('Loading up timeouts...');
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
            // console.log(`Dumped timeouts as ${JSON.stringify(this.timeouts)}`);
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
                    // First, clear the timeout info and un-associate this ID with this timeout instance
                    delete this.timeouts[id];
                    delete this.instances[id];
                    // Then, try to add the timeout again with the same ID, options, etc.
                    yield this.addTimeoutForId(id, type, date, options);
                    // Dump the timeouts
                    yield this.dumpTimeouts();
                }), 1000 * 60 * 60 * 24 * 10);
                // console.log(`Timeout for \`${type}\` at ${date.toLocaleString()} is too far out, trying again in 10 days`);
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
                    // First, clear the timeout info and un-associate this ID with this timeout instance
                    delete this.timeouts[id];
                    delete this.instances[id];
                    // Perform the actual callback
                    yield this.invokeTimeout(id, type, options);
                    // Dump the timeouts
                    yield this.dumpTimeouts();
                }), millisUntilMessage);
                // console.log(`Added timeout for \`${type}\` at ${date.toLocaleString()}`);
            }
            else if (pastStrategy === PastTimeoutStrategy.Invoke) {
                // Timeout is in the past, so just invoke the callback now
                yield this.invokeTimeout(id, type, options);
            }
            else if (pastStrategy === PastTimeoutStrategy.IncrementDay) {
                // Timeout is in the past, so try again with the day incremented
                const tomorrow = new Date(date);
                tomorrow.setDate(tomorrow.getDate() + 1);
                // console.log(`Incrementing timeout for \`${type}\` at ${date.toLocaleString()} by 1 day`);
                yield this.addTimeoutForId(id, type, tomorrow, options);
            }
            else if (pastStrategy === PastTimeoutStrategy.IncrementHour) {
                // Timeout is in the past, so try again with the hour incremented
                const nextHour = new Date(date);
                nextHour.setHours(nextHour.getHours() + 1);
                // console.log(`Incrementing timeout for \`${type}\` at ${date.toLocaleString()} by 1 hour`);
                yield this.addTimeoutForId(id, type, nextHour, options);
            }
            else if (pastStrategy === PastTimeoutStrategy.Delete) {
                // Timeout is in the past, so just delete the timeout altogether
                // console.log(`Deleted timeout for \`${type}\` at ${date.toLocaleString()}`);
            }
        });
    }
    /**
     * Safely invokes a given timeout, reporting any errors back to the user via the error callback.
     * This method is safe and thus can be assumed to never fail.
     * @param id ID of the timeout to be invoked
     * @param type Type of the timeout to be invoked
     * @param options Options of the timeout to be invoked
     */
    invokeTimeout(id, type, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // Invoke the callback safely so that errors can be reported back to the user
            try {
                yield this.callbacks(type, options.arg);
            }
            catch (err) {
                // This method failing is fatal, so ensure the error callback is also safe
                try {
                    yield this.onError(id, type, err);
                }
                catch (err) {
                    // TODO: Can we report this in a better way?
                    console.log(`Failed to invoke both the callback and the error handler for \`${type}\` timeout with ID \`${id}\`: \`${err}\``);
                }
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
     * Cancels an existing timeout. This method will fail if the timeout is mid-invocation or nonexistent.
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
     * Cancels all the timeouts of a given type. Any timeouts that are mid-invocation will not be cancelled.
     * @param type Type of timeouts to cancel
     * @returns The IDs of all canceled timeouts
     */
    cancelTimeoutsWithType(type) {
        return __awaiter(this, void 0, void 0, function* () {
            const ids = this.getTimeoutIdsWithType(type);
            for (const id of ids) {
                yield this.cancelTimeout(id);
            }
            return ids;
        });
    }
    /**
     * Postpones an existing timeout to a later date. This method will fail if the timeout is mid-invocation or nonexistent.
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
    /**
     * Postpones all existing timeouts of a given type to a later date. Any timeouts that are mid-invocation will not be postponed.
     * @param type Type of timeouts to postpone
     * @param value Either the new date (as a Date object), or a number (in milliseconds) indicating how long to postpone
     * @returns The IDs of all postpones timeouts
     */
    postponeTimeoutsWithType(type, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const ids = this.getTimeoutIdsWithType(type);
            for (const id of ids) {
                yield this.postponeTimeout(id, value);
            }
            return ids;
        });
    }
    /**
     * Determines if this manager has an existing timeout with the provided ID.
     * @param id Timeout ID
     * @returns True if a timeout with the given ID is scheduled and has not yet begun invocation
     */
    hasTimeoutWithId(id) {
        return id in this.timeouts && id in this.instances;
    }
    /**
     * Gets the date of the scheduled timeout with a given ID, or undefined if none exists.
     * @param id Timeout ID
     * @returns The date of the corresponding timeout, or undefined if it doesn't exist (or has begun invocation).
     */
    getDateForTimeoutWithId(id) {
        if (id in this.timeouts) {
            return new Date(this.timeouts[id].date);
        }
    }
    /**
     * Gets the date of some timeout with the provided type, or undefined if none exists.
     * Note that if there are multiple timeouts with this type, there is no guarantee which one will be selected.
     * @returns the date of some currently scheduled timeout of the given type, or undefined if none exists.
     */
    getDateForTimeoutWithType(type) {
        for (const id of this.getTimeoutIdsWithType(type)) {
            return new Date(this.timeouts[id].date.trim());
        }
    }
    /**
     * Determines if there is at least one scheduled timeout with a given type that has not yet begun invocation.
     * @returns true if a timeout with the given type is currently scheduled.
     */
    hasTimeoutWithType(type) {
        return this.getTimeoutIdsWithType(type).length > 0;
    }
    getTimeoutIdsWithType(type) {
        return Object.keys(this.timeouts).filter(id => this.timeouts[id].type === type);
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