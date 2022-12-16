import { expect } from 'chai';
import { getPreciseDurationString } from '../../src/utils/time';

describe('Time Utility tests', () => {
    it ('can create precise duration strings', () => {
        expect(getPreciseDurationString(0)).equals('0s');
        expect(getPreciseDurationString(999)).equals('0s');
        expect(getPreciseDurationString(1000)).equals('1s');
        expect(getPreciseDurationString(1600)).equals('1s');
        expect(getPreciseDurationString(2000)).equals('2s');
        expect(getPreciseDurationString(49123)).equals('49s');
        expect(getPreciseDurationString(60000)).equals('1m');
        expect(getPreciseDurationString(60888)).equals('1m');
        expect(getPreciseDurationString(61111)).equals('1m1s');
        expect(getPreciseDurationString(120000)).equals('2m');
        expect(getPreciseDurationString(2342345)).equals('39m2s');
        expect(getPreciseDurationString(3600000)).equals('1h');
        expect(getPreciseDurationString(3661000)).equals('1h1m1s');
        expect(getPreciseDurationString(86400000)).equals('1d');
        expect(getPreciseDurationString(234092349)).equals('2d17h1m32s');
        expect(getPreciseDurationString(604799999)).equals('6d23h59m59s');
        expect(getPreciseDurationString(604800000)).equals('1w');
        expect(getPreciseDurationString(6048000000)).equals('10w');
        expect(getPreciseDurationString(31449600000)).equals('52w');
    });
});
