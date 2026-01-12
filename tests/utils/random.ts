import { expect } from 'chai';
import { shuffleWithDependencies, shuffleCycle, getRandomlyDistributedAssignments, roundByChance } from '../../src/utils/random';
import { getObjectSize } from '../../src/utils/collections';

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
    });

    it('shuffles into cycles with preferences', () => {
        const data = ['one','two','three','four','five','six','seven','eight','nine','ten'];
        const shuffled = shuffleCycle(data, {
            deterministic: true,
            whitelists: { one: ['eight'], five: ['one','eleven','twelve'], six: ['ten','twelve','nine'], seven: ['three','four','nine'], eight: ['thirteen','seven','three'] },
            blacklists: { four: ['thirteen','eight'], seven: ['fourteen','fifteen'], nine: ['one'], ten: ['fourteen'] }
        });
        expect(shuffled.join(',')).equals('two,five,one,eight,seven,four,six,ten,three,nine');
    });
    
    it('randomly distributes assignments', () => {
        const keys = ['one', 'two', 'three'];
        const values = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

        for (let valuesPerKey = 1; valuesPerKey < values.length; valuesPerKey++) {
            const result = getRandomlyDistributedAssignments(keys, values, { valuesPerKey });

            // Assert that the result is reasonable
            expect(getObjectSize(result)).equals(keys.length);
            expect(Object.values(result).every(a => a.length === valuesPerKey)).true;

            // Assert that all assignments are within 1 usage of each other, and that they're all unique
            const usageCountsPerValue: Record<string, number> = {};
            for (const assignments of Object.values(result)) {
                for (const a of assignments) {
                    usageCountsPerValue[a] = (usageCountsPerValue[a] ?? 0) + 1;
                }
            }
            const usageCounts: Set<number> = new Set();
            for (const count of Object.values(usageCountsPerValue)) {
                usageCounts.add(count);
            }
            expect(usageCounts.size).lessThanOrEqual(2);
        }
    })

    it('rounds numbers by chance', () => {
        const runTest = (n: number) => {
            const result: Record<string, number> = {};
            for (let i = 0; i < 1000; i++) {
                const r = roundByChance(n);
                result[r] = (result[r] ?? 0) + 1;
            }
            return result;
        }

        // Round a number way more likely up than down
        const r1 = runTest(9.9);
        expect(getObjectSize(r1)).equals(2);
        expect(r1[10]).greaterThan(500);
        expect(r1[9]).lessThan(500);

        // Same thing but negative
        const r2 = runTest(-9.9);
        expect(getObjectSize(r2)).equals(2);
        expect(r2[-10]).greaterThan(500);
        expect(r2[-9]).lessThan(500);

        // Whole numbers should not be rounded
        const r3 = runTest(10);
        expect(getObjectSize(r3)).equals(1);
        expect(r3[10]).equals(1000);

        // Zero should behave normally
        const r4 = runTest(0);
        expect(getObjectSize(r4)).equals(1);
        expect(r4[0]).equals(1000);
    })
});
