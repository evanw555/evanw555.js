"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementProperty = exports.isObjectEmpty = exports.getObjectSize = exports.getEvenlyShortened = exports.getMinKey = exports.getMaxKey = exports.groupByProperty = exports.filterValueFromMap = exports.filterMap = exports.toMap = void 0;
/**
 * For some list of keys and some list of values of equal length, returns
 * a map with each key mapped to its respective value.
 * @param keys List of unique keys of length N
 * @param values List of values of length N
 * @returns The constructed map
 */
function toMap(keys, values) {
    if (keys.length !== values.length) {
        throw new Error(`Cannot create a map with ${keys.length} keys and ${values.length} values!`);
    }
    if (keys.length !== new Set(keys).size) {
        throw new Error(`Cannot create a map with duplicate keys!`);
    }
    const result = {};
    for (let i = 0; i < keys.length; i++) {
        result[keys[i]] = values[i];
    }
    return result;
}
exports.toMap = toMap;
/**
 * Returns a new map including key-value pairs from the input map,
 * but only those entries which don't violate the provided filtering parameters.
 * @param input Input map
 */
function filterMap(input, options) {
    const result = {};
    for (const [key, value] of Object.entries(input)) {
        // Apply key whitelist
        if ((options === null || options === void 0 ? void 0 : options.keyWhitelist) && !options.keyWhitelist.includes(key)) {
            continue;
        }
        // Apply key blacklist
        if ((options === null || options === void 0 ? void 0 : options.keyBlacklist) && options.keyBlacklist.includes(key)) {
            continue;
        }
        // Apply value whitelist
        if ((options === null || options === void 0 ? void 0 : options.valueWhitelist) && !options.valueWhitelist.includes(value)) {
            continue;
        }
        // Apply value blacklist
        if ((options === null || options === void 0 ? void 0 : options.valueBlacklist) && options.valueBlacklist.includes(value)) {
            continue;
        }
        // Apply filter
        if ((options === null || options === void 0 ? void 0 : options.fn) && !options.fn(key, value)) {
            continue;
        }
        // Add the entry to the new map
        result[key] = value;
    }
    return result;
}
exports.filterMap = filterMap;
/**
 * Returns a new map including key-value pairs from the input map,
 * but with entries omitted if their value matches the blacklisted value parameter.
 * @param input Input map
 * @param blacklistedValue Value used to determine which entries to omit
 */
function filterValueFromMap(input, blacklistedValue) {
    return filterMap(input, { valueBlacklist: [blacklistedValue] });
}
exports.filterValueFromMap = filterValueFromMap;
/**
 * Given a list of objects, create TODOOOO
 * @param inputs List of input objects
 * @param property The object property to group by
 * @returns Mapping containing lists of input objects keyed by the value of the property
 */
function groupByProperty(inputs, property) {
    var _a;
    const result = {};
    for (const input of inputs) {
        const key = (_a = input[property]) === null || _a === void 0 ? void 0 : _a.toString();
        if (key === undefined) {
            throw new Error(`Cannot group by undefined property "${property.toString()}"`);
        }
        if (result[key] === undefined) {
            result[key] = [];
        }
        result[key].push(input);
    }
    return result;
}
exports.groupByProperty = groupByProperty;
/**
 * Given a list of keys and a scoring function, return the key that maximizes the scoring function.
 * In the case of a tie, the earliest key in the list takes precedence.
 * @param keys List of keys
 * @param valueFn The scoring function that takes an input key
 * @returns The key that maximizes the scoring function
 */
function getMaxKey(keys, valueFn) {
    let maxValue = Number.MIN_SAFE_INTEGER;
    let bestKey = keys[0];
    for (const key of keys) {
        const value = valueFn(key);
        if (value > maxValue) {
            bestKey = key;
            maxValue = value;
        }
    }
    return bestKey;
}
exports.getMaxKey = getMaxKey;
/**
 * Given a list of keys and a scoring function, return the key that minimizes the scoring function.
 * In the case of a tie, the earliest key in the list takes precedence.
 * @param keys List of keys
 * @param valueFn The scoring function that takes an input key
 * @returns The key that minimizes the scoring function
 */
function getMinKey(keys, valueFn) {
    let minValue = Number.MAX_SAFE_INTEGER;
    let bestKey = keys[0];
    for (const key of keys) {
        const value = valueFn(key);
        if (value < minValue) {
            bestKey = key;
            minValue = value;
        }
    }
    return bestKey;
}
exports.getMinKey = getMinKey;
/**
 * Given some source list, returns a copy shortened to the desired length by removing elements at even intervals.
 * @param values Source list
 * @param newLength Desired length of shortened list
 * @param options.padding Keeps the first N and last N values in the input list as-is (where N is the padding option)
 * @returns Copy of the source list shortened to the desired length
 */
function getEvenlyShortened(values, newLength, options) {
    if (newLength === 0) {
        return [];
    }
    if (newLength < 0) {
        throw new Error('Cannot shorten list to a negative length');
    }
    if (options === null || options === void 0 ? void 0 : options.padding) {
        const padding = options === null || options === void 0 ? void 0 : options.padding;
        if (padding < 0) {
            throw new Error('Cannot shorten list with negative padding option');
        }
        if (padding * 2 > newLength) {
            throw new Error(`Cannot fit padding of size ${padding} in front and back of a list of length ${newLength}`);
        }
        return [...values.slice(0, padding), ...getEvenlyShortened(values.slice(padding, -padding), newLength - 2 * padding), ...values.slice(-padding)];
    }
    const result = [];
    const n = values.length;
    const m = newLength - 1;
    for (let i = 0; i < m; i++) {
        const sourceIndex = Math.floor(i * n / m);
        result[i] = values[sourceIndex];
    }
    result[m] = values[n - 1];
    return result;
}
exports.getEvenlyShortened = getEvenlyShortened;
/**
 * Returns the size of the provided object.
 * @param map Input object
 */
function getObjectSize(map) {
    return Object.keys(map).length;
}
exports.getObjectSize = getObjectSize;
/**
 * Returns true if the provided object is empty.
 * @param map Input object
 */
function isObjectEmpty(map) {
    return getObjectSize(map) === 0;
}
exports.isObjectEmpty = isObjectEmpty;
/**
 * Given a map with numeric values, increment a given property regardless of whether it exists.
 * If that value reaches zero, it will be deleted.
 * @param map Map with numeric values
 * @param key The property to be incremented
 * @param amount The amount to increment
 */
function incrementProperty(map, key, amount) {
    var _a;
    // Add value to this map entry (default to zero)
    map[key] = ((_a = map[key]) !== null && _a !== void 0 ? _a : 0) + amount;
    // Delete if the value is now zero
    if (map[key] === 0) {
        delete map[key];
    }
}
exports.incrementProperty = incrementProperty;
//# sourceMappingURL=collections.js.map