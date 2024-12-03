"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffleCycle = exports.shuffleWithDependencies = exports.chance = exports.shuffle = exports.randChoice = exports.randInt = void 0;
const dag_1 = require("./dag");
/**
 * @param lo Lower bound (inclusive)
 * @param hi Upper bound (exclusive)
 * @param bates Bates distribution value
 * @return integer in the range [lo, hi)
 */
function randInt(lo, hi, bates = 1) {
    let total = 0;
    const b = Math.floor(bates);
    for (let i = 0; i < b; i++) {
        total += Math.floor(Math.random() * (hi - lo)) + lo;
    }
    return Math.floor(total / b);
}
exports.randInt = randInt;
;
/**
 * @param choices Array of objects to choose from
 * @returns A random element from the input array
 */
function randChoice(...choices) {
    return choices[randInt(0, choices.length)];
}
exports.randChoice = randChoice;
;
/**
 * Shuffles an array in-place.
 * @param input Input array
 * @returns Shuffled array
 */
function shuffle(input) {
    return input.sort((x, y) => Math.random() - Math.random());
}
exports.shuffle = shuffle;
/**
 * @returns True with probability p
 */
function chance(p) {
    return Math.random() < p;
}
exports.chance = chance;
function shuffleWithDependencies(input, dependencies) {
    const edges = {};
    const initializeEdge = (node) => {
        if (!edges[node]) {
            edges[node] = [];
        }
        existingNodes.add(node);
    };
    const addEdge = (from, to) => {
        var _a;
        initializeEdge(from);
        initializeEdge(to);
        (_a = edges[from]) === null || _a === void 0 ? void 0 : _a.push(to);
    };
    const existingNodes = new Set();
    for (const [key, values] of Object.entries(dependencies)) {
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
            }
            else {
                addEdge(element, randomNode);
            }
        }
    }
    // console.log(JSON.stringify(edges, null, 2));
    const result = (0, dag_1.flattenDAG)(edges, { randomize: true });
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
exports.shuffleWithDependencies = shuffleWithDependencies;
/**
 * Given a list of strings, assign each input a target such that the graph of targets form one large cycle.
 * @param input List of strings to be shuffled
 * @param options.whitelists For a given input string, a list of strings they'd prefer to have as their target
 * @param options.blacklists For a given input string, a list of strings they'd prefer to not have as their target
 * @param options.deterministic If true, ensure the result for a given set of inputs and options is always the same
 */
function shuffleCycle(input, options) {
    var _a, _b, _c, _d;
    // First, validate the input list
    if (input.length === 0) {
        return [];
    }
    if (input.length !== new Set(input).size) {
        throw new Error('There cannot be duplicates in the input string list');
    }
    // First, compute the desirability of each input string
    const whitelists = (_a = options === null || options === void 0 ? void 0 : options.whitelists) !== null && _a !== void 0 ? _a : {};
    const blacklists = (_b = options === null || options === void 0 ? void 0 : options.blacklists) !== null && _b !== void 0 ? _b : {};
    const desirabilities = {};
    for (const x of input) {
        // Desirability is computed as the number of times this input shows up in any of the whitelists
        desirabilities[x] = Object.values(whitelists).filter(w => w.includes(x)).length;
    }
    // console.log(JSON.stringify(desirabilities, null, 2));
    // Sort the options by ascending desirability so options can be selected from the front
    const rawAllOptions = [...input];
    if (!(options === null || options === void 0 ? void 0 : options.deterministic)) {
        shuffle(rawAllOptions);
    }
    const allOptions = rawAllOptions.sort((x, y) => desirabilities[x] - desirabilities[y]);
    // console.log('sorted options: ' + JSON.stringify(allOptions));
    // Prime the result list with the first node
    const result = [allOptions[0]];
    while (result.length < allOptions.length) {
        const node = result[result.length - 1];
        const whitelist = (_c = whitelists[node]) !== null && _c !== void 0 ? _c : [];
        const blacklist = (_d = blacklists[node]) !== null && _d !== void 0 ? _d : [];
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
exports.shuffleCycle = shuffleCycle;
//# sourceMappingURL=random.js.map