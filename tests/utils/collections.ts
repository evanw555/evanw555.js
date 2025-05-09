import { expect } from 'chai';
import { addObjects, filterMap, filterValueFromMap, getEvenlyShortened, getMaxKey, getMinKey, getObjectSize, groupByProperty, incrementProperty, isObjectEmpty, toMap } from '../../src/utils/collections';

describe('Collection Utility tests', () => {
    it('constructs maps from a list of keys and values', () => {
        expect(JSON.stringify(toMap(['a','b','c'],[1,2,3]))).equals('{"a":1,"b":2,"c":3}');
    });

    it('filters maps', () => {
        const testMap = {
            a: 0,
            b: 1,
            c: 2,
            d: 3,
            e: 4,
            f: 5
        };

        expect(JSON.stringify(filterMap(testMap))).equals('{"a":0,"b":1,"c":2,"d":3,"e":4,"f":5}');
        expect(JSON.stringify(filterMap(testMap, { keyWhitelist: ['b','c'] }))).equals('{"b":1,"c":2}');
        expect(JSON.stringify(filterMap(testMap, { keyBlacklist: ['a','d']}))).equals('{"b":1,"c":2,"e":4,"f":5}');
        expect(JSON.stringify(filterMap(testMap, { valueWhitelist: [0,1,2] }))).equals('{"a":0,"b":1,"c":2}');
        expect(JSON.stringify(filterMap(testMap, { valueBlacklist: [2,3,4] }))).equals('{"a":0,"b":1,"f":5}');
        expect(JSON.stringify(filterMap(testMap, { fn: (k, v) => v % 2 === 0 }))).equals('{"a":0,"c":2,"e":4}');
        expect(JSON.stringify(filterMap(testMap, {
            keyWhitelist: ['a','b','c','d','e'],
            keyBlacklist: ['e','f'],
            valueWhitelist: [1,2,3],
            valueBlacklist: [0,1],
            fn: (k, v) => v % 3 !== 0
        }))).equals('{"c":2}');

        // Use the filter-value-from utility
        expect(JSON.stringify(filterValueFromMap(testMap, 3))).equals('{"a":0,"b":1,"c":2,"e":4,"f":5}');
    });

    it('groups objects by property', () => {
        const values: {a:number,b:string,c:boolean}[] = [
            { a: 1, b: 'odd', c: true },
            { a: 2, b: 'even', c: true },
            { a: 3, b: 'odd', c: true },
            { a: 4, b: 'even', c: false },
            { a: 5, b: 'odd', c: false },
            { a: 5, b: 'oops', c: false }
        ];

        expect(JSON.stringify(groupByProperty([], 'a'))).equals('{}');
        expect(JSON.stringify(groupByProperty(values, 'a'))).equals('{"1":[{"a":1,"b":"odd","c":true}],"2":[{"a":2,"b":"even","c":true}],"3":[{"a":3,"b":"odd","c":true}],"4":[{"a":4,"b":"even","c":false}],"5":[{"a":5,"b":"odd","c":false},{"a":5,"b":"oops","c":false}]}');
        expect(JSON.stringify(groupByProperty(values, 'b'))).equals('{"odd":[{"a":1,"b":"odd","c":true},{"a":3,"b":"odd","c":true},{"a":5,"b":"odd","c":false}],"even":[{"a":2,"b":"even","c":true},{"a":4,"b":"even","c":false}],"oops":[{"a":5,"b":"oops","c":false}]}');
        expect(JSON.stringify(groupByProperty(values, 'c'))).equals('{"true":[{"a":1,"b":"odd","c":true},{"a":2,"b":"even","c":true},{"a":3,"b":"odd","c":true}],"false":[{"a":4,"b":"even","c":false},{"a":5,"b":"odd","c":false},{"a":5,"b":"oops","c":false}]}');
        expect(groupByProperty(values, 'b')['even'].every(v => v.a % 2 === 0));
        expect(groupByProperty(values, 'c')['true'].every(v => v.a < 4));
    });

    it('determines the max key using a scoring function', () => {
        const values: string[] = ['aaa', 'bb', 'c', 'dd', 'eee', 'ffff', 'ggg'];

        expect(getMaxKey(values, (x) => x.length)).equals('ffff');
        expect(getMaxKey(values, (x) => x.charCodeAt(0))).equals('ggg');
    });

    it('determines the min key using a scoring function', () => {
        const values: string[] = ['aaa', 'bb', 'c', 'dd', 'eee', 'ffff', 'ggg'];

        expect(getMinKey(values, (x) => x.length)).equals('c');
        expect(getMinKey(values, (x) => x.charCodeAt(0))).equals('aaa');
    });

    it('evenly shortens lists', () => {
        // Shorten an odd-length list
        expect(getEvenlyShortened([1,2,3,4,5,6,7,8,9], 1).join(',')).equals('9');
        expect(getEvenlyShortened([1,2,3,4,5,6,7,8,9], 2).join(',')).equals('1,9');
        expect(getEvenlyShortened([1,2,3,4,5,6,7,8,9], 3).join(',')).equals('1,5,9');
        expect(getEvenlyShortened([1,2,3,4,5,6,7,8,9], 4).join(',')).equals('1,4,7,9');
        expect(getEvenlyShortened([1,2,3,4,5,6,7,8,9], 5).join(',')).equals('1,3,5,7,9');
        expect(getEvenlyShortened([1,2,3,4,5,6,7,8,9], 6).join(',')).equals('1,2,4,6,8,9');
        expect(getEvenlyShortened([1,2,3,4,5,6,7,8,9], 9).join(',')).equals('1,2,3,4,5,6,7,8,9');

        // Shorten an even-length list
        expect(getEvenlyShortened([1,2,3,4,5,6], 1).join(',')).equals('6');
        expect(getEvenlyShortened([1,2,3,4,5,6], 2).join(',')).equals('1,6');
        expect(getEvenlyShortened([1,2,3,4,5,6], 3).join(',')).equals('1,4,6');
        expect(getEvenlyShortened([1,2,3,4,5,6], 4).join(',')).equals('1,3,5,6');
        expect(getEvenlyShortened([1,2,3,4,5,6], 5).join(',')).equals('1,2,4,5,6');
        expect(getEvenlyShortened([1,2,3,4,5,6], 6).join(',')).equals('1,2,3,4,5,6');

        // Duplicates elements if attempting to lengthen the list
        expect(getEvenlyShortened([1,2,3], 4).join(',')).equals('1,2,3,3');
        expect(getEvenlyShortened([1,2,3], 5).join(',')).equals('1,1,2,3,3');
        expect(getEvenlyShortened([1,2,3], 6).join(',')).equals('1,1,2,2,3,3');

        // Test weird small values
        expect(getEvenlyShortened([1,2,3], 2).join(',')).equals('1,3');
        expect(getEvenlyShortened([1,2,3], 1).join(',')).equals('3');
        expect(getEvenlyShortened([1,2,3], 0).join(',')).equals('');

        // Misc big case
        expect(getEvenlyShortened([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], 12).join(',')).equals('1,2,3,5,6,8,9,11,12,14,15,16');

        // Test the padding option
        expect(getEvenlyShortened([1,2,3,4,5,6,7,8,9], 4, { padding: 1 }).join(',')).equals('1,2,8,9');
        expect(getEvenlyShortened([1,2,3,4,5,6,7,8,9], 5, { padding: 1 }).join(',')).equals('1,2,5,8,9');
        expect(getEvenlyShortened([1,2,3,4], 4, { padding: 2 }).join(',')).equals('1,2,3,4');
        expect(getEvenlyShortened([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25], 15, { padding: 5 }).join(',')).equals('1,2,3,4,5,6,9,13,17,20,21,22,23,24,25');
    });

    // This also tests object size/emptiness functions
    it('increments numeric map properties', () => {
        const map: Record<string, number> = {};
        expect(isObjectEmpty(map)).true;

        incrementProperty(map, 'a', 1);
        expect(getObjectSize(map)).equals(1);
        expect(map.a).equals(1);

        incrementProperty(map, 'a', 1);
        incrementProperty(map, 'b', 1);
        expect(getObjectSize(map)).equals(2);
        expect(map.a).equals(2);
        expect(map.b).equals(1);

        incrementProperty(map, 'a', 1);
        incrementProperty(map, 'b', 1);
        incrementProperty(map, 'c', 1);
        expect(getObjectSize(map)).equals(3);
        expect(map.a).equals(3);
        expect(map.b).equals(2);
        expect(map.c).equals(1);

        incrementProperty(map, 'a', 1);
        incrementProperty(map, 'b', -2);
        incrementProperty(map, 'c', -1);
        expect(getObjectSize(map)).equals(1);
        expect(map.a).equals(4);

        incrementProperty(map, 'a', -4);
        expect(isObjectEmpty(map)).true;
    });

    it('adds objects together', () => {
        const o1 = { a: 1, b: 2, c: 3 };
        const o2 = { d: 4, e: 5, f: 6 };
        const o3 = { a: 10, c: 20, e: 30 };
        const o4 = { a: 100, f: 1000, g: 99 };

        // Identity property: adding one with nothing returns itself (keys in order)
        expect(JSON.stringify(addObjects(o1))).equals('{"a":1,"b":2,"c":3}');

        expect(JSON.stringify(addObjects(o1, o2))).equals('{"a":1,"b":2,"c":3,"d":4,"e":5,"f":6}');
        expect(JSON.stringify(addObjects(o1, o2, o3))).equals('{"a":11,"b":2,"c":23,"d":4,"e":35,"f":6}');
        expect(JSON.stringify(addObjects(o1, o2, o3, o4))).equals('{"a":111,"b":2,"c":23,"d":4,"e":35,"f":1006,"g":99}');

        expect(JSON.stringify(addObjects(o1, o3))).equals('{"a":11,"b":2,"c":23,"e":30}');11
    });
});