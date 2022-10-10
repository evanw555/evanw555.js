import { expect } from 'chai';
import { shuffleWithDependencies } from '../../src/utils/random';

describe('Random Utils tests', () => {
    it('randomizes with order dependences', () => {
        const data = ['second', 'third', 'first', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'three', 'two', 'one', 'second2', 'third2'];
        const dependencies = {
            third: 'second',
            second: 'first',
            third2: 'second2',
            second2: 'first',
            three: 'two',
            two: 'one'
        };

        for (let i = 0; i < 100; i++) {
            const result = shuffleWithDependencies(data, dependencies);
            const firstIndex = result.indexOf('first');
            const secondIndex = result.indexOf('second');
            const thirdIndex = result.indexOf('third');
            const second2Index = result.indexOf('second2');
            const third2Index = result.indexOf('third2');
            const oneIndex = result.indexOf('one');
            const twoIndex = result.indexOf('two');
            const threeIndex = result.indexOf('three');
            // The main linear nodes must be in order
            expect(firstIndex).is.lessThan(secondIndex, 'first must be before second');
            expect(secondIndex).is.lessThan(thirdIndex, 'second must be before third');
            // The branch of the main tree must be in order
            expect(firstIndex).is.lessThan(second2Index, 'first must be before second2');
            expect(second2Index).is.lessThan(third2Index, 'second2 must be before third2');
            // The linear nodes of the disconnected tree must be in order
            expect(oneIndex).is.lessThan(twoIndex, 'one must be before two');
            expect(twoIndex).is.lessThan(threeIndex, 'two must be before three');
            // The resulting list must contain each element of the origin list exactly once
            expect(result).to.be.length(data.length);
            expect(data.every(x => result.includes(x))).true;
        }
    });
});
