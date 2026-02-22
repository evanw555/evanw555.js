"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMostSimilarsByNormalizedEditDistance = exports.getMostSimilarByNormalizedEditDistance = exports.getNormalizedEditDistance = exports.getEditDistance = void 0;
function getEditDistance(a, b) {
    // for all i and j, d[i,j] will hold the Levenshtein distance between
    // the first i characters of s and the first j characters of t
    const aN = a.length;
    const bN = b.length;
    const d = [];
    for (let r = 0; r <= aN; r++) {
        d.push([]);
        for (let c = 0; c <= bN; c++) {
            d[r][c] = 0;
        }
    }
    //   set each element in d to zero
    // source prefixes can be transformed into empty string by
    // dropping all characters
    for (let i = 0; i <= aN; i++) {
        d[i][0] = i;
    }
    // target prefixes can be reached from empty source prefix
    // by inserting every character
    for (let j = 0; j <= bN; j++) {
        d[0][j] = j;
    }
    for (let j = 1; j <= bN; j++) {
        for (let i = 1; i <= aN; i++) {
            const substitutionCost = (a[i - 1] === b[j - 1]) ? 0 : 1;
            d[i][j] = Math.min(d[i - 1][j] + 1, // Deletion
            d[i][j - 1] + 1, // Insertion
            d[i - 1][j - 1] + substitutionCost); // Substitution
        }
    }
    return d[aN][bN];
}
exports.getEditDistance = getEditDistance;
function getNormalizedEditDistance(a, b) {
    return getEditDistance(a, b) / Math.max(a.length, b.length);
}
exports.getNormalizedEditDistance = getNormalizedEditDistance;
function getMostSimilarByNormalizedEditDistance(input, values) {
    const result = getMostSimilarsByNormalizedEditDistance(input, values);
    return result[0];
}
exports.getMostSimilarByNormalizedEditDistance = getMostSimilarByNormalizedEditDistance;
function getMostSimilarsByNormalizedEditDistance(input, values) {
    let bestDistance = Number.MAX_SAFE_INTEGER;
    let best = [];
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        const distance = getNormalizedEditDistance(input, value);
        if (distance < bestDistance) {
            bestDistance = distance;
            best = [{
                    value,
                    distance,
                    index: i
                }];
        }
        else if (distance === bestDistance) {
            best.push({
                value,
                distance,
                index: i
            });
        }
    }
    return best;
}
exports.getMostSimilarsByNormalizedEditDistance = getMostSimilarsByNormalizedEditDistance;
//# sourceMappingURL=edit-distance.js.map