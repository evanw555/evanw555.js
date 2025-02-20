"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWordRepetitionScore = exports.getNumberBetween = exports.getRankString = exports.splitTextNaturally = exports.pluralize = exports.fromLetterId = exports.toLetterId = exports.capitalize = exports.toFixedString = exports.toFixed = exports.getSelectedNode = exports.collapseRedundantStrings = exports.naturalJoin = void 0;
/**
 * @param input List of strings
 * @param options.conjunction The conjunction to use for lists of 3 or more (default: "and")
 * @param options.bold Whether each element in the list should be bolded (using Discord message styling)
 * @returns The given list of strings joined in a way that is grammatically correct in English
 */
function naturalJoin(input, options) {
    var _a;
    const conjunction = (_a = options === null || options === void 0 ? void 0 : options.conjunction) !== null && _a !== void 0 ? _a : 'and';
    const mapper = (options === null || options === void 0 ? void 0 : options.bold)
        ? (x) => `**${x}**`
        : (x) => x;
    if (!input || input.length === 0) {
        return '';
    }
    if (input.length === 1) {
        return mapper(input[0]);
    }
    if (input.length === 2) {
        return `${mapper(input[0])} ${conjunction} ${mapper(input[1])}`;
    }
    let result = '';
    for (let i = 0; i < input.length; i++) {
        if (i !== 0) {
            result += ', ';
        }
        if (i === input.length - 1) {
            result += `${conjunction} `;
        }
        result += mapper(input[i]);
    }
    return result;
}
exports.naturalJoin = naturalJoin;
/**
 * For a given list of strings, return a list representing this list with identical consecutive elements collapsed.
 *
 * @param input list of strings
 * @param transformer function that returns the representation of some list element given the number of times it appears consecutively
 * @returns a new list of strings with identical consecutive strings collapsed
 */
function collapseRedundantStrings(input, transformer) {
    const result = [];
    let n = 0;
    for (let i = 0; i < input.length; i++) {
        n++;
        const current = input[i];
        const next = input[i + 1];
        if (current !== next) {
            result.push(transformer(current, n));
            n = 0;
        }
    }
    return result;
}
exports.collapseRedundantStrings = collapseRedundantStrings;
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
function getSelectedNode(root, selector = '') {
    // If a selector was specified, select a specific part of the state
    const selectors = selector.split('.');
    let node = root;
    for (const s of selectors) {
        // Skip empty selectors (due to extra spaces)
        if (!s) {
            continue;
        }
        // Continue selection if the current node is an object/array, otherwise fail
        if (node instanceof Object && s in node) {
            node = node[s];
        }
        else {
            throw new Error(`\`${selector}\` is not a valid selector! (failed at \`${s}\`)`);
        }
    }
    return node;
}
exports.getSelectedNode = getSelectedNode;
/**
 * Take a given input float and return it rounded to some fixed number of decimal places.
 * @param input the float
 * @param places number of decimal places (defaults to 2)
 * @returns the float rounded to some fixed number of decimal places
 */
function toFixed(input, places = 2) {
    return parseFloat(toFixedString(input, places));
}
exports.toFixed = toFixed;
/**
 * Take a given input float and return it at a fixed number of decimal places.
 * @param input the float
 * @param places number of decimal places (defaults to 2)
 * @returns the float string at a fixed number of decimal places
 */
function toFixedString(input, places = 2) {
    return input.toFixed(places);
}
exports.toFixedString = toFixedString;
/**
 * @param input some string
 * @returns the input string with the first letter capitalized
 */
function capitalize(input) {
    return input.substring(0, 1).toUpperCase() + input.substring(1);
}
exports.capitalize = capitalize;
/**
 * Given some non-negative number, returns an alphabetical representation (e.g. 0 is "A", 1 is "B", 25 is "Z", 26 is "AA")
 * @param input the input number
 * @returns the input number encoded using upper-case letters
 */
function toLetterId(input) {
    return (input < 26 ? '' : toLetterId(Math.floor(input / 26) - 1)) + String.fromCharCode((input % 26) + 65);
}
exports.toLetterId = toLetterId;
/**
 * Given an alphabetical encoding of some number, return the parsed value (e.g. "A" is 0, "B" is 1, "Z" is 25, "AA" is 26)
 * @param input the input string
 * @returns the input string decoded into the number it represents
 */
