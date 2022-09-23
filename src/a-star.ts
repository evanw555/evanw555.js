import { shuffle } from "./utils/random";

type GridElement = number | null;

interface Location {
    r: number,
    c: number
}

interface RelativeLocation {
    dr: number,
    dc: number
}

interface Node {
    location: Location,
    cost: number,
    heuristicCost: number,
    previous: Node | null
}

interface SearchOptions {
    start: Location,
    goal: Location,
    heuristic: 'manhattan' | 'euclidean',
    randomize?: boolean
}

type SemanticStep = 'up' | 'down' | 'left' | 'right';

interface SearchResult {
    success: boolean,
    cost: number,
    path: Location[],
    steps: RelativeLocation[],
    semanticSteps: SemanticStep[]
}

export class AStarPathFinder {
    private readonly grid: GridElement[][];
    private readonly width: number;
    private readonly height: number;

    constructor(grid: GridElement[][]) {
        this.grid = grid;
        this.width = grid[0].length;
        this.height = grid.length;
    }

    search(options: SearchOptions): SearchResult {
        const heuristicFn = options.heuristic === 'manhattan' ? this.manhattanDistance.bind(this) : this.euclideanDistance.bind(this);
        const firstNode = {
            location: options.start,
            cost: 0,
            heuristicCost: heuristicFn(options.start, options.goal),
            previous: null
        }

        const visitedLocations: Set<string> = new Set();
        const toLocationString = (_r: number, _c: number): string => {
            return `${_r},${_c}`;
        };

        const queue: Node[] = [firstNode];

        while (queue.length !== 0) {
            const node = queue.pop();

            if (!node) {
                break;
            }

            visitedLocations.add(toLocationString(node.location.r, node.location.c));

            if (node.location.r === options.goal.r && node.location.c === options.goal.c) {
                return this.constructResult(node);
            }

            // Non-random order of precedence is right, left, down, up
            const nextSteps = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            if (options.randomize) {
                shuffle(nextSteps);
            }

            for (const [dr, dc] of nextSteps) {
                const nr = node.location.r + dr;
                const nc = node.location.c + dc;
                const newLocation = { r: nr, c: nc };

                // Don't visit this location if going out of bounds
                if (nr < 0 || nc < 0 || nr >= this.height || nc >= this.width) {
                    continue;
                }

                const tileCost: GridElement = this.grid[nr][nc];

                // Don't visit this location if it's unwalkable
                if (tileCost === null) {
                    continue;
                }

                // Don't visit this location if it's already been visited by any path (this only works because our heuristics are consistent)
                if (visitedLocations.has(toLocationString(nr, nc))) {
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
        };;
    }

    private constructResult(node: Node): SearchResult {
        // Construct the resulting path
        const path: Location[] = [];
        let curr: Node | null = node;
        while (curr) {
            path.unshift(curr.location);
            curr = curr.previous;
        }

        // Construct the relative step lists
        const steps: RelativeLocation[] = [];
        const semanticSteps: SemanticStep[] = [];
        for (let i = 1; i < path.length; i++) {
            const prev = path[i - 1];
            const loc = path[i];
            const dr = loc.r - prev.r;
            const dc = loc.c - prev.c;
            const relativeLocation = { dr, dc };
            steps.push(relativeLocation);
            if (dr === -1 && dc === 0) {
                semanticSteps.push('up');
            } else if (dr === 1 && dc === 0) {
                semanticSteps.push('down');
            } else if (dr === 0 && dc === -1) {
                semanticSteps.push('left');
            } else if (dr === 0 && dc === 1) {
                semanticSteps.push('right');
            } else {
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

    private hasVisitedLocation(node: Node | null, location: Location): boolean {
        if (node === null) {
            return false;
        }
        if (node.location.r === location.r && node.location.c === location.c) {
            return true;
        }
        return this.hasVisitedLocation(node.previous, location);
    }

    private manhattanDistance(from: Location, to: Location): number {
        return Math.abs(to.r - from.r) + Math.abs(to.c - from.c);
    }

    private euclideanDistance(from: Location, to: Location): number {
        return Math.sqrt(Math.pow(to.r - from.r, 2) + Math.pow(to.c - from.c, 2));
    }
}