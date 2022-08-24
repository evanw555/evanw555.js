"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffle = exports.randChoice = exports.randInt = void 0;
/**
 * @param lo Lower bound (inclusive)
 * @param hi Upper bound (exclusive)
 * @param bates Bates distribution value
 * @return integer in the range [lo, hi)
 */
function randInt(lo, hi, bates = 1) {
    let total = 0;
    const b = Math.floor(bates);
    for (let i = 0; i < b; i++) {
        total += Math.floor(Math.random() * (hi - lo)) + lo;
    }
    return total / b;
}
exports.randInt = randInt;
;
/**
 * @param choices Array of objects to choose from
 * @returns A random element from the input array
 */
function randChoice(...choices) {
    return choices[randInt(0, choices.length)];
}
exports.randChoice = randChoice;
;
/**
 * Shuffles an array in-place.
 * @param input Input array
 * @returns Shuffled array
 */
function shuffle(input) {
    return input.sort((x, y) => Math.random() - Math.random());
}
exports.shuffle = shuffle;
//# sourceMappingURL=random.js.map