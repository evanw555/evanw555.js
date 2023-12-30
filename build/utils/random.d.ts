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
//# sourceMappingURL=random.d.ts.map