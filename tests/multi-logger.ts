import { expect } from 'chai';
import { MultiLogger } from '../src/multi-logger';

describe('MultiLogger Tests', () => {
    it('can log to multiple places', async () => {
        const logger = new MultiLogger();
        const processed = new Set();

        logger.addOutput(async (x) => {
            processed.add(x);
        });

        await logger.log('singular');
        expect(processed.has('singular')).is.true;
        expect(processed.has('singular_2')).is.false;

        logger.addOutput(async (x) => {
            processed.add(x + '_2');
        });

        await logger.log('foo');
        await logger.log('bar');

        expect(processed.has('foo')).is.true;
        expect(processed.has('foo_2')).is.true;
        expect(processed.has('bar')).is.true;
        expect(processed.has('bar_2')).is.true;

        expect(processed.has('I do not exist')).is.false;
    });

    it('observes the max length option', async () => {
        const logger = new MultiLogger({ maxLength: 10 });
        const processed = new Set();

        logger.addOutput(async (x) => {
            processed.add(x);
        });

        await logger.log('123');

        expect(processed.has('123')).is.true;
        expect(processed.has('123...')).is.false;

        await logger.log('1234567890');

        expect(processed.has('1234567890')).is.true;
        expect(processed.has('1234567890...')).is.false;

        await logger.log('1234567890abcefghijk');

        expect(processed.has('1234567890abcefghijk')).is.false;
        expect(processed.has('1234567890...')).is.true;

        expect(processed.has('I do not exist')).is.false;
    });

    it('failures in one output don\'t affect other outputs', async () => {
        const logger = new MultiLogger();
        const processed = new Set();

        logger.addOutput(async (x) => {
            throw new Error('OOPSIE!');
        });

        logger.addOutput(async (x) => {
            processed.add(x);
        });

        logger.addOutput(async (x) => {
            throw new Error('OOPSIE AGAIN!');
        });

        await logger.log('foo');

        expect(processed.has('foo')).is.true;

        expect(processed.has('I do not exist')).is.false;
    });
});
