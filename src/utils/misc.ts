/**
 * @param input List of strings
 * @returns The given list of strings joined in a way that is grammatically correct in English
 */
export function naturalJoin(input: string[], conjunction: string = 'and'): string {
    if (!input || input.length === 0) {
        return '';
    }
    if (input.length === 1) {
        return input[0];
    }
    if (input.length === 2) {
        return `${input[0]} ${conjunction} ${input[1]}`;
    }
    let result = '';
    for (let i = 0; i < input.length; i++) {
        if (i !== 0) {
            result += ', ';
        }
        if (i === input.length - 1) {
            result += `${conjunction} `;
        }
        result += input[i];
    }
    return result;
}

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
export function getSelectedNode(root: any, selector: string = ''): any {
    // If a selector was specified, select a specific part of the state
    const selectors: string[] = selector.split('.');
    let node: any = root;
    for (const s of selectors) {
        // Skip empty selectors (due to extra spaces)
        if (!s) {
            continue;
        }
        // Continue selection if the current node is an object/array, otherwise fail
        if (node instanceof Object && s in node) {
            node = node[s];
        } else {
            throw new Error(`\`${selector}\` is not a valid selector! (failed at \`${s}\`)`);
        }
    }

    return node;
}

/**
 * Take a given input float and return it rounded to some fixed number of decimal places.
 * @param input the float
 * @param places number of decimal places (defaults to 2)
 * @returns the float rounded to some fixed number of decimal places
 */
export function toFixed(input: number, places: number = 2): number {
    return parseFloat(toFixedString(input, places));
}

/**
 * Take a given input float and return it at a fixed number of decimal places.
 * @param input the float
 * @param places number of decimal places (defaults to 2)
 * @returns the float string at a fixed number of decimal places
 */
export function toFixedString(input: number, places: number = 2): string {
    return input.toFixed(places);
}

/**
 * @param input some string
 * @returns the input string with the first letter capitalized
 */
export function capitalize(input: string): string {
    return input.substring(0, 1).toUpperCase() + input.substring(1);
}

/**
 * Given some non-negative number, returns an alphabetical representation (e.g. 0 is "A", 1 is "B", 25 is "Z", 26 is "AA")
 * @param input the input number
 * @returns the input number encoded using upper-case letters
 */
export function toLetterId(input: number): string {
    return (input < 26 ? '' : toLetterId(Math.floor(input / 26) - 1)) + String.fromCharCode((input % 26) + 65);
}

/**
 * For some input string, attempt to pluralize it.
 * Cannot handle complex pluralizations or phrases with verbs.
 * 
 * TODO: Make this work on upper-case words.
 *
 * @param input text to pluralize
 * @returns the pluralized input text
 */
export function pluralize(input: string): string {
    if (input.endsWith('y')) {
        return input.substring(0, input.length - 1) + 'ies';
    }
    if (input.endsWith(')')) {
        const openParenIndex: number = input.lastIndexOf('(');
        const preParenText: string = input.substring(0, openParenIndex).trim();
        return pluralize(preParenText) + ' ' + input.substring(openParenIndex);
    }
    return input + 's';
}

/**
 * For some numerical rank (e.g. 1) return the English rank string (e.g. "1st").
 * @param rank a numerical rank
 * @returns The given rank expressed as a string (e.g. 1st, 2nd, 3rd, 11th, 21st)
 */
export function getRankString(rank: number): string {
    if (rank % 10 === 1 && rank !== 11) {
        return `${rank}st`;
    } else if (rank % 10 === 2 && rank !== 12) {
        return `${rank}nd`;
    } else if (rank % 10 === 3 && rank !== 13) {
        return `${rank}rd`;
    }
    return `${rank}th`;
}

/**
 * Returns a new map including key-value pairs from the input map,
 * but with entries omitted if their value matches the blacklisted value parameter.
 * @param input input map
 * @param blacklistedValue value used to determine which entries to omit
 */
export function filterValueFromMap<T>(input: Record<string, T>, blacklistedValue: T): Record<string, T> {
    const output: Record<string, T> = {};
    Object.keys(input).forEach((key) => {
        if (input[key] !== blacklistedValue) {
            output[key] = input[key];
        }
    });
    return output;
}
