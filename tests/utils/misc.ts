import { expect } from 'chai';
import { toLetterId, fromLetterId, getWordRepetitionScore, collapseRedundantStrings, naturalJoin, getNumberBetween, splitTextNaturally, getSelectedNode } from '../../src/utils/misc';

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

    it('can split text naturally', () => {
        // Handles:
        // 1. Multiple blank lines.
        // 2. Short paragraphs.
        // 3. Paragraphs with period-delimited sentences.
        // 4. Paragraphs with run-on sentences.
        // 5. Paragraphs with run-on and period-delimited sentences.
        expect(splitTextNaturally('Hello\n\n\nMy name is Evan. How are you.\n\nThis is a really very super quite long run-on sentence in a paragraph. Yes indeed.', 20).join(';'))
            .to.equal('Hello;My name is Evan.;How are you.;This is a really...;very super quite...;long run-on sente...;nce in a paragraph.;Yes indeed.');
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

    it('can select nodes in an object via selector string', () => {
        const d = {
            a: {
                b: {
                    c: 123
                }
            },
            other: ['one', 'two', 'three'],
            ambiguous: {
                aaa: true,
                AAA: false,
                AaA: null
            }
        };

        // Standard cases
        expect(getSelectedNode(d, '.')).equals(d, 'Root select should return the whole object back');
        expect(getSelectedNode(d, '')).equals(d, 'Empty select should return the whole object back');
        expect(getSelectedNode(d, 'a')).equals(d.a, 'Can select one node deep');
        expect(getSelectedNode(d, '.a')).equals(d.a, 'Can select one node deep with leading separator');
        expect(getSelectedNode(d, 'a.b')).equals(d.a.b, 'Can select two nodes deep');
        expect(getSelectedNode(d, 'a.b.c')).equals(d.a.b.c, 'Can select three nodes deep');
        expect(getSelectedNode(d, 'a.b.c')).equals(123, 'Can select three nodes deep');
        expect(getSelectedNode(d, '.other')).equals(d.other, 'Can select an array');
        expect(getSelectedNode(d, '.other.0')).equals('one', 'Can select within an array');
        expect(getSelectedNode(d, '.other.1')).equals('two', 'Can select within an array');
        expect(getSelectedNode(d, '.other.2')).equals('three', 'Can select within an array');
        expect(getSelectedNode(d, '.ambiguous.aaa')).equals(true, 'Selectors are case-sensitive');
        expect(getSelectedNode(d, '.ambiguous.AAA')).equals(false, 'Selectors are case-sensitive');
        expect(getSelectedNode(d, '.ambiguous.AaA')).equals(null, 'Selectors are case-sensitive');
        expect(getSelectedNode(d, '.ambiguous.aAa')).equals(undefined, 'Selectors are case-sensitive');

        // Failure cases
        expect(getSelectedNode(d, 'a.b.x')).equals(undefined, 'Nonexistent property returns undefined');
        expect(() => getSelectedNode(d, 'a.b.x.y')).throws(Error, '`a.b.x.y` is not a valid selector! (failed at `y`)');
        expect(() => getSelectedNode(d, 'a.b.x.y.z')).throws(Error, '`a.b.x.y.z` is not a valid selector! (failed at `y`)');
        expect(getSelectedNode(d, '.other.3')).equals(undefined, 'OOB array index returns undefined');
        expect(() => getSelectedNode(d, '.other.0.11')).throws(Error, '`.other.0.11` is not a valid selector! (failed at `11`)');

        // Ignoring case
        expect(getSelectedNode(d, 'a.b.c', { ignoreCase: true })).equals(123, 'Can ignore case when it doesn\'t matter');
        expect(getSelectedNode(d, 'A.B.c', { ignoreCase: true })).equals(123, 'Can ignore case when selecting objects');
        expect(getSelectedNode(d, '.OtHeR.1', { ignoreCase: true })).equals('two', 'Can ignore case when selecting arrays');
        expect(() => getSelectedNode(d, '.ambiguous.aAa', { ignoreCase: true })).throws(Error, '`.ambiguous.aAa` selects multiple nodes when ignoring case! (failed at `aAa`)');

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

    it('can compute a word repetition score', () => {
        expect(getWordRepetitionScore('MY WORLD IS A HELLO', 'Hello, world.')).to.equal(1);
        expect(getWordRepetitionScore('Hello, four', 'one two three four')).to.equal(0.25);
        expect(getWordRepetitionScore('I\'m copying nothing', 'But are you?')).to.equal(0);
        expect(getWordRepetitionScore('Do not divide by zero', ' ')).to.equal(0);
        expect(getWordRepetitionScore('Don\'t t(a)ke p-u-n-c-t-u-a-t-i-o-n into account.', 'punctuation, dont, take, four')).to.equal(0.75);
        // Even though there are 4 words in the source text, only 2 unique words are used in the computation
        expect(getWordRepetitionScore('repeated', 'repeated repeated repeated word')).to.equal(0.5);
        expect(getWordRepetitionScore('repeated repeated repeated word', 'repeated')).to.equal(1);
        expect(getWordRepetitionScore(
            'Hear my soul speak: / The very instant that I saw you, did / My heart fly to your service',
            'A heart to love, and in that heart / Courage, to make\'s love known'
        )).to.equal(0.3);
    });
});
