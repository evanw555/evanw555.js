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

export function shuffleWithDependencies(input: string[], dependencies: Record<string, string[]>): string[] {
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
    for (const [ key, values ] of Object.entries(dependencies)) {
        for (const value of values) {
            if (input.includes(key) && input.includes(value)) {
                addEdge(value, key);
            }
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

/**
 * Given a list of strings, assign each input a target such that the graph of targets form one large cycle.
 * @param input List of strings to be shuffled
 * @param options.whitelists For a given input string, a list of strings they'd prefer to have as their target
 * @param options.blacklists For a given input string, a list of strings they'd prefer to not have as their target
 * @param options.deterministic If true, ensure the result for a given set of inputs and options is always the same
 */
export function shuffleCycle(input: string[], options?: { whitelists?: Record<string, string[]>, blacklists?: Record<string, string[]>, deterministic?: boolean }): string[] {
    // First, validate the input list
    if (input.length === 0) {
        return [];
    }
    if (input.length !== new Set(input).size) {
        throw new Error('There cannot be duplicates in the input string list');
    }
    // First, compute the desirability of each input string
    const whitelists = options?.whitelists ?? {};
    const blacklists = options?.blacklists ?? {};
    const desirabilities: Record<string, number> = {};
    for (const x of input) {
        // Desirability is computed as the number of times this input shows up in any of the whitelists
        desirabilities[x] = Object.values(whitelists).filter(w => w.includes(x)).length;
    }
    // console.log(JSON.stringify(desirabilities, null, 2));
    // Sort the options by ascending desirability so options can be selected from the front
    const rawAllOptions = [...input];
    if (!options?.deterministic) {
        shuffle(rawAllOptions);
    }
    const allOptions = rawAllOptions.sort((x, y) => desirabilities[x] - desirabilities[y]);
    // console.log('sorted options: ' + JSON.stringify(allOptions));
    // Prime the result list with the first node
    const result: string[] = [allOptions[0]];
    while (result.length < allOptions.length) {
        const node = result[result.length - 1];
        const whitelist = whitelists[node] ?? [];
        const blacklist = blacklists[node] ?? [];
        const remainingOptions = allOptions.filter(x => !result.includes(x));
        // First, check if an option from the whitelist can be selected
        const whitelistedOptions = remainingOptions.filter(x => whitelist.includes(x));
        // console.log(`${node} preferred options: ${whitelistedOptions}`);
        if (whitelistedOptions.length > 0) {
            const target = whitelistedOptions[0];
            result.push(target);
            continue;
        }
        // Else, try an option that isn't blacklisted
        const nonBlacklistedOptions = remainingOptions.filter(x => !blacklist.includes(x));
        // console.log(`${node} acceptable options: ${nonBlacklistedOptions}`);
        if (nonBlacklistedOptions.length > 0) {
            const target = nonBlacklistedOptions[0];
            result.push(target);
            continue;
        }
        // Else, just choose the first available option
        // console.log(`${node} last resort options: ${remainingOptions}`);
        const lastResort = remainingOptions[0];
        result.push(lastResort);
    }

    return result;
}