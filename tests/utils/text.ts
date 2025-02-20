import { expect } from 'chai';
import { canonicalizeText, getPercentChangeString, getQuantityWithUnits, getUnambiguousQuantitiesWithUnits } from '../../src/utils/text';

describe('Text Utility tests', () => {
    it('canonicalizes text', () => {
        expect(canonicalizeText('Hello, World!')).equals('helloworld');
        expect(canonicalizeText('Bob\'s FAVORITE number is 123 yessir')).equals('bobsfavoritenumberis123yessir');
    });

    it('formats quantities with units', () => {
        expect(getQuantityWithUnits(0)).to.equal('0');
        expect(getQuantityWithUnits(1)).to.equal('1');
        expect(getQuantityWithUnits(12)).to.equal('12');
        expect(getQuantityWithUnits(123)).to.equal('123');
        expect(getQuantityWithUnits(1234)).to.equal('1.2k');
        expect(getQuantityWithUnits(12345)).to.equal('12.3k');
        expect(getQuantityWithUnits(123456)).to.equal('123.5k');
        expect(getQuantityWithUnits(1234567)).to.equal('1.2m');
        expect(getQuantityWithUnits(12345678)).to.equal('12.3m');
        expect(getQuantityWithUnits(123456789)).to.equal('123.5m');
        expect(getQuantityWithUnits(1234567890)).to.equal('1.2b');

        // Doesn't round under 1k
        expect(getQuantityWithUnits(999)).equals('999');
        expect(getQuantityWithUnits(1000)).equals('1.0k');
        // Does round above 1k
        expect(getQuantityWithUnits(1050)).equals('1.1k');
        expect(getQuantityWithUnits(1099)).equals('1.1k');
        expect(getQuantityWithUnits(1100)).equals('1.1k');
        expect(getQuantityWithUnits(77777)).equals('77.8k');
        expect(getQuantityWithUnits(999940)).equals('999.9k');
        // Weird quirk when rounding up to 1m
        expect(getQuantityWithUnits(999999)).equals('1000.0k');
        expect(getQuantityWithUnits(1000000)).equals('1.0m');
        expect(getQuantityWithUnits(5444321)).equals('5.4m');
        // Allow for overriding the number of decimal places
        expect(getQuantityWithUnits(12343210, 2)).equals('12.34m');
    });

    it('formats unambiguous sets of quantities with units', () => {
        expect(getUnambiguousQuantitiesWithUnits([1,2,3]).join(',')).equals('1,2,3');
        // No decimals under 1k, even when there's ambiguity
        expect(getUnambiguousQuantitiesWithUnits([1,1,1,2,3]).join(',')).equals('1,1,1,2,3');
        // Extend to 3 decimal points for all numbers with similar crossover
        expect(getUnambiguousQuantitiesWithUnits([1000,1001,1002]).join(',')).equals('1.000k,1.001k,1.002k');
        // Bottom out at 3 decimal points, even when that fails to resolve the amiguity
        expect(getUnambiguousQuantitiesWithUnits([1_000_111,1_000_222,1_000_333]).join(',')).equals('1.000m,1.000m,1.000m');
        // Only extend to as many points as are needed
        // NOTE: 1.11k is uniquely extended to 2 places because the subsequent 2 values were extended even further
        expect(getUnambiguousQuantitiesWithUnits([1000,1110,1121,1122]).join(',')).equals('1.0k,1.11k,1.121k,1.122k');
        // Handle independent amiguity resolutions
        expect(getUnambiguousQuantitiesWithUnits([7111,8546,8530,9011,88_899,2_123_000,2_124_900,77_011_000]).join(',')).equals('7.1k,8.55k,8.53k,9.0k,88.9k,2.123m,2.125m,77.0m');
    });

    it('formats percentage change strings', () => {
        expect(getPercentChangeString(10, 15)).equals('+50.0%');
        expect(getPercentChangeString(10, 5)).equals('-50.0%');
        expect(getPercentChangeString(1, 1)).equals('+0.0%');
        expect(getPercentChangeString(10, 30, 0)).equals('+200%');
        expect(getPercentChangeString(9, 6, 3)).equals('-33.333%');
    });
});
