"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenDAG = void 0;
const random_1 = require("./random");
/**
 * Given a directed acyclic graph (DAG) defined by a mapping of outgoing edges, flattens it into a list of values with each
 * value preceding any outgoing edge. If there are any cycles, an error will be thrown. All nodes will be included in the
 * final result if they are represented as either a node or outgoing edge.
 * @param dag Mapping of values to other values as outgoing edges
 * @param options.randomize If true, the result will be randomized. Else, the result will be deterministic
 * @returns List of values with each value preceding all of its outgoing edges
 */
function flattenDAG(dag, options) {
    const result = [];
    const allNodes = new Set();
    for (const key of Object.keys(dag)) {
        allNodes.add(key);
        for (const value of dag[key]) {
            allNodes.add(value);
        }
    }
    const queue = Array.from(allNodes);
    if (options === null || options === void 0 ? void 0 : options.randomize) {
        (0, random_1.shuffle)(queue);
    }
    else {
        queue.sort();
    }
    const marked = new Set();
    const tempMarked = new Set();
    const visit = (node) => {
        var _a, _b;
        if (marked.has(node)) {
            return;
        }
        if (tempMarked.has(node)) {
            throw new Error('This DAG contains a cycle!');
        }
        tempMarked.add(node);
        // Visit all outgoing edges (if another node isn't in the dag, assume it's a sink node)
        const outgoingEdges = (_a = dag[node]) !== null && _a !== void 0 ? _a : [];
        if (options === null || options === void 0 ? void 0 : options.randomize) {
            (0, random_1.shuffle)(outgoingEdges);
        }
        else {
            outgoingEdges.sort();
        }
        for (const other of (_b = dag[node]) !== null && _b !== void 0 ? _b : []) {
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
exports.flattenDAG = flattenDAG;
//# sourceMappingURL=dag.js.map