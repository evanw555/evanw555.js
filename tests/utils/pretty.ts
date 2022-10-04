import { expect } from 'chai';
import { prettyPrint } from '../../src/utils/pretty';

describe('Pretty Print tests', () => {
    const complexData: any = {
        a: 1,
        b: [
            { x: true },
            null,
            [1,2,3],
            {}
        ],
        c: "hello"
    };

    it('prints prettily', () => {
        expect(prettyPrint([1,2,3])).to.equal('[1,2,3]');
        expect(prettyPrint([1,[10,11,12],3])).to.equal('[\n  1,\n  [10,11,12],\n  3\n]');

        expect(prettyPrint(complexData)).to.equal('{\n  "a": 1,\n  "b": [\n    {\n      "x": true\n    },\n    null,\n    [1,2,3],\n    {}\n  ],\n  "c": "hello"\n}');
    });

    it('doesn\'t serialize undefined map values', () => {
        expect(prettyPrint({ a: undefined })).to.equal('{}');
        expect(prettyPrint({ a: undefined, b: 'foo' })).to.equal('{\n  "b": "foo"\n}');
    });

    it('supports overrides by path', () => {
        expect(prettyPrint({ a: 123 }, { overrides: { a: 456 } })).to.equal('{\n  "a": 456\n}');
        expect(prettyPrint([1,[10,11,12],3], { overrides: { '2': 'foo' } })).to.equal('[\n  1,\n  [10,11,12],\n  "foo"\n]');

        expect(prettyPrint(complexData, {
            overrides: {
                'b.0.x': 'foo',
                'b.1': 'bar',
                'c': 'baz'
            }
        })).to.equal('{\n  "a": 1,\n  "b": [\n    {\n      "x": "foo"\n    },\n    "bar",\n    [1,2,3],\n    {}\n  ],\n  "c": "baz"\n}');

        // As of now, overrides don't work on primitive arrays
        expect(prettyPrint([1,2,3], { overrides: { '1': 'foo' } })).to.equal('[1,2,3]');

        // The root node may be overridden
        expect(prettyPrint(complexData, { overrides: { '': 'foo' } })).to.equal('"foo"');

        // Overrides themselves can be complex objects
        expect(prettyPrint(true, { overrides: { '': { iam: 'overridden' } } })).to.equal('{\n  "iam": "overridden"\n}');

        // Overrides with complex objects may themselves be overridden
        expect(prettyPrint(true, { overrides: { '': { iam: 'overridden' }, 'iam': false } })).to.equal('{\n  "iam": false\n}');
    });

    it('supports overrides with wildcard-suffixed paths', () => {
        expect(prettyPrint({ a: 123, b: 456 }, { overrides: { '*': 789 } })).to.equal('{\n  "a": 789,\n  "b": 789\n}');
        expect(prettyPrint(complexData, { overrides: { 'b.*': 'foo' } })).to.equal('{\n  "a": 1,\n  "b": [\n    "foo",\n    "foo",\n    "foo",\n    "foo"\n  ],\n  "c": "hello"\n}');
    });
});
