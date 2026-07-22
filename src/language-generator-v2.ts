import { capitalize, getSelectedNode, naturalJoin } from './utils/misc';
import { randChoice, randInt, shuffle } from './utils/random';
import { s } from './utils/text';

class CharacterStream {
    private readonly data: string;
    private i: number;

    constructor(data: string) {
        this.data = data;
        this.i = -1;
    }

    current(): string | undefined {
        return this.data[this.i];
    }

    next(): string | undefined {
        // TODO: Stop incrementing once done
        this.i++;
        return this.data[this.i];
    }

    peekNext(): string | undefined {
        return this.data[this.i + 1];
    }

    backUp() {
        this.i--;
    }
}

export class LanguageGeneratorV2 {
    private readonly _config: Record<string, any>;
    private _lastErrorMessage?: string;
    private logger?: (message: string) => void;

    constructor(config: Record<string, any>) {
        this._config = config;
    }

    setLogger(logger: (message: string) => void): void {
        this.logger = logger;
    }

    private parseLiterals(stream: CharacterStream, variables: Record<string, string>): string {
        // First, count how heavily to weigh toward the front
        let weighting = 1;
        while (stream.peekNext() === '!') {
            weighting++;
            stream.next();
        }
        // Construct list of text literals
        const literals: string[] = [];
        // TODO: Don't use while(true)
        while (true) {
            const literal = this.parseText(stream, ['|', '}'], variables);
            literals.push(literal);
            // If reached end of stream...
            if (stream.current() === undefined) {
                throw new Error('Unexpected end of stream while parsing literals');
            }
            // If reached delimiter, continue
            if (stream.current() === '|') {
                continue;
            }
            // If reached end of injection, choose random and escape
            if (stream.current() === '}') {
                let index = literals.length - 1;
                for (let i = 0; i < weighting; i++) {
                    index = Math.min(index, randInt(0, literals.length));
                }
                return literals[index];
            }
        }
    }

    private parseVariable(stream: CharacterStream, variables: Record<string, string>): string {
        // First, parse the variable name itself
        const firstIdentifier = this.parseText(stream, ['}', '?'], variables);
        // If encountered fallback operator, continue parsing variable names
        const identifiers = [firstIdentifier];
        while (stream.current() === '?' && stream.peekNext() === '?') {
            // Burn next question mark
            if (stream.next() !== '?') {
                throw new Error(`Unexpected character \`${stream.current()}\` after first question mark while parsing variable fallback`);
            }
            // Parse next identifier
            identifiers.push(this.parseText(stream, ['}', '?'], variables));
        }

        if (stream.current() === undefined) {
            throw new Error('Unexpected end of stream while parsing injection variable name');
        }

        // Get first defined value selected by the identifiers list
        const value = identifiers
            .map(x => getSelectedNode(variables, x))
            .filter(x => x !== undefined)[0];

        // If injection ended right there, return variable value
        if (stream.current() === '}') {
            if (value === undefined) {
                throw new Error(`Injection references nonexistent variable${s(identifiers.length)} \`${this.stringify(identifiers)}\`, available variables are \`${JSON.stringify(Object.keys(variables))}\``);
            }
            return this.stringify(value);
        }

        // If attempting to do ternary operator...
        if (stream.current() === '?') {
            // First truthy result
            const truthy = this.parseText(stream, ['|'], variables);
            // Then the falsy result
            const falsy = this.parseText(stream, ['}'], variables);
            // Return based on variable truthiness
            return value ? truthy : falsy;
        }

        throw new Error('Unexpected stream state while parsing variable injection');
    }

    private parseFunction(stream: CharacterStream, variables: Record<string, string>): string {
        // Parse the function name
        const functionName = this.parseText(stream, ['#'], variables).toUpperCase();

        if (stream.current() === undefined) {
            throw new Error('Unexpected end of stream while parsing injection function name');
        }

        // Parse the operand text
        const operand = this.parseText(stream, ['}'], variables);

        const functions: Record<string, (text: string) => string> = {
            YEAR: (text: string) => {
                // If year is a number...
                if (text.match(/^\d+$/)) {
                    // If it's 8 digits or more, parse as a timestamp
                    if (text.length >= 8) {
                        const d = new Date(parseInt(text));
                        return d.getFullYear().toString();
                    }
                    // Otherwise, treat it as a year and return as-is
                    return text;
                }
                // Attempt to parse as a date string
                else {
                    const d = new Date(text);
                    if (!isNaN(d.getFullYear())) {
                        return d.getFullYear().toString();
                    }
                }
                return '???';
            },
            UPPER: (text: string) => text.toUpperCase(),
            LOWER: (text: string) => text.toLowerCase(),
            CAPITALIZE: (text: string) => capitalize(text),
        };

        const fn = functions[functionName];
        if (!fn) {
            throw new Error(`Invalid function name \`${functionName}\`, valid functions are ${naturalJoin(Object.keys(functions))}`);
        }

        return fn(operand);
    }

