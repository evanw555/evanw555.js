import { expect } from 'chai';
import { toLetterId, fromLetterId, collapseRedundantStrings, naturalJoin, getNumberBetween } from '../../src/utils/misc';

describe('Misc. Utility tests', () => {
    it ('can naturally join strings', () => {
        expect(naturalJoin(['x'])).equals('x');
        expect(naturalJoin(['x', 'y'])).equals('x and y');
        expect(naturalJoin(['x', 'y', 'z'])).equals('x, y, and z');

        // Handle overridden conjunctions
        expect(naturalJoin(['x'], { conjunction: '&'})).equals('x');
        expect(naturalJoin(['x', 'y'], { conjunction: '&'})).equals('x & y');
        expect(naturalJoin(['x', 'y', 'z'], { conjunction: '&'})).equals('x, y, & z');

        // Handle boldness
        expect(naturalJoin(['x'], { bold: true})).equals('**x**');
        expect(naturalJoin(['x', 'y'], { bold: true})).equals('**x** and **y**');
        expect(naturalJoin(['x', 'y', 'z'], { bold: true})).equals('**x**, **y**, and **z**');

        // Handle a mix of options
        expect(naturalJoin(['x', 'y', 'z', '123'], { conjunction: 'then', bold: true})).equals('**x**, **y**, **z**, then **123**');
    });

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

    it('can collapse redundant strings in a list', () => {
        const transformer = (element: string, n: number): string => {
            return element + (n > 1 ? ` (x${n})` : '');
        };
        expect(collapseRedundantStrings([], transformer).join(',')).to.equal('');
        expect(collapseRedundantStrings(['a'], transformer).join(',')).to.equal('a');
        expect(collapseRedundantStrings(['a', 'b'], transformer).join(',')).to.equal('a,b');
        expect(collapseRedundantStrings(['a', 'b', 'c'], transformer).join(',')).to.equal('a,b,c');
        expect(collapseRedundantStrings(['a', 'a'], transformer).join(',')).to.equal('a (x2)');
        expect(collapseRedundantStrings(['a', 'a', 'b', 'b'], transformer).join(',')).to.equal('a (x2),b (x2)');
        expect(collapseRedundantStrings(['a', 'b', 'a', 'b'], transformer).join(',')).to.equal('a,b,a,b');
        expect(collapseRedundantStrings(['a', 'a', 'a', 'b', 'a', 'a'], transformer).join(',')).to.equal('a (x3),b,a (x2)');
        expect(collapseRedundantStrings(['a', 'b', 'c', 'c', 'c', 'd'], transformer).join(',')).to.equal('a,b,c (x3),d');
    });

    it('can get numbers between two numbers', () => {
        expect(getNumberBetween(0, 100)).to.equal(50);
        expect(getNumberBetween(0, 100, 0)).to.equal(0);
        expect(getNumberBetween(0, 100, 1)).to.equal(100);
        expect(getNumberBetween(90, 190, 0.75)).to.equal(165);
        expect(getNumberBetween(1111, 1112, 0.1)).to.equal(1111.1);
        expect(getNumberBetween(0.2, 0.45)).to.equal(0.325);

        // Handle weird cases
        expect(getNumberBetween(0, 100, -1)).to.equal(-100);
        expect(getNumberBetween(0, 100, 2)).to.equal(200);
        expect(getNumberBetween(1000, 900, 0.1)).to.equal(990);
    });
});
