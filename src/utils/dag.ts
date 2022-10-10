import { shuffle } from "./random";

export function flattenDAG(dag: Record<string, string[]>, options?: { randomize?: boolean }): string[] {
    const result: string[] = [];

    const allNodes: Set<string> = new Set();
    for (const key of Object.keys(dag)) {
        allNodes.add(key);
        for (const value of dag[key]) {
            allNodes.add(value);
        }
    }
    const queue: string[] = Array.from(allNodes);
    if (options?.randomize) {
        shuffle(queue);
    } else {
        queue.sort();
    }

    const marked: Set<string> = new Set();
    const tempMarked: Set<string> = new Set();

    const visit = (node: string) => {
        if (marked.has(node)) {
            return;
        }
        if (tempMarked.has(node)) {
            throw new Error('This DAG contains a cycle!');
        }

        tempMarked.add(node);

        // Visit all outgoing edges (if another node isn't in the dag, assume it's a sink node)
        const outgoingEdges: string[] = dag[node] ?? [];
        if (options?.randomize) {
            shuffle(outgoingEdges);
        } else {
            outgoingEdges.sort();
        }
        for (const other of dag[node] ?? []) {
            visit(other);
        }

        tempMarked.delete(node);
        marked.add(node);
        result.push(node);
    };

    while (queue.length > 0) {
        const node = queue.pop();
        if (node && !marked.has(node)) {
            visit(node);
        }
    }

    return result.reverse();
}