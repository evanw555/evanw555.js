
type Indexable = string | any[];

export function getEditDistance(a: Indexable, b: Indexable): number {
    // for all i and j, d[i,j] will hold the Levenshtein distance between
    // the first i characters of s and the first j characters of t
    const aN = a.length;
    const bN = b.length;
    const d: number[][] = [];
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
            d[i][j] = Math.min(
                d[i - 1][j] + 1, // Deletion
                d[i][j - 1] + 1, // Insertion
                d[i -1][j - 1] + substitutionCost); // Substitution
        }
    }

    return d[aN][bN];
}

export function getNormalizedEditDistance(a: Indexable, b: Indexable): number {
    return getEditDistance(a, b) / Math.max(a.length, b.length);
}

export function getMostSimilarByNormalizedEditDistance(input: Indexable, values: Indexable[]): { value: Indexable, distance: number, index: number } | undefined {
    let bestIndex: number = -1;
    let bestDistance: number = Number.MAX_SAFE_INTEGER;
    let bestValue: Indexable = '';

    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        const distance = getNormalizedEditDistance(input, value);
        if (distance < bestDistance) {
            bestDistance = distance;
            bestValue = value;
            bestIndex = i;
        }
    }

    if (bestIndex === -1) {
        return undefined;
    }

    return {
        value: bestValue,
        distance: bestDistance,
        index: bestIndex
    };
}