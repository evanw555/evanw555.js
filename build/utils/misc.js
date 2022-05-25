"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.naturalJoin = exports.sleep = void 0;
function sleep(milliseconds) {
    return new Promise(r => setTimeout(r, milliseconds));
}
exports.sleep = sleep;
/**
 * @param input List of strings
 * @returns The given list of strings joined in a way that is grammatically correct in English
 */
function naturalJoin(input, conjunction = 'and') {
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
exports.naturalJoin = naturalJoin;
//# sourceMappingURL=misc.js.map