    private parseLanguageReference(stream: CharacterStream, variables: Record<string, string>): string {
        // Parse the selector
        const selector = this.parseText(stream, ['?', '}'], variables);
        // console.log(`Parse language reference: selector = ${selector}`);

        // Determine how many random list elements to pick
        let pickRandom = 0;
        if (stream.current() === '?') {
            // If the injection ends there, only pick one
            const range = this.parseText(stream, ['}'], variables);
            // console.log(`Parse language reference: range = ${range}`);
            if (range === '') {
                pickRandom = 1;
            } else {
                // Attempt to split the range in two
                if (range.includes('-')) {
                    const [ first, second ] = range.split('-');
                    const lo = parseInt(first);
                    if (isNaN(lo)) {
                        throw new Error(`Language reference with selector \`${selector}\` has bad range \`${range}\` (bad lower)`);
                    }
                    const hi = parseInt(second);
                    if (isNaN(hi)) {
                        throw new Error(`Language reference with selector \`${selector}\` has bad range \`${range}\` (bad upper)`);
                    }
                    // Determine a random number between these two
                    pickRandom = randInt(lo, hi + 1);
                }
                // Else, parse range as one number
                else {
                    const singular = parseInt(range);
                    if (isNaN(singular)) {
                        throw new Error(`Language reference with selector \`${selector}\` has bad range \`${range}\` (expected integer)`);
                    }
                    pickRandom = singular;
                }
            }
        }

        // Resolve the language config node that this selector points to
        const node = getSelectedNode(this._config, selector);

        // Resolve list using the pick-random logic
        if (pickRandom === 0) {
            // If no amount specified, then assert the current node is a string
            if (node?.constructor !== String) {
                throw new Error(`Language reference with selector \`${selector}\` expected a string but found type \`${node?.constructor?.name}\``);
            }
            return this.parseText(new CharacterStream(this.stringify(node)), [], variables);
        } else {
            // If an amount is specified, then assert the current node is an array
            if (!Array.isArray(node)) {
                throw new Error(`Language reference with selector \`${selector}\` expected an array but found type \`${node?.constructor?.name}\``);
            }
            // Copy the array and shuffle it (TODO: Each element of the array may not be a string, but that would be a huge error)
            const choices: string[] = shuffle(node.map(x => this.stringify(x)));
            // Assert that we're not taking more than is possible, then take a slice of the desired size
            if (pickRandom > choices.length) {
                throw new Error(`Language reference with selector \`${selector}\` is attempting to select ${pickRandom} elements from only ${choices.length} available choices`);
            }
            const selections: string[] = choices.slice(0, pickRandom);
            // Return the resulting elements joined in proper English
            return this.parseText(new CharacterStream(naturalJoin(selections)), [], variables);
        }
    }

    private parseInjection(stream: CharacterStream, variables: Record<string, string>): string {
        const first = stream.next();

        if (first === undefined) {
            throw new Error('Unexpected end of stream at beginning of injection');
        }
        
        // If random literal selection, parse literals
        if (first === '!') {
            return this.parseLiterals(stream, variables);
        }

        // If variable reference, parse as variable
        if (first === '$') {
            return this.parseVariable(stream, variables);
        }

        // If function operator, parse as function
        if (first === '#') {
            return this.parseFunction(stream, variables);
        }

        // Else, parse as language reference
        stream.backUp();
        return this.parseLanguageReference(stream, variables);
    }

    private parseText(stream: CharacterStream, terminators: string[], variables: Record<string, string>): string {
        let result = '';
        let escaped = false;
        // TODO: Using while(true) is really bad. Do something else
        do {
            const value = stream.next();
            if (value === undefined) {
                return result;
            } else if (escaped) {
                result += value;
                escaped = false;
            } else if (terminators.includes(value)) {
                return result;
            } else if (value === '{') {
                result += this.parseInjection(stream, variables);
            } else if (value === '\\') {
                escaped = true;
            } else {
                result += value;
            }
        } while (true)
    }

    private stringify(value: any): string {
        if (typeof value === 'string') {
            return value;
        }
        return JSON.stringify(value);
    }

    /**
     * @param input Unresolved input text (may contain tokens)
     * @param variables Variables that may be referenced and injected via variable tokens
     * @returns Processed text with all tokens recursively resolved
     */
    generate2(input: string, variables: Record<string, string> = {}): string {
        const stream = new CharacterStream(input);
        try {
            return this.parseText(stream, [], variables);
        } catch (err) {
            this._reportFailure((err as Error).message);
            return 'Hello';
        }
    }

    /**
     * Report language generation failure by logging and sending a message to the emergency log channel.
     * Refuses to log the failure if it's the same as the previous error message (to avoid retry spamming).
     * @param message error message to report
     */
    private _reportFailure(message: string): void {
        if (message !== this._lastErrorMessage) {
            this._lastErrorMessage = message;
            const errorMessage: string = `LanguageGenerator encountered an error: ${message}`;
            if (this.logger) {
                this.logger(errorMessage);
            }
        }
    }
}

export default LanguageGeneratorV2;
