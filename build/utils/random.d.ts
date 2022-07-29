/**
 * @param lo Lower bound (inclusive)
 * @param hi Upper bound (exclusive)
 * @return integer in the range [lo, hi)
 */
export declare function randInt(lo: number, hi: number): number;
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
//# sourceMappingURL=random.d.ts.map