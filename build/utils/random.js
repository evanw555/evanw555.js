"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randChoice = exports.randInt = void 0;
/**
 * @param lo Lower bound (inclusive)
 * @param hi Upper bound (exclusive)
 * @return integer in the range [lo, hi)
 */
function randInt(lo, hi) {
    return Math.floor(Math.random() * (hi - lo)) + lo;
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
//# sourceMappingURL=random.js.map