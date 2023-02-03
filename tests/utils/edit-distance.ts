import { expect } from 'chai';
import { getEditDistance, getMostSimilarByNormalizedEditDistance, getNormalizedEditDistance } from '../../src/utils/edit-distance';

describe('Edit Distance Utility tests', () => {
    it('can compute the edit distance between two strings', () => {
        expect(getEditDistance('hello', 'hello')).equals(0);
        expect(getEditDistance('hello', 'henlo')).equals(1);
        expect(getEditDistance('hello', 'hellow')).equals(1);
        expect(getEditDistance('abc', 'xyz')).equals(3);
        expect(getEditDistance('sitting', 'kitten')).equals(3);
        expect(getEditDistance('kitten', 'sitting')).equals(3);
        expect(getEditDistance('Sunday', 'Saturday')).equals(3);
        expect(getEditDistance('abc', 'xaxbxcx')).equals(4);
        expect(getEditDistance('in', 'insofar')).equals(5);
    });

    it('can compute the edit distance between two arrays', () => {
        expect(getEditDistance(['a'], ['a'])).equals(0);
        expect(getEditDistance(['one', 'fine', 'day'], ['one', 'bad', 'day'])).equals(1);
        expect(getEditDistance(['hello', 'my', 'friend'], ['hello', 'my', 'friend', 'once', 'again'])).equals(2);
        expect(getEditDistance(['a', 'b', 'c'], ['x', 'y', 'z'])).equals(3);
        expect(getEditDistance('sitting'.split(''), 'kitten'.split(''))).equals(3);
        expect(getEditDistance('kitten'.split(''), 'sitting'.split(''))).equals(3);
        expect(getEditDistance('Sunday'.split(''), 'Saturday'.split(''))).equals(3);
        expect(getEditDistance(['one', 'fine', 'day'], ['NOT', 'one', 'NOT', 'fine', 'NOT', 'day', 'NOT'])).equals(4);
        expect(getEditDistance('in'.split(''), 'insofar'.split(''))).equals(5);
    });

    it('can compute the normalized edit distance', () => {
        expect(getNormalizedEditDistance('hello', 'hello')).equals(0);
        expect(getNormalizedEditDistance('a', 'ab')).equals(0.5);
        expect(getNormalizedEditDistance('abc', 'abcd')).equals(0.25);
        expect(getNormalizedEditDistance('XaXbXcXd', 'abcd')).equals(0.5);
        expect(getNormalizedEditDistance(['one', 'fine', 'day'], ['one', 'very', 'bad', 'day'])).equals(0.5);
    });

    it('can get the most similar value by normalized edit distance', () => {
        const result1 = getMostSimilarByNormalizedEditDistance('a', []);
        expect(result1).is.undefined;

        const result2 = getMostSimilarByNormalizedEditDistance('a', ['foo', 'bar', 'a', 'buzz']);
        expect(result2).is.not.undefined;
        expect(result2?.value).equals('a');
        expect(result2?.distance).equals(0);
        expect(result2?.index).equals(2);

        const result3 = getMostSimilarByNormalizedEditDistance('Guensday', ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
        expect(result3).is.not.undefined;
        expect(result3?.value).equals('Tuesday');
        expect(result3?.distance).equals(0.25);
        expect(result3?.index).equals(2);
    });
});
