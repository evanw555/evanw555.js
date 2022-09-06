/**
 * @param lo Lower bound (inclusive)
 * @param hi Upper bound (exclusive)
 * @param bates Bates distribution value
 * @return integer in the range [lo, hi)
 */
 export function randInt(lo: number, hi: number, bates: number = 1): number {
    let total: number = 0;
    const b = Math.floor(bates);
    for (let i = 0; i < b; i++) {
        total += Math.floor(Math.random() * (hi - lo)) + lo;
    }
    return Math.floor(total / b);
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
