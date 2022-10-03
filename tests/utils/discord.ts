import { expect } from 'chai';
import { getPollChoiceKeys } from '../../src/utils/discord';

describe('Discord Utils tests', () => {
    it('gets poll choice keys for basic cases', () => {
        const values: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        expect(getPollChoiceKeys(values.slice(0, 1)).join(',')).to.equal('🔴');
        expect(getPollChoiceKeys(values.slice(0, 2))).to.be.length(2);
        expect(getPollChoiceKeys(values.slice(0, 3))).to.be.length(3);
        expect(getPollChoiceKeys(values.slice(0, 4)).sort().join(',')).to.equal('♠️,♣️,♥️,♦️');
        expect(getPollChoiceKeys(values.slice(0, 5)).join(',')).to.equal('🔴,🟠,🟡,🟢,🔵');
        expect(getPollChoiceKeys(values.slice(0, 6)).join(',')).to.equal('🔴,🟠,🟡,🟢,🔵,🟣');
        expect(getPollChoiceKeys(values.slice(0, 7))).to.be.length(7);
    });

    it('gets poll choice keys for override cases', () => {
        const overrides = {
            'FOO': ['1'],
            'BAR': ['2'],
            'BAZ': ['3'],
            'BANG': ['4']
        };
        expect(getPollChoiceKeys(['FOO', 'a'], { overrides }).join(',')).to.equal('1,🔴');
        expect(getPollChoiceKeys(['FOO', 'a', 'b', 'c', 'd', 'e', 'BAR'], { overrides }).join(',')).to.equal('1,🔴,🟠,🟡,🟢,🔵,2');
        expect(getPollChoiceKeys(['FOO', 'BAZ', 'a', 'b', 'c', 'd', 'e', 'BANG', 'BAR'], { overrides }).join(',')).to.equal('1,3,🔴,🟠,🟡,🟢,🔵,4,2');
    });
});
