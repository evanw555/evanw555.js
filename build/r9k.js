"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.R9KTextBank = void 0;
const crypto_1 = require("crypto");
/**
 * A utility to keep track of text that's previously been used in some context.
 * Santizes and reduces the text so that insignificant modifications don't affect its identity.
 */
class R9KTextBank {
    constructor() {
        this.bank = new Set();
    }
    add(text) {
        this.bank.add(R9KTextBank.computeHash(text));
    }
    addRawHashes(rawHashes) {
        rawHashes.forEach(rawHash => this.bank.add(rawHash));
    }
    contains(text) {
        return this.bank.has(R9KTextBank.computeHash(text));
    }
    getAllEntries() {
        return Array.from(this.bank).sort();
    }
    static computeHash(text) {
        const sanitized = this.sanitize(text);
        const hash = (0, crypto_1.createHash)('sha1');
        hash.update(sanitized);
        return hash.digest('base64');
    }
    static sanitize(text) {
        return text.toLowerCase()
            // Remove non-alphanumeric characters
            .replace(/[^0-9a-zA-Z]/g, '')
            // Collapse consecutive repeating characters into one
            .replace(/(.)\1+/g, '$1');
    }
}
exports.R9KTextBank = R9KTextBank;
//# sourceMappingURL=r9k.js.map