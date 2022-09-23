import { expect } from 'chai';
import { AStarPathFinder } from '../src/a-star';

describe('A-Star Tests', () => {
    it('can route through a basic maze', () => {
        const pathfinder = new AStarPathFinder([
            [1, null, 1, 1,    1],
            [1, null, 1, null, 1],
            [1, null, 1, null, 1],
            [1, 1,    1, null, 1]
        ]);
        const result = pathfinder.search({
            start: {
                r: 0,
                c: 0
            },
            goal: {
                r: 3,
                c: 4
            },
            heuristic: 'manhattan'
        });
        expect(result.success).true;
        expect(result.cost).to.equal(13);
        expect(result.path.length).to.equal(14);
        
        expect(result.steps.map(s => `[${s.dr},${s.dc}]`).join(',')).to.equal('[1,0],[1,0],[1,0],[0,1],[0,1],[-1,0],[-1,0],[-1,0],[0,1],[0,1],[1,0],[1,0],[1,0]');
        expect(result.semanticSteps.join(',')).to.equal('down,down,down,right,right,up,up,up,right,right,down,down,down');
    });

    it('can route optimally through an open space', () => {
        const pathfinder = new AStarPathFinder([
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1]
        ]);
        const result = pathfinder.search({
            start: {
                r: 0,
                c: 0
            },
            goal: {
                r: 3,
                c: 4
            },
            heuristic: 'manhattan'
        });
        expect(result.success).true;
        expect(result.cost).to.equal(7);
        const path = result.path;
        expect(path.length).to.equal(8);
        // Expected first step of the path
        expect(path[0].r).to.equal(0);
        expect(path[0].c).to.equal(0);
        // Expected last step of the path
        expect(path[7].r).to.equal(3);
        expect(path[7].c).to.equal(4);
        // Expect some specific step to be part of the path
        // Since the non-random preference is right, left, down, up
        expect(path[4].r).to.equal(0);
        expect(path[4].c).to.equal(4);

        expect(result.semanticSteps.join(',')).to.equal('right,right,right,right,down,down,down');
    });

    it('can route optimally through an open space with random tie-breaking', () => {
        const pathfinder = new AStarPathFinder([
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1]
        ]);
        const result = pathfinder.search({
            start: {
                r: 0,
                c: 0
            },
            goal: {
                r: 3,
                c: 4
            },
            heuristic: 'manhattan',
            randomize: true
        });
        expect(result.success).true;
        expect(result.cost).to.equal(7);
        const path = result.path;
        expect(path.length).to.equal(8);
        // Expected first step of the path
        expect(path[0].r).to.equal(0);
        expect(path[0].c).to.equal(0);
        // Expected last step of the path
        expect(path[7].r).to.equal(3);
        expect(path[7].c).to.equal(4);
    });

    it('can route using path weights', () => {
        const pathfinder = new AStarPathFinder([
            [1, 9, 1, 1, 1],
            [1, 5, 1, 2, 1],
            [1, 2, 1, 5, 1],
            [1, 1, 1, 9, 1]
        ]);
        const result = pathfinder.search({
            start: {
                r: 0,
                c: 0
            },
            goal: {
                r: 3,
                c: 4
            },
            heuristic: 'manhattan'
        });
        expect(result.success).true;
        expect(result.cost).to.equal(11);
        const path = result.path;
        // The path should cut through the 2-weight tiles
        expect(path.length).to.equal(10);

        expect(result.semanticSteps.join(',')).to.equal('down,down,right,right,up,right,right,down,down');
    });

    it('fails to route for an impossible path', () => {
        const pathfinder = new AStarPathFinder([
            [1, null, 1],
            [1, null, 1],
            [1, null, 1]
        ]);
        const result = pathfinder.search({
            start: {
                r: 0,
                c: 0
            },
            goal: {
                r: 2,
                c: 2
            },
            heuristic: 'manhattan'
        });
        expect(result.success).false;
        expect(result.cost).to.equal(0);
        expect(result.path).to.be.empty;
        expect(result.steps).to.be.empty;
        expect(result.semanticSteps).to.be.empty;
    });
});
