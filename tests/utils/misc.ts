import { expect } from 'chai';
import { toLetterId, fromLetterId } from '../../src/utils/misc';

describe('Misc. Utility tests', () => {
    it('can encode a number to a letter ID', () => {
        expect(toLetterId(0)).to.equal('A');
        expect(toLetterId(1)).to.equal('B');
        expect(toLetterId(25)).to.equal('Z');
        expect(toLetterId(26)).to.equal('AA');
        expect(toLetterId(27)).to.equal('AB');
        expect(toLetterId(52)).to.equal('BA');
    });

    it('can decode a letter ID to a number', () => {
        expect(fromLetterId('A')).to.equal(0);
        expect(fromLetterId('b')).to.equal(1);
        expect(fromLetterId('Z')).to.equal(25);
        expect(fromLetterId('AA')).to.equal(26);
        expect(fromLetterId('ab')).to.equal(27);
        expect(fromLetterId('Ba')).to.equal(52);

        expect(fromLetterId.bind(null, '')).to.throw('Cannot parse letter ID ""');
        expect(fromLetterId.bind(null, 'A1')).to.throw('Cannot parse letter ID "A1"');
    });
});
