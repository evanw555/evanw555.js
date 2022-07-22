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
        this.timeoutFileName = (_a = options === null || options === void 0 ? void 0 : options.fileName) !== null && _a !== void 0 ? _a : TimeoutManager.DEFAULT_FILE_NAME;
        this.previousTimeoutId = 0;
    }
    getNextTimeoutId() {
        // Iterate to next available ID and return
        while (this.timeouts.hasOwnProperty(++this.previousTimeoutId)) { }
        return this.previousTimeoutId.toString();
    }
    loadTimeouts() {
        var _a;
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
                yield this.addTimeoutForId(id, timeout.type, date, (_a = timeout.pastStrategy) !== null && _a !== void 0 ? _a : TimeoutManager.DEFAULT_PAST_STRATEGY);
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
    addTimeoutForId(id, type, date, pastStrategy) {
        return __awaiter(this, void 0, void 0, function* () {
            const millisUntilMessage = date.getTime() - new Date().getTime();
            if (millisUntilMessage > 0) {
                // If timeout is in the future, then set a timeout for it as per usual
                this.timeouts[id] = {
                    type,
                    date: date.toJSON(),
                    pastStrategy
                };
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    // Perform the actual callback
                    yield this.callbacks[type]();
                    // Clear the timeout info
                    delete this.timeouts[id];
                    // Dump the timeouts
                    yield this.dumpTimeouts();
                }), millisUntilMessage);
                console.log(`Added timeout for \`${type}\` at ${date.toLocaleString()}`);
            }
            else if (pastStrategy === PastTimeoutStrategy.Invoke) {
                // Timeout is in the past, so just invoke the callback now
                yield this.callbacks[type]();
            }
            else if (pastStrategy === PastTimeoutStrategy.IncrementDay) {
                // Timeout is in the past, so try again with the day incremented
                const tomorrow = new Date(date);
                tomorrow.setDate(tomorrow.getDate() + 1);
                console.log(`Incrementing timeout for \`${type}\` at ${date.toLocaleString()} by 1 day`);
                yield this.addTimeoutForId(id, type, tomorrow, pastStrategy);
            }
            else if (pastStrategy === PastTimeoutStrategy.IncrementHour) {
                // Timeout is in the past, so try again with the hour incremented
                const nextHour = new Date(date);
                nextHour.setHours(nextHour.getHours() + 1);
                console.log(`Incrementing timeout for \`${type}\` at ${date.toLocaleString()} by 1 hour`);
                yield this.addTimeoutForId(id, type, nextHour, pastStrategy);
            }
            else if (pastStrategy === PastTimeoutStrategy.Delete) {
                // Timeout is in the past, so just delete the timeout altogether
                console.log(`Deleted timeout for \`${type}\` at ${date.toLocaleString()}`);
            }
        });
    }
    /**
     * Registers a timeout
     * @param type
     * @param date
     * @param pastStrategy
     */
    registerTimeout(type, date, pastStrategy) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = this.getNextTimeoutId();
            yield this.addTimeoutForId(id, type, date, pastStrategy);
            yield this.dumpTimeouts();
        });
    }
    /**
     * @returns the date of some currently scheduled timeout of the given type, or undefined if none exists.
     */
    getDate(type) {
        for (const timeoutInfo of Object.values(this.timeouts)) {
            if (timeoutInfo.type === type) {
                return new Date(timeoutInfo.date.trim());
            }
        }
    }
    /**
     * @returns true if a timeout with the given type is currently scheduled.
     */
    hasTimeout(type) {
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
            return `\`${timeout.type}\`: ${new Date(timeout.date).toLocaleString()} (\`${(_a = timeout.pastStrategy) !== null && _a !== void 0 ? _a : 'N/A'}\`)`;
        });
    }
}
exports.TimeoutManager = TimeoutManager;
TimeoutManager.DEFAULT_PAST_STRATEGY = PastTimeoutStrategy.Delete;
TimeoutManager.DEFAULT_FILE_NAME = 'timeouts.json';
//# sourceMappingURL=timeout-manager.js.map