function fromLetterId(input) {
    if (!input.match(/^[a-zA-Z]+$/g)) {
        throw new Error(`Cannot parse letter ID "${input}"`);
    }
    const lastDigitValue = input.toUpperCase().charCodeAt(input.length - 1) - 65;
    if (input.length === 1) {
        return lastDigitValue;
    }
    else {
        return lastDigitValue + 26 * (fromLetterId(input.slice(0, -1)) + 1);
    }
}
exports.fromLetterId = fromLetterId;
/**
 * For some input string, attempt to pluralize it.
 * Cannot handle complex pluralizations or phrases with verbs.
 *
 * TODO: Make this work on upper-case words.
 *
 * @param input text to pluralize
 * @returns the pluralized input text
 */
function pluralize(input) {
    if (input.endsWith('y')) {
        return input.substring(0, input.length - 1) + 'ies';
    }
    if (input.endsWith(')')) {
        const openParenIndex = input.lastIndexOf('(');
        const preParenText = input.substring(0, openParenIndex).trim();
        return pluralize(preParenText) + ' ' + input.substring(openParenIndex);
    }
    return input + 's';
}
exports.pluralize = pluralize;
/**
 * Given some input text, split it into a list naturally separated by paragraph/punctuation.
 * @param text text to naturally split
 * @param maxLength max length of each resulting segment
 * @returns list of the naturally split text segments
 */
function splitTextNaturally(text, maxLength) {
    const result = [];
    for (const paragraph of text.split('\n').map(p => p.trim()).filter(p => p)) {
        let remainingParagraph = paragraph;
        while (remainingParagraph.length > maxLength) {
            const greedySlice = remainingParagraph.slice(0, maxLength);
            const lastPeriodIndex = greedySlice.lastIndexOf('.');
            if (lastPeriodIndex === -1) {
                result.push(greedySlice.slice(0, maxLength - 3).trim() + '...');
                remainingParagraph = remainingParagraph.slice(maxLength - 3).trim();
            }
            else {
                result.push(greedySlice.slice(0, lastPeriodIndex + 1));
                remainingParagraph = remainingParagraph.slice(lastPeriodIndex + 1).trim();
            }
        }
        result.push(remainingParagraph);
    }
    return result;
}
exports.splitTextNaturally = splitTextNaturally;
/**
 * For some numerical rank (e.g. 1) return the English rank string (e.g. "1st").
 * @param rank a numerical rank
 * @returns The given rank expressed as a string (e.g. 1st, 2nd, 3rd, 11th, 21st)
 */
function getRankString(rank) {
    if (rank % 10 === 1 && rank !== 11) {
        return `${rank}st`;
    }
    else if (rank % 10 === 2 && rank !== 12) {
        return `${rank}nd`;
    }
    else if (rank % 10 === 3 && rank !== 13) {
        return `${rank}rd`;
    }
    return `${rank}th`;
}
exports.getRankString = getRankString;
/**
 * Computes a number between the two provided numbers, as specified by the optional "along" factor.
 * If the user wants a number 0.5 "along", it will return a number exactly halfway between the two.
 * If the user wants a number 0.25 "along", it will return a number a quarter of the way between the two.
 * @param a the low number
 * @param b the high number
 * @param along the "along" factor specifying where the "between" point is (defaults to 0.5)
 * @returns a number between the provided number
 */
function getNumberBetween(a, b, along = 0.5) {
    return a + along * (b - a);
}
exports.getNumberBetween = getNumberBetween;
/**
 * Computes a score to indicate how many of the unique words in the source text are repeated in the input text.
 * For example, source text "hello, world" repeats completely in "MY WORLD IS A HELLO" and returns a score of 1.
 * For example, source text "one two three four" repeats partially in "Hello four" and returns a score of 0.25.
 * @param text The input text
 * @param source The source text that the input text may be borrowing from
 * @returns Word repetition score in the range [0, 1]
 */
function getWordRepetitionScore(text, source) {
    const sanitize = (s) => {
        return s.toLowerCase()
            // Remove non-alphanumeric characters
            .replace(/[^0-9a-zA-Z\s]/g, '')
            // Replace all whitespace segments with one space
            .replace(/\s+/g, ' ')
            .trim();
    };
    const inputTokens = sanitize(text).split(' ');
    const sourceTokens = sanitize(source).split(' ');
    // Remove duplicates to make this more accurate
    const sourceTokenSet = new Set(sourceTokens);
    if (sourceTokens.length === 0) {
        return 0;
    }
    let numRepeated = 0;
    for (const word of sourceTokenSet) {
        if (inputTokens.includes(word)) {
            numRepeated++;
        }
    }
    return numRepeated / sourceTokenSet.size;
}
exports.getWordRepetitionScore = getWordRepetitionScore;
//# sourceMappingURL=misc.js.map