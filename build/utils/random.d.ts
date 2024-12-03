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
//# sourceMappingURL=random.d.ts.map