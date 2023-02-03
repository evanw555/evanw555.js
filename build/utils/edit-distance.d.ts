declare type Indexable = string | any[];
export declare function getEditDistance(a: Indexable, b: Indexable): number;
export declare function getNormalizedEditDistance(a: Indexable, b: Indexable): number;
export declare function getMostSimilarByNormalizedEditDistance(input: Indexable, values: Indexable[]): {
    value: Indexable;
    distance: number;
    index: number;
} | undefined;
export {};
//# sourceMappingURL=edit-distance.d.ts.map