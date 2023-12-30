/**
 * Given a directed acyclic graph (DAG) defined by a mapping of outgoing edges, flattens it into a list of values with each
 * value preceding any outgoing edge. If there are any cycles, an error will be thrown. All nodes will be included in the
 * final result if they are represented as either a node or outgoing edge.
 * @param dag Mapping of values to other values as outgoing edges
 * @param options.randomize If true, the result will be randomized. Else, the result will be deterministic
 * @returns List of values with each value preceding all of its outgoing edges
 */
export declare function flattenDAG(dag: Record<string, string[]>, options?: {
    randomize?: boolean;
}): string[];
//# sourceMappingURL=dag.d.ts.map