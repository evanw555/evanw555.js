"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s = exports.getPercentChangeString = exports.getUnambiguousQuantitiesWithUnits = exports.getQuantityWithUnits = exports.canonicalizeText = void 0;
/**
 * Canonicalizes a string of text. For example `"Hello, World!""` becomes `"helloworld"`.
 * @returns The given text in lower-case with all non-alphanumeric characters removed
 */
function canonicalizeText(text) {
    return text.toLowerCase()
        // Remove non-alphanumeric characters
        .replace(/[^0-9a-zA-Z]/g, '');
}
exports.canonicalizeText = canonicalizeText;
/**
 * Produces a string representing the abbreviated form of a given number, using units such as "k" and "m".
 * @param quantity Input value
 * @param fractionDigits Number of decimal places to fix to
 * @returns A string representing the abbreviated quantity
 */
function getQuantityWithUnits(quantity, fractionDigits = 1) {
    if (quantity < 1000) {
        return quantity.toString();
    }
    else if (quantity < 1000000) {
        return (quantity / 1000).toFixed(fractionDigits) + 'k';
    }
    else if (quantity < 1000000000) {
        return (quantity / 1000000).toFixed(fractionDigits) + 'm';
    }
    else {
        return (quantity / 1000000000).toFixed(fractionDigits) + 'b';
    }
}
exports.getQuantityWithUnits = getQuantityWithUnits;
/**
 * Given a list of numbers, produces a list of strings representing the abbreviated forms of these numbers with each being unique and ambiguous.
 * If any two values are formatted to the same string, format them again with another decimal place.
 * // TODO: This bottoms out at 3 decimal places by default, but make this configurable.
 * @param quantity Input value
 * @param fractionDigits Number of decimal places to fix to
 * @returns A string representing the abbreviated quantity
 */
function getUnambiguousQuantitiesWithUnits(quantities) {
    const n = quantities.length;
    const result = new Array(n).fill('');
    const complete = new Array(n).fill(false);
    const MAX_DECIMAL_PLACES = 3;
    for (let digits = 1; digits <= MAX_DECIMAL_PLACES; digits++) {
        // One pass to regenerate each incomplete string with a certain number of digits
        for (let i = 0; i < n; i++) {
            if (!complete[i]) {
                result[i] = getQuantityWithUnits(quantities[i], digits);
            }
        }
        // Second pass to mark all the unique ones as complete
        for (let i = 0; i < n; i++) {
            const formatted = result[i];
            const unique = result.filter(x => x === formatted).length === 1;
            complete[i] = unique;
        }
    }
    return result;
}
exports.getUnambiguousQuantitiesWithUnits = getUnambiguousQuantitiesWithUnits;
/**
 * Given two numbers, return a formatted string representing the percentage change from the first to the second.
 * @param before The first number
 * @param after The second number
 * @param fractionDigits Number of decimal places to fix to
 * @returns The explicitly positive or negative number representing the percentage change
 */
function getPercentChangeString(before, after, fractionDigits = 1) {
    const diff = after - before;
    return `${diff < 0 ? '' : '+'}${(100 * diff / before).toFixed(fractionDigits)}%`;
}
exports.getPercentChangeString = getPercentChangeString;
/**
 * Returns an "s" if the provided number is NOT equal to 1.
 * This is useful for conditional pluralization of strings, which happens often.
 * @param n Some number
 * @returns "s" if that number is anything but 1
 */
function s(n) {
    return n === 1 ? '' : 's';
}
exports.s = s;
//# sourceMappingURL=text.js.map