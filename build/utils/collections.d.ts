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
/**
 * Given a list of keys and a scoring function, return the key that maximizes the scoring function.
 * In the case of a tie, the earliest key in the list takes precedence.
 * @param keys List of keys
 * @param valueFn The scoring function that takes an input key
 * @returns The key that maximizes the scoring function
 */
export declare function getMaxKey<T>(keys: T[], valueFn: (x: T) => number): T;
/**
 * Given a list of keys and a scoring function, return the key that minimizes the scoring function.
 * In the case of a tie, the earliest key in the list takes precedence.
 * @param keys List of keys
 * @param valueFn The scoring function that takes an input key
 * @returns The key that minimizes the scoring function
 */
export declare function getMinKey<T>(keys: T[], valueFn: (x: T) => number): T;
/**
 * Given some source list, returns a copy shortened to the desired list by removing elements at even intervals.
 * @param values Source list
 * @param newLength Desired length of shortened list
 * @returns Copy of the source list shortened to the desired length
 */
export declare function getEvenlyShortened<T>(values: T[], newLength: number): T[];
//# sourceMappingURL=collections.d.ts.map