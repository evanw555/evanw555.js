
/**
 * For some list of keys and some list of values of equal length, returns
 * a map with each key mapped to its respective value.
 * @param keys List of unique keys of length N
 * @param values List of values of length N
 * @returns The constructed map
 */
export function toMap<T>(keys: string[], values: T[]): Record<string, T> {
    if (keys.length !== values.length) {
        throw new Error(`Cannot create a map with ${keys.length} keys and ${values.length} values!`);
    }
    if (keys.length !== new Set(keys).size) {
        throw new Error(`Cannot create a map with duplicate keys!`);
    }
    const result: Record<string, T> = {};
    for (let i = 0; i < keys.length; i++) {
        result[keys[i]] = values[i];
    }
    return result;
}

/**
 * Returns a new map including key-value pairs from the input map,
 * but only those entries which don't violate the provided filtering parameters.
 * @param input Input map
 */
export function filterMap<T>(input: Record<string, T>, options?: { keyWhitelist?: string[], keyBlacklist?: string[], valueBlacklist?: T[], valueWhitelist?: T[], fn?: (k: string, v: T) => boolean }): Record<string, T> {
    const result: Record<string, T> = {};
    for (const [key, value] of Object.entries(input)) {
        // Apply key whitelist
        if (options?.keyWhitelist && !options.keyWhitelist.includes(key)) {
            continue;
        }
        // Apply key blacklist
        if (options?.keyBlacklist && options.keyBlacklist.includes(key)) {
            continue;
        }
        // Apply value whitelist
        if (options?.valueWhitelist && !options.valueWhitelist.includes(value)) {
            continue;
        }
        // Apply value blacklist
        if (options?.valueBlacklist && options.valueBlacklist.includes(value)) {
            continue;
        }
        // Apply filter
        if (options?.fn && !options.fn(key, value)) {
            continue;
        }
        // Add the entry to the new map
        result[key] = value;
    }
    return result;
}

/**
 * Returns a new map including key-value pairs from the input map,
 * but with entries omitted if their value matches the blacklisted value parameter.
 * @param input Input map
 * @param blacklistedValue Value used to determine which entries to omit
 */
export function filterValueFromMap<T>(input: Record<string, T>, blacklistedValue: T): Record<string, T> {
    return filterMap(input, { valueBlacklist: [blacklistedValue] });
}

/**
 * Given a list of objects, create TODOOOO
 * @param inputs List of input objects
 * @param property The object property to group by
 * @returns Mapping containing lists of input objects keyed by the value of the property
 */
export function groupByProperty<T extends Object, K extends keyof T>(inputs: T[], property: K): Record<string, T[]> {
    const result: Record<string, T[]> = {};

    for (const input of inputs) {
        const key = input[property]?.toString();
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

/**
 * Given a list of keys and a scoring function, return the key that maximizes the scoring function.
 * In the case of a tie, the earliest key in the list takes precedence.
 * @param keys List of keys
 * @param valueFn The scoring function that takes an input key
 * @returns The key that maximizes the scoring function
 */
export function getMaxKey<T>(keys: T[], valueFn: (x: T) => number): T {
    let maxValue = Number.MIN_SAFE_INTEGER;
    let bestKey: T = keys[0];
    for (const key of keys) {
        const value = valueFn(key);
        if (value > maxValue) {
            bestKey = key;
            maxValue = value;
        }
    }
    return bestKey;
}

/**
 * Given a list of keys and a scoring function, return the key that minimizes the scoring function.
 * In the case of a tie, the earliest key in the list takes precedence.
 * @param keys List of keys
 * @param valueFn The scoring function that takes an input key
 * @returns The key that minimizes the scoring function
 */
export function getMinKey<T>(keys: T[], valueFn: (x: T) => number): T {
    let minValue = Number.MAX_SAFE_INTEGER;
    let bestKey: T = keys[0];
    for (const key of keys) {
        const value = valueFn(key);
        if (value < minValue) {
            bestKey = key;
            minValue = value;
        }
    }
    return bestKey;
}

/**
 * Given some source list, returns a copy shortened to the desired length by removing elements at even intervals.
 * @param values Source list
 * @param newLength Desired length of shortened list
 * @param options.padding Keeps the first N and last N values in the input list as-is (where N is the padding option)
 * @returns Copy of the source list shortened to the desired length
 */
export function getEvenlyShortened<T>(values: T[], newLength: number, options?: { padding?: number }): T[] {
    if (newLength === 0) {
        return [];
    }
    if (newLength < 0) {
        throw new Error('Cannot shorten list to a negative length');
    }
    if (options?.padding) {
        const padding = options?.padding;
        if (padding < 0) {
            throw new Error('Cannot shorten list with negative padding option');
        }
        if (padding * 2 > newLength) {
            throw new Error(`Cannot fit padding of size ${padding} in front and back of a list of length ${newLength}`);
        }
        return [...values.slice(0, padding), ...getEvenlyShortened(values.slice(padding, -padding), newLength - 2 * padding), ...values.slice(-padding)];
    }
    const result: T[] = [];
    const n = values.length;
    const m = newLength - 1;
    for (let i = 0; i < m; i++) {
        const sourceIndex = Math.floor(i * n / m);
        result[i] = values[sourceIndex];
    }
    result[m] = values[n - 1];
    return result;
}

/**
 * Returns the size of the provided object.
 * @param map Input object
 */
export function getObjectSize(map: Object): number {
    return Object.keys(map).length;
}

/**
 * Returns true if the provided object is empty.
 * @param map Input object
 */
export function isObjectEmpty(map: Object): boolean {
    return getObjectSize(map) === 0;
}

/**
 * Given a map with numeric values, increment a given property regardless of whether it exists.
 * If that value reaches zero, it will be deleted.
 * @param map Map with numeric values
 * @param key The property to be incremented
 * @param amount The amount to increment
 */
export function incrementProperty<K extends string>(map: Record<K, number>, key: K, amount: number) {
    // Add value to this map entry (default to zero)
    map[key] = (map[key] ?? 0) + amount;
    // Delete if the value is now zero
    if (map[key] === 0) {
        delete map[key];
    }
}
