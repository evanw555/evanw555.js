import { expect } from 'chai';
import { prettyPrint } from '../../src/utils/pretty';

describe('Pretty Print tests', () => {
    it('prints prettily', () => {
        expect(prettyPrint([1,2,3])).to.equal('[1,2,3]');
        expect(prettyPrint([1,[10,11,12],3])).to.equal('[\n  1,\n  [10,11,12],\n  3\n]');

        expect(prettyPrint({
            a: 1,
            b: [
                { x: true },
                null,
                [1,2,3],
                {}
            ],
            c: "hello"
        })).to.equal('{\n  "a": 1,\n  "b": [\n    {\n      "x": true\n    },\n    null,\n    [1,2,3],\n    {}\n  ],\n  "c": "hello"\n}');
    });
});
