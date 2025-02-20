import { expect } from 'chai';
import { filterMap, filterValueFromMap, getEvenlyShortened, getMaxKey, getMinKey, groupByProperty, toMap } from '../../src/utils/collections';

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
        expect(getEvenlyShortened([1,2,3,4,5,6,7,8,9,0], 2).join(',')).equals('1,6');
        expect(getEvenlyShortened([1,2,3,4,5,6,7,8,9,0], 3).join(',')).equals('1,4,7');
        expect(getEvenlyShortened([1,2,3,4,5,6,7,8,9,0], 5).join(',')).equals('1,3,5,7,9');
        expect(getEvenlyShortened([1,2,3,4,5,6,7,8,9,0], 9).join(',')).equals('1,2,3,4,5,6,7,8,9');
        expect(getEvenlyShortened([1,2,3,4,5,6,7,8,9,0], 10).join(',')).equals('1,2,3,4,5,6,7,8,9,0');
        expect(getEvenlyShortened([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], 12).join(',')).equals('1,2,3,5,6,7,9,10,11,13,14,15');
    });
});