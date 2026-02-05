/**
 * @param input List of strings
 * @param options.conjunction The conjunction to use for lists of 3 or more (default: "and")
 * @param options.bold Whether each element in the list should be bolded (using Discord message styling)
 * @returns The given list of strings joined in a way that is grammatically correct in English
 */
export declare function naturalJoin(input: string[], options?: {
    conjunction?: string;
    bold?: boolean;
}): string;
/**
 * For a given list of strings, return a list representing this list with identical consecutive elements collapsed.
 *
 * @param input list of strings
 * @param transformer function that returns the representation of some list element given the number of times it appears consecutively
 * @returns a new list of strings with identical consecutive strings collapsed
 */
export declare function collapseRedundantStrings(input: string[], transformer: (element: string, n: number) => string): string[];
/**
 * For some object, return some particular subnode specified by the provided selector.
 *
 * e.g. getSelectedNode({'someArray': ['a', 'b', 'c']}, 'someArray.1') === 'b'
 *
 * e.g. getSelectedNode({'x': {'y': {'z': 123}}}, 'x.y.z') === 123
 *
 * @param root the root node, the primary input
 * @param selector the dot-delimited selector
 * @returns the subnode of the input node specified by the provided selector
 */
export declare function getSelectedNode(root: any, selector?: string, options?: {
    ignoreCase?: boolean;
}): any;
/**
 * Take a given input float and return it rounded to some fixed number of decimal places.
 * @param input the float
 * @param places number of decimal places (defaults to 2)
 * @returns the float rounded to some fixed number of decimal places
 */
export declare function toFixed(input: number, places?: number): number;
/**
 * Take a given input float and return it at a fixed number of decimal places.
 * @param input the float
 * @param places number of decimal places (defaults to 2)
 * @returns the float string at a fixed number of decimal places
 */
export declare function toFixedString(input: number, places?: number): string;
/**
 * @param input some string
 * @returns the input string with the first letter capitalized
 */
export declare function capitalize(input: string): string;
/**
 * Given some non-negative number, returns an alphabetical representation (e.g. 0 is "A", 1 is "B", 25 is "Z", 26 is "AA")
 * @param input the input number
 * @returns the input number encoded using upper-case letters
 */
export declare function toLetterId(input: number): string;
/**
 * Given an alphabetical encoding of some number, return the parsed value (e.g. "A" is 0, "B" is 1, "Z" is 25, "AA" is 26)
 * @param input the input string
 * @returns the input string decoded into the number it represents
 */
export declare function fromLetterId(input: string): number;
/**
 * For some input string, attempt to pluralize it.
 * Cannot handle complex pluralizations or phrases with verbs.
 *
 * TODO: Make this work on upper-case words.
 *
 * @param input text to pluralize
 * @returns the pluralized input text
 */
export declare function pluralize(input: string): string;
/**
 * Given some input text, split it into a list naturally separated by paragraph/punctuation.
 * @param text text to naturally split
 * @param maxLength max length of each resulting segment
 * @returns list of the naturally split text segments
 */
export declare function splitTextNaturally(text: string, maxLength: number): string[];
/**
 * For some numerical rank (e.g. 1) return the English rank string (e.g. "1st").
 * @param rank a numerical rank
 * @returns The given rank expressed as a string (e.g. 1st, 2nd, 3rd, 11th, 21st)
 */
export declare function getRankString(rank: number): string;
/**
 * Computes a number between the two provided numbers, as specified by the optional "along" factor.
 * If the user wants a number 0.5 "along", it will return a number exactly halfway between the two.
 * If the user wants a number 0.25 "along", it will return a number a quarter of the way between the two.
 * @param a the low number
 * @param b the high number
 * @param along the "along" factor specifying where the "between" point is (defaults to 0.5)
 * @returns a number between the provided number
 */
export declare function getNumberBetween(a: number, b: number, along?: number): number;
/**
 * Computes a score to indicate how many of the unique words in the source text are repeated in the input text.
 * For example, source text "hello, world" repeats completely in "MY WORLD IS A HELLO" and returns a score of 1.
 * For example, source text "one two three four" repeats partially in "Hello four" and returns a score of 0.25.
 * @param text The input text
 * @param source The source text that the input text may be borrowing from
 * @returns Word repetition score in the range [0, 1]
 */
export declare function getWordRepetitionScore(text: string, source: string): number;
//# sourceMappingURL=misc.d.ts.map