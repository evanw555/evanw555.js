/**
 * A utility to keep track of text that's previously been used in some context.
 * Santizes and reduces the text so that insignificant modifications don't affect its identity.
 */
export default class R9KTextBank {
    private readonly bank;
    constructor();
    add(text: string): void;
    addRawHashes(rawHashes: string[]): void;
    contains(text: string): boolean;
    getAllEntries(): string[];
    private static computeHash;
    private static sanitize;
}
//# sourceMappingURL=r9k.d.ts.map