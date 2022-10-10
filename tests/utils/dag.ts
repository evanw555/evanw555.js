import { expect } from 'chai';
import { flattenDAG } from '../../src/utils/dag';

describe('DAG tests', () => {
    it('flattens linear DAGs', () => {
        expect(flattenDAG({
            a: ['b'],
            c: ['d'],
            b: ['c']
        }).join(',')).to.equal('a,b,c,d');
    });

    it('flattens disconnected linear DAGs', () => {
        expect(flattenDAG({
            a: ['b'],
            c: ['d'],
            b: ['c'],
            // Isolated sub-DAG
            z: ['y'],
            y: ['x']
        }).join(',')).to.equal('a,b,c,d,z,y,x');
    });

    it('flattens branching DAGs', () => {
        expect(flattenDAG({
            a: ['l', 'm', 'n', 'o'],
            l: ['z', 'x'],
            m: ['z'],
            n: ['z'],
            o: ['z'],
            x: ['z'],
            z: ['b']
        }).join(',')).to.equal('a,l,m,n,o,x,z,b');
    });

    it('flattens disconnected branching DAGs', () => {
        expect(flattenDAG({
            a: ['l', 'm', 'n', 'o'],
            l: ['z'],
            m: ['z'],
            n: ['z'],
            o: ['z'],
            z: ['b'],
            c: ['d', 'e'],
            d: ['w'],
            e: ['w']
        }).join(',')).to.equal('a,c,d,e,l,m,n,o,w,z,b');
    });

    it('fails on cyclic DAGs', () => {
        expect(flattenDAG.bind(null, {
            a: ['b'],
            b: ['c'],
            c: ['a']
        })).to.throw('This DAG contains a cycle!');
    });
});
