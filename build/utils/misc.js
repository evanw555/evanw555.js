"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMap = exports.filterValueFromMap = exports.getRankString = exports.pluralize = exports.fromLetterId = exports.toLetterId = exports.capitalize = exports.toFixedString = exports.toFixed = exports.getSelectedNode = exports.collapseRedundantStrings = exports.naturalJoin = void 0;
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
 * Returns a new map including key-value pairs from the input map,
 * but with entries omitted if their value matches the blacklisted value parameter.
 * @param input input map
 * @param blacklistedValue value used to determine which entries to omit
 */
function filterValueFromMap(input, blacklistedValue) {
    const output = {};
    Object.keys(input).forEach((key) => {
        if (input[key] !== blacklistedValue) {
            output[key] = input[key];
        }
    });
    return output;
}
exports.filterValueFromMap = filterValueFromMap;
/**
 * For some list of keys and some list of values of equal length, returns
 * a map with each key mapped to its respective value.
 * @param keys List of unique keys of length N
 * @param values List of values of length N
 * @returns The constructed map
 */
function toMap(keys, values) {
    if (keys.length !== values.length) {
        throw new Error(`Cannot create a map with ${keys.length} keys and ${values.length} values!`);
    }
    if (keys.length !== new Set(keys).size) {
        throw new Error(`Cannot create a map with duplicate keys!`);
    }
    const result = {};
    for (let i = 0; i < keys.length; i++) {
        result[keys[i]] = values[i];
    }
    return result;
}
exports.toMap = toMap;
//# sourceMappingURL=misc.js.map