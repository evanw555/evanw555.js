// TODO: Clean this up...
/**
 * Pretty-print the given value into JSON.
 * @param node The value to serialize
 * @param options.overrides A mapping keyed by JSON path (e.g. "x.y.z") used to replace certain elements (doesn't work for primitive arrays).
 *                          Wildcards may be used as the last segment in the path string.
 * @returns The serialized string
 */
export function prettyPrint(node: any, options?: { overrides?: Record<string, any> }): string {
    const overrides: Record<string, any> = options?.overrides ?? {};
    const path: string[] = [];
    let indentLevel: number = 0;

    const getIndent = () => {
        return ' '.repeat(indentLevel * 2);
    }

    const printMap = (map: Record<string, any>): string => {
        // Don't serialize entries where the value is undefined
        const keys: string[] = Object.keys(map).filter(k => map[k] !== undefined);
        // Short-circuit empty maps
        if (keys.length === 0) {
            return '{}';
        }
        // Recursively serialize the map and its values
        let s = '{';
        indentLevel++;
        for (let i = 0; i < keys.length; i++) {
            const key: string = keys[i];
            const value: any = map[key];
            path.push(key)
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

    const printArray = (array: any[]): string => {
        if (array.every(x => x.constructor !== Object && x.constructor !== Array)) {
            return JSON.stringify(array);
        } else {
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

    const printWithoutOverride = (thing: any): string => {
        if (thing && thing.constructor === Object) {
            return printMap(thing);
        } else if (thing && thing.constructor === Array) {
            return printArray(thing);
        } else {
            return JSON.stringify(thing);
        }
    };

    const print = (thing: any): string => {
        // Check for explicit path overrides
        const currentPathString: string = path.join('.');
        if (currentPathString in overrides) {
            return printWithoutOverride(overrides[currentPathString]);
        }

        // Check for wildcard matches if not at the root node
        if (path.length > 0) {
            // Replace the last component with a wildcard
            // TODO: Can we support wildcards anywhere in the path? Would it require regex logic?
            const wildcardPathString: string = path.slice(0, -1).concat('*').join('.');
            if (wildcardPathString in overrides) {
                return printWithoutOverride(overrides[wildcardPathString]);
            }
        }

        // Else, serialize as normal
        return printWithoutOverride(thing);
    };

    return print(node);
}