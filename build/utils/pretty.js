"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettyPrint = void 0;
// TODO: Clean this up...
function prettyPrint(node) {
    let indentLevel = 0;
    const getIndent = () => {
        return ' '.repeat(indentLevel * 2);
    };
    const printMap = (map) => {
        // Don't serialize entries where the value is undefined
        const keys = Object.keys(map).filter(k => map[k] !== undefined);
        // Short-circuit empty maps
        if (keys.length === 0) {
            return '{}';
        }
        // Recursively serialize the map and its values
        let s = '{';
        indentLevel++;
        for (let i = 0; i < keys.length; i++) {
            s += '\n' + getIndent() + `"${keys[i]}": ${print(map[keys[i]])}`;
            if (i !== keys.length - 1) {
                s += ',';
            }
        }
        indentLevel--;
        s += '\n' + getIndent() + '}';
        return s;
    };
    const printArray = (array) => {
        if (array.every(x => x.constructor !== Object && x.constructor !== Array)) {
            return JSON.stringify(array);
        }
        else {
            let s = '[';
            indentLevel++;
            for (let i = 0; i < array.length; i++) {
                s += '\n' + getIndent() + print(array[i]);
                if (i !== array.length - 1) {
                    s += ',';
                }
            }
            indentLevel--;
            s += '\n' + getIndent() + ']';
            return s;
        }
    };
    const print = (thing) => {
        if (thing && thing.constructor === Object) {
            return printMap(thing);
        }
        else if (thing && thing.constructor === Array) {
            return printArray(thing);
        }
        else {
            return JSON.stringify(thing);
        }
    };
    return print(node);
}
exports.prettyPrint = prettyPrint;
//# sourceMappingURL=pretty.js.map