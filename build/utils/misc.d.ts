/**
 * @param input List of strings
 * @returns The given list of strings joined in a way that is grammatically correct in English
 */
export declare function naturalJoin(input: string[], conjunction?: string): string;
/**
 * For some object, return some particular subnode specified by the provided selector.
 *
 * e.g. getSelectedNode({'someArray': ['a', 'b', 'c']}, 'someArray.1') === 'b'
 *
 * e.g. getSelectedNode({'x': {'y': {'z': 123}}}, 'x.y.z') === 123
 *
 * @param root the root node, the primary input
 * @param selector the dot-delimited selector
 * @returns the subnode of the input node specified by the provided selector
 */
export declare function getSelectedNode(root: any, selector?: string): any;
/**
 * Take a given input float and return it rounded to some fixed number of decimal places.
 * @param input the float
 * @param places number of decimal places (defaults to 2)
 * @returns the float rounded to some fixed number of decimal places
 */
export declare function toFixed(input: number, places?: number): number;
/**
 * Take a given input float and return it at a fixed number of decimal places.
 * @param input the float
 * @param places number of decimal places (defaults to 2)
 * @returns the float string at a fixed number of decimal places
 */
export declare function toFixedString(input: number, places?: number): string;
/**
 * @param input some string
 * @returns the input string with the first letter capitalized
 */
export declare function capitalize(input: string): string;
/**
 * Given some non-negative number, returns an alphabetical representation (e.g. 0 is "A", 1 is "B", 25 is "Z", 26 is "AA")
 * @param input the input number
 * @returns the input number encoded using upper-case letters
 */
export declare function toLetterId(input: number): string;
/**
 * For some input string, attempt to pluralize it.
 * Cannot handle complex pluralizations or phrases with verbs.
 *
 * TODO: Make this work on upper-case words.
 *
 * @param input text to pluralize
 * @returns the pluralized input text
 */
export declare function pluralize(input: string): string;
/**
 * For some numerical rank (e.g. 1) return the English rank string (e.g. "1st").
 * @param rank a numerical rank
 * @returns The given rank expressed as a string (e.g. 1st, 2nd, 3rd, 11th, 21st)
 */
export declare function getRankString(rank: number): string;
/**
 * Returns a new map including key-value pairs from the input map,
 * but with entries omitted if their value matches the blacklisted value parameter.
 * @param input input map
 * @param blacklistedValue value used to determine which entries to omit
 */
export declare function filterValueFromMap<T>(input: Record<string, T>, blacklistedValue: T): Record<string, T>;
/**
 * For some list of keys and some list of values of equal length, returns
 * a map with each key mapped to its respective value.
 * @param keys List of unique keys of length N
 * @param values List of values of length N
 * @returns The constructed map
 */
export declare function toMap<T>(keys: string[], values: T[]): Record<string, T>;
//# sourceMappingURL=misc.d.ts.map