"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffleWithDependencies = exports.chance = exports.shuffle = exports.randChoice = exports.randInt = void 0;
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
    const addEdge = (from, to) => {
        var _a;
        if (!edges[from]) {
            edges[from] = [];
        }
        if (!edges[to]) {
            edges[to] = [];
        }
        (_a = edges[from]) === null || _a === void 0 ? void 0 : _a.push(to);
    };
    const existingNodes = new Set();
    for (const [key, value] of Object.entries(dependencies)) {
        if (value && input.includes(key) && input.includes(value)) {
            addEdge(value, key);
            existingNodes.add(key);
            existingNodes.add(value);
        }
    }
    // Add the remaining elements to the DAG
    for (const element of input) {
        if (!existingNodes.has(element)) {
            const randomNode = randChoice(...Array.from(existingNodes));
            existingNodes.add(element);
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
//# sourceMappingURL=random.js.map