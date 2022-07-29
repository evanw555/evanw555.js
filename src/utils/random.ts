/**
 * @param lo Lower bound (inclusive)
 * @param hi Upper bound (exclusive)
 * @return integer in the range [lo, hi)
 */
 export function randInt(lo: number, hi: number): number {
    return Math.floor(Math.random() * (hi - lo)) + lo;
};

/**
 * @param choices Array of objects to choose from
 * @returns A random element from the input array
 */
export function randChoice<T>(...choices: T[]): T {
    return choices[randInt(0, choices.length)];
};

/**
 * Shuffles an array in-place.
 * @param input Input array
 * @returns Shuffled array
 */
export function shuffle<T>(input: T[]): T[] {
    return input.sort((x, y) => Math.random() - Math.random());
}
