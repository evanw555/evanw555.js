import { expect } from 'chai';
import { findCycle } from '../../src/utils/graph';

describe('Graph tests', () => {
    it('detects simple cycles', () => {
        // No cycle
        const resultN = findCycle({
            x: ['a', 'y'],
            y: ['b', 'z'],
            z: ['a', 'c']
        });
        expect(resultN).to.be.undefined;
        // 1-node cycle
        const result1 = findCycle({
            x: ['a', 'x']
        });
        expect(result1).to.not.be.undefined;
        expect(result1?.join(',')).to.equal('x');
        // 2-node cycle
        const result2 = findCycle({
            x: ['a', 'y'],
            y: ['b', 'x']
        });
        expect(result2).to.not.be.undefined;
        expect(result2?.join(',')).to.equal('x,y');
        // 3-node cycle
        const result3 = findCycle({
            a: ['x'],
            x: ['d', 'y'],
            y: ['b', 'z'],
            z: ['c', 'x']
        });
        expect(result3).to.not.be.undefined;
        expect(result3?.join(',')).to.equal('x,y,z');
        // 5-node cycle
        const result5 = findCycle({
            j: ['k'],
            k: ['a', 'b', 'i'],
            i: ['c', 'x'],
            x: ['a', 'z'],
            y: ['b', 'j'],
            z: ['c', 'y']
        });
        expect(result5).to.not.be.undefined;
        expect(result5?.join(',')).to.equal('i,x,z,y,j,k');
    });

    it('detects cycles on disjointed graphs', () => {
        // No cycle on multiple sub-graphs
        const result1 = findCycle({
            a: ['b', 'c', 'd'],
            b: ['c'],
            c: ['d'],
            x: ['z'],
            y: [],
            z: ['y']
        });
        expect(result1).to.be.undefined;
        // Weird corner case
        const result2 = findCycle({
            a: [],
            b: [],
            c: []
        });
        expect(result2).to.be.undefined;
        // 3-node cycle on a separate sub-graph
        const result3 = findCycle({
            a: ['b', 'c'],
            b: ['c'],
            c: ['d'],
            x: ['y'],
            y: ['z'],
            z: ['x']
        });
        expect(result3).to.not.be.undefined;
        expect(result3?.join(',')).to.equal('x,y,z');
    });
});
