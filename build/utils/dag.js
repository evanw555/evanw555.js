"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenDAG = void 0;
const random_1 = require("./random");
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