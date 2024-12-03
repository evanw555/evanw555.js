import { expect } from 'chai';
import { shuffleWithDependencies, shuffleCycle } from '../../src/utils/random';

describe('Random Utils tests', () => {
    it('shuffles with dependencies', () => {
        const data = ['second', 'third', 'first', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'three', 'two', 'one', 'second2', 'third2', 'last'];
        const dependencies = {
            third: ['second'],
            second: ['first'],
            third2: ['second2'],
            second2: ['first'],
            last: ['third', 'third2'],
            three: ['two'],
            two: ['one']
        };

        for (let i = 0; i < 100; i++) {
            const result = shuffleWithDependencies(data, dependencies);
            const firstIndex = result.indexOf('first');
            const secondIndex = result.indexOf('second');
            const thirdIndex = result.indexOf('third');
            const second2Index = result.indexOf('second2');
            const third2Index = result.indexOf('third2');
            const lastIndex = result.indexOf('last');
            const oneIndex = result.indexOf('one');
            const twoIndex = result.indexOf('two');
            const threeIndex = result.indexOf('three');
            // The main linear nodes must be in order
            expect(firstIndex).is.lessThan(secondIndex, 'first must be before second');
            expect(secondIndex).is.lessThan(thirdIndex, 'second must be before third');
            // The branch of the main tree must be in order
            expect(firstIndex).is.lessThan(second2Index, 'first must be before second2');
            expect(second2Index).is.lessThan(third2Index, 'second2 must be before third2');
            // The last node (which depends on multiple nodes) must be after both main branches
            expect(thirdIndex).is.lessThan(lastIndex, 'third must be before last');
            expect(third2Index).is.lessThan(lastIndex, 'third2 must be before last');
            // The linear nodes of the disconnected tree must be in order
            expect(oneIndex).is.lessThan(twoIndex, 'one must be before two');
            expect(twoIndex).is.lessThan(threeIndex, 'two must be before three');
            // The resulting list must contain each element of the origin list exactly once
            expect(result).to.be.length(data.length);
            expect(data.every(x => result.includes(x))).true;
        }
    });
    
    it('shuffles with empty dependencies', () => {
        expect(shuffleWithDependencies(['hello'], {}).join('')).to.equal('hello');
        // Ensure it contains exactly three elements with no "undefined"
        expect(shuffleWithDependencies(['a','b','c'], {}).join('').length).to.equal(3);
    })

    it('shuffles into cycles with preferences', () => {
        const data = ['one','two','three','four','five','six','seven','eight','nine','ten'];
        const shuffled = shuffleCycle(data, {
            deterministic: true,
            whitelists: { one: ['eight'], five: ['one','eleven','twelve'], six: ['ten','twelve','nine'], seven: ['three','four','nine'], eight: ['thirteen','seven','three'] },
            blacklists: { four: ['thirteen','eight'], seven: ['fourteen','fifteen'], nine: ['one'], ten: ['fourteen'] }
        });
        expect(shuffled.join(',')).equals('two,five,one,eight,seven,four,six,ten,three,nine');
    });
});
