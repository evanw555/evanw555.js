
/**
 * Given a list of numbers, return the sum of these values.
 * @param values List of input values
 * @returns Sum of the input values
 */
export function sum(values: number[]): number {
    return values.reduce((x, y) => x + y, 0);
}

/**
 * Given a list of numbers, return the product of these values.
 * @param values List of input values
 * @returns Product of the input values
 */
export function product(values: number[]): number {
    return values.reduce((x, y) => x * y, 1);
}

/**
 * Given a list of numbers, return the mean of these values.
 * @param values List of input values
 * @returns Mean of the input values
 */
export function mean(values: number[]): number {
    if (values.length === 0) {
        throw new Error('Cannot compute mean of empty list of numbers');
    }
    return sum(values) / values.length;
}

/**
 * Given a list of numbers, return the standard deviation of these values.
 * @param values List of input values
 * @returns Standard deviation of the input values
 */
export function stddev(values: number[]): number {
    if (values.length === 0) {
        throw new Error('Cannot compute standard deviation of empty list of numbers');
    }
    if (values.length === 1) {
        throw new Error('Cannot compute standard deviation of one number');
    }
    const m = mean(values);
    const deviations = values.map(r => Math.pow(r - m, 2));
    return Math.sqrt(sum(deviations) / (deviations.length - 1));
}