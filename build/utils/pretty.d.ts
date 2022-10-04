/**
 * Pretty-print the given value into JSON.
 * @param node The value to serialize
 * @param options.overrides A mapping keyed by JSON path (e.g. "x.y.z") used to replace certain elements (doesn't work for primitive arrays).
 *                          Wildcards may be used as the last segment in the path string.
 * @returns The serialized string
 */
export declare function prettyPrint(node: any, options?: {
    overrides?: Record<string, any>;
}): string;
//# sourceMappingURL=pretty.d.ts.map