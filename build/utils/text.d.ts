/**
 * Canonicalizes a string of text. For example `"Hello, World!""` becomes `"helloworld"`.
 * @returns The given text in lower-case with all non-alphanumeric characters removed
 */
export declare function canonicalizeText(text: string): string;
/**
 * Produces a string representing the abbreviated form of a given number, using units such as "k" and "m".
 * @param quantity Input value
 * @param fractionDigits Number of decimal places to fix to
 * @returns A string representing the abbreviated quantity
 */
export declare function getQuantityWithUnits(quantity: number, fractionDigits?: number): string;
/**
 * Given a list of numbers, produces a list of strings representing the abbreviated forms of these numbers with each being unique and ambiguous.
 * If any two values are formatted to the same string, format them again with another decimal place.
 * // TODO: This bottoms out at 3 decimal places by default, but make this configurable.
 * @param quantity Input value
 * @param fractionDigits Number of decimal places to fix to
 * @returns A string representing the abbreviated quantity
 */
export declare function getUnambiguousQuantitiesWithUnits(quantities: number[]): string[];
/**
 * Given two numbers, return a formatted string representing the percentage change from the first to the second.
 * @param before The first number
 * @param after The second number
 * @param fractionDigits Number of decimal places to fix to
 * @returns The explicitly positive or negative number representing the percentage change
 */
export declare function getPercentChangeString(before: number, after: number, fractionDigits?: number): string;
//# sourceMappingURL=text.d.ts.map