"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AStarPathFinder = void 0;
const random_1 = require("./utils/random");
class AStarPathFinder {
    constructor(grid) {
        this.grid = grid;
        this.width = grid[0].length;
        this.height = grid.length;
    }
    search(options) {
        const heuristicFn = options.heuristic === 'manhattan' ? this.manhattanDistance.bind(this) : this.euclideanDistance.bind(this);
        const firstNode = {
            location: options.start,
            cost: 0,
            heuristicCost: heuristicFn(options.start, options.goal),
            previous: null
        };
        const queue = [firstNode];
        while (queue.length !== 0) {
            const node = queue.pop();
            if (!node) {
                break;
            }
            // console.log(`pop node at ${node.location.r},${node.location.c}`);
            if (node.location.r === options.goal.r && node.location.c === options.goal.c) {
                return this.constructResult(node);
            }
            // Non-random order of precedence is right, left, down, up
            const nextSteps = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            if (options.randomize) {
                (0, random_1.shuffle)(nextSteps);
            }
            for (const [dr, dc] of nextSteps) {
                const nr = node.location.r + dr;
                const nc = node.location.c + dc;
                const newLocation = { r: nr, c: nc };
                // Don't visit this location if going out of bounds
                if (nr < 0 || nc < 0 || nr >= this.height || nc >= this.width) {
                    continue;
                }
                const tileCost = this.grid[nr][nc];
                // Don't visit this location if it's unwalkable
                if (tileCost === null) {
                    continue;
                }
                // Don't visit this location if this node has already visited it
                if (this.hasVisitedLocation(node, newLocation)) {
                    continue;
                }
                queue.push({
                    location: newLocation,
                    cost: node.cost + tileCost,
                    heuristicCost: heuristicFn(newLocation, options.goal),
                    previous: node
                });
            }
            // Shuffle the list so we visit the most promising node next
            // TODO: We should be using a heap for this
            queue.sort((x, y) => (y.cost + y.heuristicCost) - (x.cost + x.heuristicCost));
        }
        return {
            success: false,
            cost: 0,
            path: [],
            steps: [],
            semanticSteps: []
        };
        ;
    }
    constructResult(node) {
        // Construct the resulting path
        const path = [];
        let curr = node;
        while (curr) {
            path.unshift(curr.location);
            curr = curr.previous;
        }
        // Construct the relative step lists
        const steps = [];
        const semanticSteps = [];
        for (let i = 1; i < path.length; i++) {
            const prev = path[i - 1];
            const loc = path[i];
            const dr = loc.r - prev.r;
            const dc = loc.c - prev.c;
            const relativeLocation = { dr, dc };
            steps.push(relativeLocation);
            if (dr === -1 && dc === 0) {
                semanticSteps.push('up');
            }
            else if (dr === 1 && dc === 0) {
                semanticSteps.push('down');
            }
            else if (dr === 0 && dc === -1) {
                semanticSteps.push('left');
            }
            else if (dr === 0 && dc === 1) {
                semanticSteps.push('right');
            }
            else {
                throw new Error(`Encountered an unexpected relative location: ${dr}, ${dc}`);
            }
        }
        return {
            success: true,
            cost: node.cost,
            path,
            steps,
            semanticSteps
        };
    }
    hasVisitedLocation(node, location) {
        if (node === null) {
            return false;
        }
        if (node.location.r === location.r && node.location.c === location.c) {
            return true;
        }
        return this.hasVisitedLocation(node.previous, location);
    }
    manhattanDistance(from, to) {
        return Math.abs(to.r - from.r) + Math.abs(to.c - from.c);
    }
    euclideanDistance(from, to) {
        return Math.sqrt(Math.pow(to.r - from.r, 2) + Math.pow(to.c - from.c, 2));
    }
}
exports.AStarPathFinder = AStarPathFinder;
//# sourceMappingURL=a-star.js.map