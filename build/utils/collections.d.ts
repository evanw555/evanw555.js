/**
 * For some list of keys and some list of values of equal length, returns
 * a map with each key mapped to its respective value.
 * @param keys List of unique keys of length N
 * @param values List of values of length N
 * @returns The constructed map
 */
export declare function toMap<T>(keys: string[], values: T[]): Record<string, T>;
/**
 * Returns a new map including key-value pairs from the input map,
 * but only those entries which don't violate the provided filtering parameters.
 * @param input Input map
 */
export declare function filterMap<T>(input: Record<string, T>, options?: {
    keyWhitelist?: string[];
    keyBlacklist?: string[];
    valueBlacklist?: T[];
    valueWhitelist?: T[];
    fn?: (k: string, v: T) => boolean;
}): Record<string, T>;
/**
 * Returns a new map including key-value pairs from the input map,
 * but with entries omitted if their value matches the blacklisted value parameter.
 * @param input Input map
 * @param blacklistedValue Value used to determine which entries to omit
 */
export declare function filterValueFromMap<T>(input: Record<string, T>, blacklistedValue: T): Record<string, T>;
/**
 * Given a list of objects, create TODOOOO
 * @param inputs List of input objects
 * @param property The object property to group by
 * @returns Mapping containing lists of input objects keyed by the value of the property
 */
export declare function groupByProperty<T extends Object, K extends keyof T>(inputs: T[], property: K): Record<string, T[]>;
type ScoringFunction<T> = (x: T) => number;
/**
 * Given a list of keys and a scoring function, return the keys that maximize the scoring function.
 * @param keys List of keys
 * @param valueFn The scoring function that takes an input key
 * @returns The keys that maximize the scoring function
 */
export declare function getMaxKeys<T>(keys: T[], valueFn: ScoringFunction<T>): T[];
/**
 * Given a list of keys and a scoring function, return the key that maximizes the scoring function.
 * In the case of a tie, the earliest key in the list takes precedence.
 * @param keys List of keys
 * @param valueFn The scoring function that takes an input key
 * @returns The key that maximizes the scoring function
 */
export declare function getMaxKey<T>(keys: T[], valueFn: ScoringFunction<T>): T;
/**
 * Given a list of keys and a scoring function, return the keys that minimize the scoring function.
 * @param keys List of keys
 * @param valueFn The scoring function that takes an input key
 * @returns The keys that minimize the scoring function
 */
export declare function getMinKeys<T>(keys: T[], valueFn: ScoringFunction<T>): T[];
/**
 * Given a list of keys and a scoring function, return the key that minimizes the scoring function.
 * In the case of a tie, the earliest key in the list takes precedence.
 * @param keys List of keys
 * @param valueFn The scoring function that takes an input key
 * @returns The key that minimizes the scoring function
 */
export declare function getMinKey<T>(keys: T[], valueFn: ScoringFunction<T>): T;
/**
 * Given a list of keys and a scoring function, return a copy of the key list sorted in ascending order using the scoring function.
 * If a list of scoring functions are provided, sort by the first function that does not produce a tie for a given pair of keys.
 * @param keys List of keys
 * @param valueFn The scoring function (or list of functions) that takes an input key
 * @returns List of keys sorted by their score in ascending order
 */
export declare function getSortedKeys<T>(keys: T[], valueFn: ScoringFunction<T> | ScoringFunction<T>[]): T[];
/**
 * Given some source list, returns a copy shortened to the desired length by removing elements at even intervals.
 * @param values Source list
 * @param newLength Desired length of shortened list
 * @param options.padding Keeps the first N and last N values in the input list as-is (where N is the padding option)
 * @returns Copy of the source list shortened to the desired length
 */
export declare function getEvenlyShortened<T>(values: T[], newLength: number, options?: {
    padding?: number;
}): T[];
/**
 * Returns the size of the provided object.
 * @param map Input object
 */
export declare function getObjectSize(map: Object): number;
/**
 * Returns true if the provided object is empty.
 * @param map Input object
 */
export declare function isObjectEmpty(map: Object): boolean;
/**
 * Given a map with numeric values, increment a given property regardless of whether it exists.
 * If that value reaches zero, it will be deleted.
 * @param map Map with numeric values
 * @param key The property to be incremented
 * @param amount The amount to increment
 */
export declare function incrementProperty<K extends string>(map: Record<K, number>, key: K, amount: number): void;
/**
 * Adds any number of numeric objects together by adding all their properties.
 * @param objects Objects with numeric values
 * @returns New object containing the sum of all properties by name
 */
export declare function addObjects(...objects: Record<string, number>[]): Record<string, number>;
export {};
//# sourceMappingURL=collections.d.ts.map