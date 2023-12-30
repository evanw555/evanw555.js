import { shuffle } from "./random";

// TODO: Optimize by accounting for nodes that have already been fully visited
/**
 * Given a direct graph, returns some cycle included in the graph if a cycle exists.
 * @param graph A mapping of nodes to other nodes as outgoing edges
 * @param options.randomize If true, the traversal will be randomized. Else, the result will be deterministic
 * @returns A list of nodes included in some cycle in the graph, else undefined if no cycle exists
 */
export function findCycle(graph: Record<string, string[]>, options?: { randomize?: boolean }): string[] | undefined {
    const allNodes: Set<string> = new Set();
    for (const key of Object.keys(graph)) {
        allNodes.add(key);
        for (const value of graph[key]) {
            allNodes.add(value);
        }
    }
    const orderedNodes: string[] = Array.from(allNodes);
    if (options?.randomize) {
        shuffle(orderedNodes);
    } else {
        orderedNodes.sort();
    }

    const visit = (node: string, stack: string[]): string[] | undefined => {
        // If this node has already been visited...
        if (stack.includes(node)) {
            // If the stack began at this node, then it's a complete cycle
            if (stack[0] === node) {
                return stack;
            }
            // If it's not the first node, then this technically isn't the full cycle
            return undefined;
        }
        // Else, traverse to each connecting node with this node on the stack
        const nextNodes = [...(graph[node] ?? [])];
        if (options?.randomize) {
            shuffle(nextNodes);
        } else {
            nextNodes.sort();
        }
        for (const nextNode of nextNodes) {
            const result = visit(nextNode, [...stack, node]);
            if (result) {
                return result;
            }
        }
    };

    for (const node of orderedNodes) {
        const result = visit(node, []);
        if (result) {
            return result;
        }
    }

    return undefined;
}