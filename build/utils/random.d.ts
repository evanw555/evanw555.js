/**
 * @param lo Lower bound (inclusive)
 * @param hi Upper bound (exclusive)
 * @param bates Bates distribution value
 * @return integer in the range [lo, hi)
 */
export declare function randInt(lo: number, hi: number, bates?: number): number;
/**
 * @param choices Array of objects to choose from
 * @returns A random element from the input array
 */
export declare function randChoice<T>(...choices: T[]): T;
/**
 * Shuffles an array in-place.
 * @param input Input array
 * @returns Shuffled array
 */
export declare function shuffle<T>(input: T[]): T[];
/**
 * @returns True with probability p
 */
export declare function chance(p: number): boolean;
/**
 * Given some input number, rounds to the nearest integer using the remainder as the probability.
 * For example, rounding `9.9` by chance is 90% likely to round up to `10` rather than down to `9`.
 * @param input Some input number that may contain a fraction
 * @returns The input number rounded to the nearest integer by chance
 */
export declare function roundByChance(input: number): number;
export declare function shuffleWithDependencies(input: string[], dependencies: Record<string, string[]>): string[];
/**
 * Given a list of strings, assign each input a target such that the graph of targets form one large cycle.
 * @param input List of strings to be shuffled
 * @param options.whitelists For a given input string, a list of strings they'd prefer to have as their target
 * @param options.blacklists For a given input string, a list of strings they'd prefer to not have as their target
 * @param options.deterministic If true, ensure the result for a given set of inputs and options is always the same
 */
export declare function shuffleCycle(input: string[], options?: {
    whitelists?: Record<string, string[]>;
    blacklists?: Record<string, string[]>;
    deterministic?: boolean;
}): string[];
/**
 * For a list of keys and a list of values, randomly assign some number of values to each key in a way that guarantees each value a similar number of assignments.
 * @param keys List of keys
 * @param values List of values
 * @param options.valuesPerKey How many values should be assigned to each key
 * @param options.deterministic If true, the results of this function will be the same every time (no randomness)
 * @returns A mapping from each key to its list of assigned values
 */
export declare function getRandomlyDistributedAssignments(keys: string[], values: string[], options?: {
    valuesPerKey?: number;
    deterministic?: boolean;
}): Record<string, string[]>;
//# sourceMappingURL=random.d.ts.map