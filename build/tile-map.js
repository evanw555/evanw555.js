"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileMap = exports.TileMapLocation = void 0;
const misc_1 = require("./utils/misc");
class TileMapLocation {
    constructor(row, column) {
        this.row = row;
        this.column = column;
    }
    getRow() {
        return this.row;
    }
    getColumn() {
        return this.column;
    }
    equals(other) {
        return this.row === other.row && this.column === other.column;
    }
    isBelow(other) {
        return this.row > other.row;
    }
    isAbove(other) {
        return this.row < other.row;
    }
    isLeftOf(other) {
        return this.column < other.column;
    }
    isRightOf(other) {
        return this.column > other.column;
    }
    getDirectionTo(other) {
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
    getNormalizedVectorTo(other) {
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
    toObject() {
        return {
            r: this.row,
            c: this.column
        };
    }
    clone(dr = 0, dc = 0) {
        return new TileMapLocation(this.row + dr, this.column + dc);
    }
    serialize() {
        return `${(0, misc_1.toLetterId)(this.row)}${this.column + 1}`;
    }
    toString() {
        return this.serialize();
    }
    static parse(location) {
        if (location) {
            const match = location.match(/^([a-zA-Z]+)([0-9]+)$/);
            if (match) {
                return new TileMapLocation((0, misc_1.fromLetterId)(match[1]), parseInt(match[2]) - 1);
            }
        }
    }
}
exports.TileMapLocation = TileMapLocation;
class TileMap {
    constructor(map) {
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
    getRows() {
        return this.rows;
    }
    getColumns() {
        return this.columns;
    }
    isInBounds(location) {
        return location.getRow() >= 0 && location.getColumn() >= 0 && location.getRow() < this.rows && location.getColumn() < this.columns;
    }
    getTile(location) {
        if (!this.isInBounds(location)) {
            throw new Error(`Cannot get tile at ${location.serialize()}, as it's out-of-bounds`);
        }
        return this.map[location.getRow()][location.getColumn()];
    }
    isTileType(location, type) {
        if (!this.isInBounds(location)) {
            return false;
        }
        return this.getTile(location) === type;
    }
    forEachLocation(callback) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                callback(new TileMapLocation(r, c));
            }
        }
    }
    getLocationsBetween(from, to) {
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
        const result = [current];
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
    getAdjacentLocations(location) {
        // Emergency fallback
        if (!location) {
            return [];
        }
        const result = [];
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
    getAdjacentLocationsOrOverride(location, override) {
        // Emergency fallback
        if (!location) {
            return [];
        }
        if (override) {
            return [override.clone()];
        }
        return this.getAdjacentLocations(location);
    }
    isAdjacent(l1, l2) {
        // TODO: This is a pretty dumb way to check... or is it?
        return this.getAdjacentLocations(l1).some(la => la.equals(l2));
    }
    static getCardinalVectors(magnitude = 1) {
        return [[-magnitude, 0], [magnitude, 0], [0, -magnitude], [0, magnitude]];
    }
    static getDirectionFromVector(vector) {
        for (const direction of TileMap.DIRECTIONS) {
            const cardinalVector = TileMap.VECTORS_BY_DIRECTION[direction];
            if (cardinalVector[0] === vector[0] && cardinalVector[1] === vector[1]) {
                return direction;
            }
        }
        throw new Error(`Vector ${vector} cannot be mapped to a cardinal direction!`);
    }
}
exports.TileMap = TileMap;
TileMap.VECTORS_BY_DIRECTION = {
    up: [-1, 0],
    down: [1, 0],
    left: [0, -1],
    right: [0, 1]
};
TileMap.DIRECTIONS = Object.keys(TileMap.VECTORS_BY_DIRECTION);
//# sourceMappingURL=tile-map.js.map