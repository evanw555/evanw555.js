// TODO: Clean this up...
export function prettyPrint(node: any): string {
    let indentLevel: number = 0;

    const getIndent = () => {
        return ' '.repeat(indentLevel * 2);
    }

    const printMap = (map: Record<string, any>): string => {
        const keys = Object.keys(map);
        if (keys.length === 0) {
            return '{}';
        }
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

    const printArray = (array: any[]): string => {
        if (array.every(x => x.constructor !== Object && x.constructor !== Array)) {
            return JSON.stringify(array);
        } else {
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

    const print = (thing: any): string => {
        if (thing && thing.constructor === Object) {
            return printMap(thing);
        } else if (thing && thing.constructor === Array) {
            return printArray(thing);
        } else {
            return JSON.stringify(thing);
        }
    };

    return print(node);
}