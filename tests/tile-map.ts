import { expect } from 'chai';
import { TileMap, TileMapLocation } from '../src/tile-map';

describe('TileMap Tests', () => {
    it('can initialize a tile map', () => {
        const tileMap = new TileMap([
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ]);
        expect(tileMap.getRows()).to.equal(4);
        expect(tileMap.getColumns()).to.equal(3);

        let error: Error | null = null;
        try {
            const tileMap = new TileMap([
                [0, 0, 0],
                [0, 0, 0],
                [0, 0]
            ]);
        } catch (err) {
            error = err as Error;
        }
        expect(error?.message).to.equal('Expected all rows of TileMap to be 3 columns wide, but found a row 2 wide');
    });

    it('can check tiles', () => {
        const tileMap = new TileMap([
            [0, 0, 0],
            [0, 2, 0],
            [1, 0, 3],
            [0, 0, 0]
        ]);

        expect(tileMap.getTile(new TileMapLocation(0, 0))).to.equal(0);
        expect(tileMap.getTile(new TileMapLocation(2, 0))).to.equal(1);
        expect(tileMap.getTile(new TileMapLocation(2, 2))).to.equal(3);

        expect(tileMap.isTileType(new TileMapLocation(0, 0), 0)).true;
        expect(tileMap.isTileType(new TileMapLocation(2, 0), 1)).true;
        expect(tileMap.isTileType(new TileMapLocation(2, 2), 3)).true;
        expect(tileMap.isTileType(new TileMapLocation(2, 2), 0)).false;
        expect(tileMap.isTileType(new TileMapLocation(-1, -1), 3)).false;
    });

    it('can check tiles', () => {
        const tileMap = new TileMap([
            [0, 0, 0],
            [0, 2, 0],
            [1, 0, 3],
            [0, 0, 0]
        ]);

        expect(tileMap.getTile(new TileMapLocation(0, 0))).to.equal(0);
        expect(tileMap.getTile(new TileMapLocation(2, 0))).to.equal(1);
        expect(tileMap.getTile(new TileMapLocation(2, 2))).to.equal(3);

        expect(tileMap.isTileType(new TileMapLocation(0, 0), 0)).true;
        expect(tileMap.isTileType(new TileMapLocation(2, 0), 1)).true;
        expect(tileMap.isTileType(new TileMapLocation(2, 2), 3)).true;
        expect(tileMap.isTileType(new TileMapLocation(2, 2), 0)).false;
        expect(tileMap.isTileType(new TileMapLocation(-1, -1), 3)).false;
    });

    it('can get locations between two locations', () => {
        const tileMap = new TileMap([
            [0, 0, 0],
            [0, 2, 0],
            [1, 0, 3],
            [0, 0, 0]
        ]);

        const locationsBetween = tileMap.getLocationsBetween(new TileMapLocation(0, 0), new TileMapLocation(3, 0));
        expect(locationsBetween.join(',')).to.equal('A1,B1,C1,D1');

        const locationsBetween2 = tileMap.getLocationsBetween(new TileMapLocation(1, 1), new TileMapLocation(1, 2));
        expect(locationsBetween2.join(',')).to.equal('B2,B3');

        const locationsBetween3 = tileMap.getLocationsBetween(new TileMapLocation(2, 1), new TileMapLocation(2, 1));
        expect(locationsBetween3.join(',')).to.equal('C2');
    });

    it('can compute adjacent locations', () => {
        const tileMap = new TileMap([
            [0, 0, 0],
            [0, 2, 0],
            [1, 0, 3],
            [0, 0, 0]
        ]);

        // Check if two locations are adjacent
        expect(tileMap.isAdjacent(new TileMapLocation(0, 0), new TileMapLocation(0, 1))).true;
        expect(tileMap.isAdjacent(new TileMapLocation(0, 0), new TileMapLocation(0, -1))).false; // Out-of-bounds
        expect(tileMap.isAdjacent(new TileMapLocation(0, 0), new TileMapLocation(1, 1))).false;
        expect(tileMap.isAdjacent(new TileMapLocation(2, 2), new TileMapLocation(1, 2))).true;

        // Can produce adjacent locations
        expect(tileMap.getAdjacentLocations(new TileMapLocation(0, 0)).join(',')).to.equal('B1,A2');
        expect(tileMap.getAdjacentLocations(new TileMapLocation(1, 1)).join(',')).to.equal('A2,C2,B1,B3');
        // With override
        expect(tileMap.getAdjacentLocationsOrOverride(new TileMapLocation(1, 1), new TileMapLocation(2, 2)).join(',')).to.equal('C3');
    });
});
