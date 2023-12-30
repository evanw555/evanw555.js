/**
 * Given a direct graph, returns some cycle included in the graph if a cycle exists.
 * @param graph A mapping of nodes to other nodes as outgoing edges
 * @param options.randomize If true, the traversal will be randomized. Else, the result will be deterministic
 * @returns A list of nodes included in some cycle in the graph, else undefined if no cycle exists
 */
export declare function findCycle(graph: Record<string, string[]>, options?: {
    randomize?: boolean;
}): string[] | undefined;
//# sourceMappingURL=graph.d.ts.map