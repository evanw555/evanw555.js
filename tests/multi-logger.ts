import { expect } from 'chai';
import { MultiLogger, MultiLoggerLevel } from '../src/multi-logger';

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

    it('observes logger and log levels', async () => {
        // Override the default logger/log level options
        const logger = new MultiLogger({ defaultLoggerLevel: MultiLoggerLevel.Info, defaultLogLevel: MultiLoggerLevel.Debug });
        const processed = new Set();

        logger.addOutput(async (x) => {
            processed.add(x + '_default');
        });

        logger.addOutput(async (x) => {
            processed.add(x + '_all');
        }, MultiLoggerLevel.All);

        logger.addOutput(async (x) => {
            processed.add(x + '_debug');
        }, MultiLoggerLevel.Debug);

        logger.addOutput(async (x) => {
            processed.add(x + '_error');
        }, MultiLoggerLevel.Error);

        logger.addOutput(async (x) => {
            processed.add(x + '_off');
        }, MultiLoggerLevel.Off);

        // A "trace" log should not be logged to the default "info" logger
        await logger.log('trace', MultiLoggerLevel.Trace);
        expect(processed.has('trace_all')).is.true;
        expect(processed.has('trace_debug')).is.false;
        expect(processed.has('trace_default')).is.false;
        expect(processed.has('trace_error')).is.false;
        expect(processed.has('trace_off')).is.false;

        // A default log ("debug" level) should not be logged to the default "info" logger
        await logger.log('default');
        expect(processed.has('default_all')).is.true;
        expect(processed.has('default_debug')).is.true;
        expect(processed.has('default_default')).is.false;
        expect(processed.has('default_error')).is.false;
        expect(processed.has('default_off')).is.false;

        // A "warn" log should be logged to the default "info" logger
        await logger.log('warn', MultiLoggerLevel.Warn);
        expect(processed.has('warn_all')).is.true;
        expect(processed.has('warn_debug')).is.true;
        expect(processed.has('warn_default')).is.true;
        expect(processed.has('warn_error')).is.false;
        expect(processed.has('warn_off')).is.false;

        // Anything logged with the level "off" should be logged to all outputs
        await logger.log('off', MultiLoggerLevel.Off);
        expect(processed.has('off_all')).is.true;
        expect(processed.has('off_debug')).is.true;
        expect(processed.has('off_default')).is.true;
        expect(processed.has('off_error')).is.true;
        expect(processed.has('off_off')).is.true;
    });
});
