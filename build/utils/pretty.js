"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettyPrint = void 0;
// TODO: Clean this up...
/**
 * Pretty-print the given value into JSON.
 * @param node The value to serialize
 * @param options.overrides A mapping keyed by JSON path (e.g. "x.y.z") used to replace certain elements (doesn't work for primitive arrays).
 *                          Wildcards may be used as the last segment in the path string.
 * @returns The serialized string
 */
function prettyPrint(node, options) {
    var _a;
    const overrides = (_a = options === null || options === void 0 ? void 0 : options.overrides) !== null && _a !== void 0 ? _a : {};
    const path = [];
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
            const key = keys[i];
            const value = map[key];
            path.push(key);
            s += '\n' + getIndent() + `"${key}": ${print(value)}`;
            path.pop();
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
                path.push(i.toString());
                s += '\n' + getIndent() + print(array[i]);
                path.pop();
                if (i !== array.length - 1) {
                    s += ',';
                }
            }
            indentLevel--;
            s += '\n' + getIndent() + ']';
            return s;
        }
    };
    const printWithoutOverride = (thing) => {
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
    const print = (thing) => {
        // Check for explicit path overrides
        const currentPathString = path.join('.');
        if (currentPathString in overrides) {
            return printWithoutOverride(overrides[currentPathString]);
        }
        // Check for wildcard matches if not at the root node
        if (path.length > 0) {
            // Replace the last component with a wildcard
            // TODO: Can we support wildcards anywhere in the path? Would it require regex logic?
            const wildcardPathString = path.slice(0, -1).concat('*').join('.');
            if (wildcardPathString in overrides) {
                return printWithoutOverride(overrides[wildcardPathString]);
            }
        }
        // Else, serialize as normal
        return printWithoutOverride(thing);
    };
    return print(node);
}
exports.prettyPrint = prettyPrint;
//# sourceMappingURL=pretty.js.map