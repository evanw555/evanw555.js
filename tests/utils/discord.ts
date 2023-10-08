import { expect } from 'chai';
import { toDiscordTimestamp, getPollChoiceKeys, DiscordTimestampFormat } from '../../src/utils/discord';

describe('Discord Utils tests', () => {
    it('converts dates to timestamp strings', () => {
        const d = new Date(1234567890123);
        expect(toDiscordTimestamp(d)).to.equal('<t:1234567890:f>');
        expect(toDiscordTimestamp(d, DiscordTimestampFormat.ShortDateTime)).to.equal('<t:1234567890:f>');
        expect(toDiscordTimestamp(d, DiscordTimestampFormat.LongTime)).to.equal('<t:1234567890:T>');
        expect(toDiscordTimestamp(d, DiscordTimestampFormat.Relative)).to.equal('<t:1234567890:R>');
    });

    it('gets poll choice keys for basic cases', () => {
        const values: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        expect(getPollChoiceKeys(values.slice(0, 1), { avoidNumbers: true }).join(',')).to.equal('🔴');
        expect(getPollChoiceKeys(values.slice(0, 2))).to.be.length(2);
        expect(getPollChoiceKeys(values.slice(0, 3))).to.be.length(3);
        expect(getPollChoiceKeys(values.slice(0, 4))).to.be.length(4);
        expect(getPollChoiceKeys(values.slice(0, 5), { avoidNumbers: true }).join(',')).to.equal('🔴,🟠,🟡,🟢,🔵');
        expect(getPollChoiceKeys(values.slice(0, 6), { avoidNumbers: true }).join(',')).to.equal('🔴,🟠,🟡,🟢,🔵,🟣');
        expect(getPollChoiceKeys(values.slice(0, 7))).to.be.length(7);
    });

    it('gets poll choice keys for override cases', () => {
        const overrides = {
            'FOO': ['1'],
            'BAR': ['2'],
            'BAZ': ['3'],
            'BANG': ['4']
        };
        expect(getPollChoiceKeys(['FOO', 'a'], { overrides, avoidNumbers: true }).join(',')).to.equal('1,🔴');
        expect(getPollChoiceKeys(['FOO', 'a', 'b', 'c', 'd', 'e', 'BAR'], { overrides, avoidNumbers: true }).join(',')).to.equal('1,🔴,🟠,🟡,🟢,🔵,2');
        expect(getPollChoiceKeys(['FOO', 'BAZ', 'a', 'b', 'c', 'd', 'e', 'BANG', 'BAR'], { overrides, avoidNumbers: true }).join(',')).to.equal('1,3,🔴,🟠,🟡,🟢,🔵,4,2');
    });
});
