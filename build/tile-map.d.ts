export declare class TileMapLocation {
    private readonly row;
    private readonly column;
    constructor(row: number, column: number);
    getRow(): number;
    getColumn(): number;
    equals(other: TileMapLocation): boolean;
    isBelow(other: TileMapLocation): boolean;
    isAbove(other: TileMapLocation): boolean;
    isLeftOf(other: TileMapLocation): boolean;
    isRightOf(other: TileMapLocation): boolean;
    getDirectionTo(other: TileMapLocation): Direction;
    getNormalizedVectorTo(other: TileMapLocation): TileMapVector;
    toObject(): {
        r: number;
        c: number;
    };
    clone(dr?: number, dc?: number): TileMapLocation;
    serialize(): string;
    toString(): string;
    private static parse;
}
export type TileMapVector = [number, number];
export type Direction = 'up' | 'down' | 'left' | 'right';
export declare class TileMap {
    private static readonly VECTORS_BY_DIRECTION;
    private static readonly DIRECTIONS;
    private readonly map;
    private readonly rows;
    private readonly columns;
    constructor(map: number[][]);
    getRows(): number;
    getColumns(): number;
    isInBounds(location: TileMapLocation): boolean;
    getTile(location: TileMapLocation): number;
    isTileType(location: TileMapLocation, type: number): boolean;
    forEachLocation(callback: (location: TileMapLocation) => void): void;
    getLocationsBetween(from: TileMapLocation, to: TileMapLocation): TileMapLocation[];
    /**
     * @returns a list of all in-bound locations adjacent to the given location
     */
    getAdjacentLocations(location: TileMapLocation | undefined): TileMapLocation[];
    /**
     * @returns a list containing just the override location, if it exists; else all in-bound locations adjacent to the given location
     */
    getAdjacentLocationsOrOverride(location: TileMapLocation | undefined, override: TileMapLocation | undefined): TileMapLocation[];
    isAdjacent(l1: TileMapLocation, l2: TileMapLocation): boolean;
    private static getCardinalVectors;
    private static getDirectionFromVector;
}
//# sourceMappingURL=tile-map.d.ts.map