import { expect } from 'chai';
import { mean, product, stddev, sum } from '../../src/utils/math';

describe('Math Utility tests', () => {
    it ('can compute the sum of numbers', () => {
        expect(sum([])).equals(0);
        expect(sum([1])).equals(1);
        expect(sum([-1, 0, 1, 1, 9, 5])).equals(15);
    });

    it ('can compute the product of numbers', () => {
        expect(product([])).equals(1);
        expect(product([0])).equals(0);
        expect(product([2, 3, 4, -1])).equals(-24);
    });

    it ('can compute the mean of numbers', () => {
        expect(mean([1])).equals(1);
        expect(mean([4, 5, 6])).equals(5);
        expect(mean([1, 2, 3, 4, 5, 6])).equals(3.5);
        expect(mean([100, 100, 100, 0])).equals(75);
        expect(() => mean([])).throws(Error, 'Cannot compute mean of empty list of numbers');
    });

    it ('can compute the standard deviation of numbers', () => {
        expect(stddev([5, 5, 5])).equals(0);
        expect(stddev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).equals(3.0276503540974917);
        expect(() => stddev([])).throws(Error, 'Cannot compute standard deviation of empty list of numbers');
        expect(() => stddev([1])).throws(Error, 'Cannot compute standard deviation of one number');
    });
});
