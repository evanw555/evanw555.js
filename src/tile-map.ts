import { fromLetterId, toLetterId } from "./utils/misc";

export class TileMapLocation {
    private readonly row: number;
    private readonly column: number;

    constructor(row: number, column: number) {
        this.row = row;
        this.column = column;
    }

    getRow(): number {
        return this.row;
    }

    getColumn(): number {
        return this.column;
    }

    equals(other: TileMapLocation): boolean {
        return this.row === other.row && this.column === other.column;
    }

    isBelow(other: TileMapLocation): boolean {
        return this.row > other.row;
    }

    isAbove(other: TileMapLocation): boolean {
        return this.row < other.row;
    }

    isLeftOf(other: TileMapLocation): boolean {
        return this.column < other.column;
    }

    isRightOf(other: TileMapLocation): boolean {
        return this.column > other.column;
    }

    getDirectionTo(other: TileMapLocation): Direction {
        if (this.isBelow(other)) {
            return 'up';
        }
        if (this.isAbove(other)) {
            return 'down';
        }
        if (this.isLeftOf(other)) {
            return 'right';
        }
        if (this.isRightOf(other)) {
            return 'left';
        }
        throw new Error(`Cannot get cardinal direction from ${this.serialize()} to ${other.serialize()}`);
    }

    getNormalizedVectorTo(other: TileMapLocation): TileMapVector {
        if (this.row !== other.row && this.row !== other.column) {
            throw new Error(`Cannot compute normalized offset from ${this.serialize()} to ${other.serialize()}, as they're not in the same row or column`);
        }
        if (this.isBelow(other)) {
            return [-1, 0];
        }
        if (this.isAbove(other)) {
            return [1, 0];
        }
        if (this.isLeftOf(other)) {
            return [0, 1];
        }
        if (this.isRightOf(other)) {
            return [0, -1];
        }
        return [0, 0];
    }

    toObject(): { r: number, c: number } {
        return {
            r: this.row,
            c: this.column
        };
    }

    clone(dr: number = 0, dc: number = 0): TileMapLocation {
        return new TileMapLocation(this.row + dr, this.column + dc);
    }

    serialize(): string {
        return `${toLetterId(this.row)}${this.column + 1}`;
    }

    toString(): string {
        return this.serialize();
    }

    private static parse(location: string): TileMapLocation | undefined {
        if (location) {
            const match = location.match(/^([a-zA-Z]+)([0-9]+)$/);
            if (match) {
                return new TileMapLocation(fromLetterId(match[1]), parseInt(match[2]) - 1);
            }
        }
    }
}

export type TileMapVector = [number, number];
export type Direction = 'up' | 'down' | 'left' | 'right';

export class TileMap {
    private static readonly VECTORS_BY_DIRECTION: Record<Direction, TileMapVector> = {
        up: [-1, 0],
        down: [1, 0],
        left: [0, -1],
        right: [0, 1]
    };
    private static readonly DIRECTIONS: Direction[] = Object.keys(TileMap.VECTORS_BY_DIRECTION) as Direction[];

    private readonly map: number[][];
    private readonly rows: number;
    private readonly columns: number;

    constructor(map: number[][]) {
        // Validate the map dimensions
        if (map.length === 0) {
            throw new Error('Cannot create a TileMap with no rows');
        }
        const expectedColumns = map[0].length;
        for (const row of map) {
            if (row.length !== expectedColumns) {
                throw new Error(`Expected all rows of TileMap to be ${expectedColumns} columns wide, but found a row ${row.length} wide`);
            }
        }
        this.map = map;
        this.rows = map.length;
        this.columns = expectedColumns;
    }

    getRows(): number {
        return this.rows;
    }

    getColumns(): number {
        return this.columns;
    }

    isInBounds(location: TileMapLocation): boolean {
        return location.getRow() >= 0 && location.getColumn() >= 0 && location.getRow() < this.rows && location.getColumn() < this.columns;
    }

    getTile(location: TileMapLocation): number {
        if (!this.isInBounds(location)) {
            throw new Error(`Cannot get tile at ${location.serialize()}, as it's out-of-bounds`);
        }
        return this.map[location.getRow()][location.getColumn()];
    }

    isTileType(location: TileMapLocation, type: number): boolean {
        if (!this.isInBounds(location)) {
            return false;
        }
        return this.getTile(location) === type;
    }

    forEachLocation(callback: (location: TileMapLocation) => void): void {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                callback(new TileMapLocation(r, c));
            }
        }
    }

    getLocationsBetween(from: TileMapLocation, to: TileMapLocation): TileMapLocation[] {
        if (from.getRow() !== to.getRow() && from.getColumn() !== to.getColumn()) {
            throw new Error(`Cannot compute locations between ${from} and ${to}, as they're not in the same row or column`);
        }
        if (!this.isInBounds(from)) {
            throw new Error(`Cannot compute locations between ${from} and ${to}, as ${from} is out-of-bounds`);
        }
        if (!this.isInBounds(to)) {
            throw new Error(`Cannot compute locations between ${from} and ${to}, as ${to} is out-of-bounds`);
        }
        let current = from.clone();
        const result: TileMapLocation[] = [current];
        const offset = from.getNormalizedVectorTo(to);
        while (this.isInBounds(current)) {
            if (current.equals(to)) {
                return result;
            }
            current = current.clone(offset[0], offset[1]);
            result.push(current);
        }
        throw new Error(`Cannot compute locations between ${from} and ${to}, as the computation somehow went out of bounds at ${current}`);
    }


    /**
     * @returns a list of all in-bound locations adjacent to the given location
     */
    getAdjacentLocations(location: TileMapLocation | undefined): TileMapLocation[] {
        // Emergency fallback
        if (!location) {
            return [];
        }
        const result: TileMapLocation[] = [];
        for (const [dr, dc] of TileMap.getCardinalVectors()) {
            const otherLocation = location.clone(dr, dc);
            if (this.isInBounds(otherLocation)) {
                result.push(otherLocation);
            }
        }
        return result;
    }

    /**
     * @returns a list containing just the override location, if it exists; else all in-bound locations adjacent to the given location
     */
    getAdjacentLocationsOrOverride(location: TileMapLocation | undefined, override: TileMapLocation | undefined): TileMapLocation[] {
        // Emergency fallback
        if (!location) {
            return [];
        }
        if (override) {
            return [override.clone()];
        }
        return this.getAdjacentLocations(location);
    }

    isAdjacent(l1: TileMapLocation, l2: TileMapLocation): boolean {
        // TODO: This is a pretty dumb way to check... or is it?
        return this.getAdjacentLocations(l1).some(la => la.equals(l2));
    }

    private static getCardinalVectors(magnitude: number = 1): [TileMapVector, TileMapVector, TileMapVector, TileMapVector] {
        return [[-magnitude, 0], [magnitude, 0], [0, -magnitude], [0, magnitude]];
    }

    private static getDirectionFromVector(vector: TileMapVector): Direction {
        for (const direction of TileMap.DIRECTIONS) {
            const cardinalVector = TileMap.VECTORS_BY_DIRECTION[direction];
            if (cardinalVector[0] === vector[0] && cardinalVector[1] === vector[1]) {
                return direction as Direction;
            }
        }
        throw new Error(`Vector ${vector} cannot be mapped to a cardinal direction!`);
    }
}