"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const misc_1 = require("./utils/misc");
class LanguageGenerator {
    constructor(config) {
        this._config = config;
    }
    setLogger(logger) {
        this.logger = logger;
    }
    _resolve(token, variables) {
        var _a, _b;
        let stripped = token.substring(1, token.length - 1);
        // In the simple case (list of literals), handle this upfront
        if (stripped.startsWith('!')) {
            const options = stripped.substring(1).split('|');
            return options[Math.floor(Math.random() * options.length)];
        }
        // If dealing with variable injection return that variable if it exists, else return the token
        if (stripped.startsWith('$')) {
            const identifier = stripped.substring(1);
            if (variables[identifier] === undefined) {
                throw new Error(`Token \`${token}\` references nonexistent variable, available variables are \`${JSON.stringify(Object.keys(variables))}\``);
            }
            return variables[identifier];
        }
        // Check if there's a random modifier at the end
        let pickRandom = 0;
        if (stripped.endsWith('?')) {
            // e.g. "{foo.bar?}"
            pickRandom = 1;
            stripped = stripped.substring(0, stripped.length - 1);
        }
        else if (stripped.match(/\?\d+$/)) {
            // e.g. "{foo.bar?3}"
            pickRandom = parseInt(stripped.substring(stripped.lastIndexOf('?') + 1));
            stripped = stripped.substring(0, stripped.lastIndexOf('?'));
        }
        else if (stripped.match(/\?\d+\-\d+$/)) {
            // e.g. "{foo.bar?2-3}"
            const execResult = /\?(\d+)\-(\d+)$/.exec(stripped);
            const lo = parseInt(execResult[1]);
            const hi = parseInt(execResult[2]);
            pickRandom = Math.floor(Math.random() * (hi - lo + 1)) + lo;
            stripped = stripped.substring(0, stripped.lastIndexOf('?'));
        }
        // Resolve the language config node that this selector points to
        const segments = stripped.split('.');
        let node = this._config;
        while (segments.length > 0) {
            const segment = segments.shift();
            if (!node || !node.hasOwnProperty(segment)) {
                throw new Error(`Token \`${token}\` has bad selector \`${stripped}\` which failed on segment \`${segment}\``);
            }
            node = node[segment];
        }
        // Resolve list using the pick-random logic
        if (pickRandom === 0) {
            // If no amount specified, then assert the current node is a string
            if ((node === null || node === void 0 ? void 0 : node.constructor) !== String) {
                throw new Error(`Token \`${token}\` expected a string but found type \`${(_a = node === null || node === void 0 ? void 0 : node.constructor) === null || _a === void 0 ? void 0 : _a.name}\``);
            }
            return node.toString();
        }
        else {
            // If an amount is specified, then assert the current node is an array
            if (!Array.isArray(node)) {
                throw new Error(`Token \`${token}\` expected an array but found type \`${(_b = node === null || node === void 0 ? void 0 : node.constructor) === null || _b === void 0 ? void 0 : _b.name}\``);
            }
            // Copy the array and shuffle it (TODO: Each element of the array may not be a string, but that would be a huge error)
            const choices = node.map(x => x.toString()).sort((x, y) => Math.random() - Math.random());
            // Assert that we're not taking more than is possible, then take a slice of the desired size
            if (pickRandom > choices.length) {
                throw new Error(`Token \`${token}\` is attempting to select ${pickRandom} elements from only ${choices.length} available choices`);
            }
            const selections = choices.slice(0, pickRandom);
            // Return the resulting elements joined in proper English
            return (0, misc_1.naturalJoin)(selections);
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
    /**
     * @param input Unresolved input text (may contain tokens)
     * @param variables Variables that may be referenced and injected via variable tokens
     * @returns Processed text with all tokens recursively resolved
     */
    generate(input, variables = {}) {
        const p = /{\!?([^{}]+)(\?\d*\-?\d*)?}/;
        // This logic can be retried a number of times, in case a bad result is generated
        let attemptsRemaining = 10;
        while (attemptsRemaining-- > 0) {
            // Iteratively resolve all existing tokens until none are left (handles recursive tokens)
            let result = input;
            try {
                while (result.search(p) !== -1) {
                    result = result.replace(p, (x) => this._resolve(x, variables));
                }
            }
            catch (err) {
                this._reportFailure(err.message);
                continue;
            }
            // If the resulting output seems to be malformed, log it and try again!
            if (result.includes('{') || result.includes('}') || result.includes('|')) {
                this._reportFailure(`Processed input \`${input}\` and produced a bad output \`${result}\``);
                continue;
            }
            return result;
        }
        // Ultimate fallback text (ideally it should never get here)
        return "Hello";
    }
}
exports.default = LanguageGenerator;
//# sourceMappingURL=language-generator.js.map