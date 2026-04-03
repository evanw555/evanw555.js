import { expect } from 'chai';
import { getNumberOfDaysBetween, getNumberOfDaysSince, getNumberOfDaysUntil, getPreciseDurationString, isPast, isSameDay, isSameDayOfYear, toCalendarDate, toDateString } from '../../src/utils/time';

describe('Time Utility tests', () => {
    it('can produce date strings', () => {
        expect(toDateString(new Date('January 1, 2020'))).equals('1/1/2020', 'From date object');
        expect(toDateString(1234567890000)).equals('2/13/2009', 'From numeric timestamp');
        expect(toDateString('April 10, 2012')).equals('4/10/2012', 'From string');
    });

    it('can produce calendar date strings', () => {
        expect(toCalendarDate(new Date('January 1, 2020'))).equals('1/1', 'From date object');
        expect(toCalendarDate(1234567890000)).equals('2/13', 'From numeric timestamp');
        expect(toCalendarDate('April 10, 2012')).equals('4/10', 'From string');
    });

    it('can check if dates are the same day of the year', () => {
        expect(isSameDayOfYear(new Date('January 1, 2020'), new Date('January 1, 2001'))).true;
        expect(isSameDayOfYear(new Date('January 1, 2020'), new Date('January 1, 2020'))).true;
        expect(isSameDayOfYear(1234567890000, new Date('February 13, 1992'))).true;
        expect(isSameDayOfYear(1234567890000, new Date('February 13, 2009'))).true;
        expect(isSameDayOfYear('April 10, 2012', 'April 10, 2013')).true;
        expect(isSameDayOfYear('April 10, 2012', 'April 10, 2012')).true;
        expect(isSameDayOfYear('April 10, 2012', 'April 9, 2012')).false;
        expect(isSameDayOfYear('April 10, 2012', 'April 11, 2012')).false;
        expect(isSameDayOfYear(null, null)).false;
        expect(isSameDayOfYear(undefined, undefined)).false;
    });

    it('can check if dates are the same day', () => {
        expect(isSameDay(new Date('January 1, 2020'), new Date('January 1, 2001'))).false;
        expect(isSameDay(new Date('January 1, 2020'), new Date('January 1, 2020'))).true;
        expect(isSameDay(1234567890000, new Date('February 13, 1992'))).false;
        expect(isSameDay(1234567890000, new Date('February 13, 2009'))).true;
        expect(isSameDay('April 10, 2012', 'April 10, 2013')).false;
        expect(isSameDay('April 10, 2012', 'April 10, 2012')).true;
        expect(isSameDay('April 10, 2012', 'April 9, 2012')).false;
        expect(isSameDay('April 10, 2012', 'April 11, 2012')).false;
        expect(isSameDay(null, null)).false;
        expect(isSameDay(undefined, undefined)).false;
    });

    it('can create precise duration strings', () => {
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

    it('can count the number of days between two dates', () => {
        expect(getNumberOfDaysBetween('9/1/2020', '9/1/2020')).equals(0);
        expect(getNumberOfDaysBetween('10/31/2021', '11/1/2021')).equals(1);
        expect(getNumberOfDaysBetween('1/15/2013', '1/15/2014')).equals(365);
        expect(getNumberOfDaysBetween('9/28/2023', '10/1/2023')).equals(3);

        // Test the since/until utils as well
        const since = new Date();
        since.setHours(since.getHours() - 25);
        expect(getNumberOfDaysSince(since)).equals(1);
        expect(getNumberOfDaysSince(since.getTime())).equals(1);
        const until = new Date();
        until.setHours(since.getHours() + 49);
        expect(getNumberOfDaysUntil(until)).equals(2);
        expect(getNumberOfDaysUntil(until.getTime())).equals(2);
    });

    it('can determine if a date is in the past', () => {
        const past = new Date();
        past.setHours(past.getHours() - 10);

        const future = new Date();
        future.setHours(future.getHours() + 10);

        expect(isPast(past)).true;
        expect(isPast(past.getTime())).true;

        expect(isPast(future)).false;
        expect(isPast(future.getTime())).false;

        expect(isPast(null)).false;
        expect(isPast(undefined)).false;
    });
});
