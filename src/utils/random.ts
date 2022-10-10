import { flattenDAG } from "./dag";

/**
 * @param lo Lower bound (inclusive)
 * @param hi Upper bound (exclusive)
 * @param bates Bates distribution value
 * @return integer in the range [lo, hi)
 */
 export function randInt(lo: number, hi: number, bates: number = 1): number {
    let total: number = 0;
    const b = Math.floor(bates);
    for (let i = 0; i < b; i++) {
        total += Math.floor(Math.random() * (hi - lo)) + lo;
    }
    return Math.floor(total / b);
};

/**
 * @param choices Array of objects to choose from
 * @returns A random element from the input array
 */
export function randChoice<T>(...choices: T[]): T {
    return choices[randInt(0, choices.length)];
};

/**
 * Shuffles an array in-place.
 * @param input Input array
 * @returns Shuffled array
 */
export function shuffle<T>(input: T[]): T[] {
    return input.sort((x, y) => Math.random() - Math.random());
}

/**
 * @returns True with probability p
 */
export function chance(p: number): boolean {
    return Math.random() < p;
}

export function shuffleWithDependencies(input: string[], dependencies: Record<string, string>): string[] {
    const edges: Record<string, string[]> = {};
    const initializeEdge = (node: string) => {
        if (!edges[node]) {
            edges[node] = [];
        }
        existingNodes.add(node);
    };
    const addEdge = (from: string, to: string) => {
        initializeEdge(from);
        initializeEdge(to);
        edges[from]?.push(to);
    };
    const existingNodes: Set<string> = new Set();
    for (const [ key, value ] of Object.entries(dependencies)) {
        if (value && input.includes(key) && input.includes(value)) {
            addEdge(value, key);
        }
    }
    // Add the remaining elements to the DAG
    for (const element of input) {
        // If there were no dependencies to prime the graph, prime it with this element
        if (existingNodes.size === 0) {
            initializeEdge(element);
        }
        // If the graph is already primed, add this element somewhere random
        else if (!existingNodes.has(element)) {
            const randomNode = randChoice(...Array.from(existingNodes));
            if (chance(0.5)) {
                addEdge(randomNode, element);
            } else {
                addEdge(element, randomNode);
            }
        }
    }
    // console.log(JSON.stringify(edges, null, 2));
    const result = flattenDAG(edges, { randomize: true });
    return result;
    // return input.sort((x, y) => {
    //     if (dependencies[x] === y) {
    //         return 1;
    //     } else if (dependencies[y] === x) {
    //         return -1;
    //     }
    //     else return Math.random() - Math.random();
    // })
}