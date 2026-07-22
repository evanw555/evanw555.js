"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageGeneratorV2 = void 0;
const misc_1 = require("./utils/misc");
const random_1 = require("./utils/random");
const text_1 = require("./utils/text");
class CharacterStream {
    constructor(data) {
        this.data = data;
        this.i = -1;
    }
    current() {
        return this.data[this.i];
    }
    next() {
        // TODO: Stop incrementing once done
        this.i++;
        return this.data[this.i];
    }
    peekNext() {
        return this.data[this.i + 1];
    }
    backUp() {
        this.i--;
    }
}
class LanguageGeneratorV2 {
    constructor(config) {
        this._config = config;
    }
    setLogger(logger) {
        this.logger = logger;
    }
    parseLiterals(stream, variables) {
        // First, count how heavily to weigh toward the front
        let weighting = 1;
        while (stream.peekNext() === '!') {
            weighting++;
            stream.next();
        }
        // Construct list of text literals
        const literals = [];
        // TODO: Don't use while(true)
        while (true) {
            const literal = this.parseText(stream, ['|', '}'], variables);
            literals.push(literal);
            // If reached end of stream...
            if (stream.current() === undefined) {
                throw new Error('Unexpected end of stream while parsing literals');
            }
            // If reached delimiter, continue
            if (stream.current() === '|') {
                continue;
            }
            // If reached end of injection, choose random and escape
            if (stream.current() === '}') {
                let index = literals.length - 1;
                for (let i = 0; i < weighting; i++) {
                    index = Math.min(index, (0, random_1.randInt)(0, literals.length));
                }
                return literals[index];
            }
        }
    }
    parseVariable(stream, variables) {
        // First, parse the variable name itself
        const firstIdentifier = this.parseText(stream, ['}', '?'], variables);
        // If encountered fallback operator, continue parsing variable names
        const identifiers = [firstIdentifier];
        while (stream.current() === '?' && stream.peekNext() === '?') {
            // Burn next question mark
            if (stream.next() !== '?') {
                throw new Error(`Unexpected character \`${stream.current()}\` after first question mark while parsing variable fallback`);
            }
            // Parse next identifier
            identifiers.push(this.parseText(stream, ['}', '?'], variables));
        }
        if (stream.current() === undefined) {
            throw new Error('Unexpected end of stream while parsing injection variable name');
        }
        // Get first defined value selected by the identifiers list
        const value = identifiers
            .map(x => (0, misc_1.getSelectedNode)(variables, x))
            .filter(x => x !== undefined)[0];
        // If injection ended right there, return variable value
        if (stream.current() === '}') {
            if (value === undefined) {
                throw new Error(`Injection references nonexistent variable${(0, text_1.s)(identifiers.length)} \`${this.stringify(identifiers)}\`, available variables are \`${JSON.stringify(Object.keys(variables))}\``);
            }
            return this.stringify(value);
        }
        // If attempting to do ternary operator...
        if (stream.current() === '?') {
            // First truthy result
            const truthy = this.parseText(stream, ['|'], variables);
            // Then the falsy result
            const falsy = this.parseText(stream, ['}'], variables);
            // Return based on variable truthiness
            return value ? truthy : falsy;
        }
        throw new Error('Unexpected stream state while parsing variable injection');
    }
    parseFunction(stream, variables) {
        // Parse the function name
        const functionName = this.parseText(stream, ['#'], variables).toUpperCase();
        if (stream.current() === undefined) {
            throw new Error('Unexpected end of stream while parsing injection function name');
        }
        // Parse the operand text
        const operand = this.parseText(stream, ['}'], variables);
        const functions = {
            YEAR: (text) => {
                // If year is a number...
                if (text.match(/^\d+$/)) {
                    // If it's 8 digits or more, parse as a timestamp
                    if (text.length >= 8) {
                        const d = new Date(parseInt(text));
                        return d.getFullYear().toString();
                    }
                    // Otherwise, treat it as a year and return as-is
                    return text;
                }
                // Attempt to parse as a date string
                else {
                    const d = new Date(text);
                    if (!isNaN(d.getFullYear())) {
                        return d.getFullYear().toString();
                    }
                }
                return '???';
            },
            UPPER: (text) => text.toUpperCase(),
            LOWER: (text) => text.toLowerCase(),
            CAPITALIZE: (text) => (0, misc_1.capitalize)(text),
        };
        const fn = functions[functionName];
        if (!fn) {
            throw new Error(`Invalid function name \`${functionName}\`, valid functions are ${(0, misc_1.naturalJoin)(Object.keys(functions))}`);
        }
        return fn(operand);
    }
    parseLanguageReference(stream, variables) {
        var _a, _b;
        // Parse the selector
        const selector = this.parseText(stream, ['?', '}'], variables);
        // console.log(`Parse language reference: selector = ${selector}`);
        // Determine how many random list elements to pick
        let pickRandom = 0;
        if (stream.current() === '?') {
            // If the injection ends there, only pick one
            const range = this.parseText(stream, ['}'], variables);
            // console.log(`Parse language reference: range = ${range}`);
            if (range === '') {
                pickRandom = 1;
            }
            else {
                // Attempt to split the range in two
                if (range.includes('-')) {
                    const [first, second] = range.split('-');
                    const lo = parseInt(first);
                    if (isNaN(lo)) {
                        throw new Error(`Language reference with selector \`${selector}\` has bad range \`${range}\` (bad lower)`);
                    }
                    const hi = parseInt(second);
                    if (isNaN(hi)) {
                        throw new Error(`Language reference with selector \`${selector}\` has bad range \`${range}\` (bad upper)`);
                    }
                    // Determine a random number between these two
                    pickRandom = (0, random_1.randInt)(lo, hi + 1);
                }
                // Else, parse range as one number
                else {
                    const singular = parseInt(range);
                    if (isNaN(singular)) {
                        throw new Error(`Language reference with selector \`${selector}\` has bad range \`${range}\` (expected integer)`);
                    }
                    pickRandom = singular;
                }
            }
        }
        // Resolve the language config node that this selector points to
        const node = (0, misc_1.getSelectedNode)(this._config, selector);
        // Resolve list using the pick-random logic
        if (pickRandom === 0) {
            // If no amount specified, then assert the current node is a string
            if ((node === null || node === void 0 ? void 0 : node.constructor) !== String) {
                throw new Error(`Language reference with selector \`${selector}\` expected a string but found type \`${(_a = node === null || node === void 0 ? void 0 : node.constructor) === null || _a === void 0 ? void 0 : _a.name}\``);
            }
            return this.parseText(new CharacterStream(this.stringify(node)), [], variables);
        }
        else {
            // If an amount is specified, then assert the current node is an array
            if (!Array.isArray(node)) {
                throw new Error(`Language reference with selector \`${selector}\` expected an array but found type \`${(_b = node === null || node === void 0 ? void 0 : node.constructor) === null || _b === void 0 ? void 0 : _b.name}\``);
            }
            // Copy the array and shuffle it (TODO: Each element of the array may not be a string, but that would be a huge error)
            const choices = (0, random_1.shuffle)(node.map(x => this.stringify(x)));
            // Assert that we're not taking more than is possible, then take a slice of the desired size
            if (pickRandom > choices.length) {
                throw new Error(`Language reference with selector \`${selector}\` is attempting to select ${pickRandom} elements from only ${choices.length} available choices`);
            }
            const selections = choices.slice(0, pickRandom);
            // Return the resulting elements joined in proper English
            return this.parseText(new CharacterStream((0, misc_1.naturalJoin)(selections)), [], variables);
        }
    }
    parseInjection(stream, variables) {
        const first = stream.next();
        if (first === undefined) {
            throw new Error('Unexpected end of stream at beginning of injection');
        }
        // If random literal selection, parse literals
        if (first === '!') {
            return this.parseLiterals(stream, variables);
        }
        // If variable reference, parse as variable
        if (first === '$') {
            return this.parseVariable(stream, variables);
        }
        // If function operator, parse as function
        if (first === '#') {
            return this.parseFunction(stream, variables);
        }
        // Else, parse as language reference
        stream.backUp();
        return this.parseLanguageReference(stream, variables);
    }
    parseText(stream, terminators, variables) {
        let result = '';
        let escaped = false;
        // TODO: Using while(true) is really bad. Do something else
        do {
            const value = stream.next();
            if (value === undefined) {
                return result;
            }
            else if (escaped) {
                result += value;
                escaped = false;
            }
            else if (terminators.includes(value)) {
                return result;
            }
            else if (value === '{') {
                result += this.parseInjection(stream, variables);
            }
            else if (value === '\\') {
                escaped = true;
            }
            else {
                result += value;
            }
        } while (true);
    }
    stringify(value) {
        if (typeof value === 'string') {
            return value;
        }
        return JSON.stringify(value);
    }
    /**
     * @param input Unresolved input text (may contain tokens)
     * @param variables Variables that may be referenced and injected via variable tokens
     * @returns Processed text with all tokens recursively resolved
     */
    generate2(input, variables = {}) {
        const stream = new CharacterStream(input);
        try {
            return this.parseText(stream, [], variables);
        }
        catch (err) {
            this._reportFailure(err.message);
            return 'Hello';
        }
    }
    /**
     * Report language generation failure by logging and sending a message to the emergency log channel.
     * Refuses to log the failure if it's the same as the previous error message (to avoid retry spamming).
     * @param message error message to report
     */
    _reportFailure(message) {
        if (message !== this._lastErrorMessage) {
            this._lastErrorMessage = message;
            const errorMessage = `LanguageGenerator encountered an error: ${message}`;
            if (this.logger) {
                this.logger(errorMessage);
            }
        }
    }
}
exports.LanguageGeneratorV2 = LanguageGeneratorV2;
exports.default = LanguageGeneratorV2;
//# sourceMappingURL=language-generator-v2.js.map