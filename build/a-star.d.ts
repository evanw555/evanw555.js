declare type GridElement = number | null;
interface Location {
    r: number;
    c: number;
}
interface RelativeLocation {
    dr: number;
    dc: number;
}
interface SearchOptions {
    start: Location;
    goal: Location;
    heuristic: 'manhattan' | 'euclidean';
    randomize?: boolean;
}
declare type SemanticStep = 'up' | 'down' | 'left' | 'right';
interface SearchResult {
    success: boolean;
    cost: number;
    path: Location[];
    steps: RelativeLocation[];
    semanticSteps: SemanticStep[];
}
export declare class AStarPathFinder {
    private readonly grid;
    private readonly width;
    private readonly height;
    constructor(grid: GridElement[][]);
    search(options: SearchOptions): SearchResult;
    private constructResult;
    private hasVisitedLocation;
    private manhattanDistance;
    private euclideanDistance;
}
export {};
//# sourceMappingURL=a-star.d.ts.map