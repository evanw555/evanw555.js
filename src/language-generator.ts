import { naturalJoin } from './utils/misc';

export class LanguageGenerator {
    private readonly _config: Record<string, any>;
    private _lastErrorMessage?: string;
    private logger?: (message: string) => void;

    constructor(config: Record<string, any>) {
        this._config = config;
    }

    setLogger(logger: (message: string) => void): void {
        this.logger = logger;
    }

    private _resolve(token: string, variables: Record<string, string>): string {
        let stripped: string = token.substring(1, token.length - 1);

        // In the simple case (list of literals), handle this upfront
        if (stripped.startsWith('!')) {
            const options: string[] = stripped.substring(1).split('|');
            return options[Math.floor(Math.random() * options.length)];
        }

        // If dealing with variable injection return that variable if it exists, else return the token
        if (stripped.startsWith('$')) {
            const identifier: string = stripped.substring(1);
            if (variables[identifier] === undefined) {
                throw new Error(`Token \`${token}\` references nonexistent variable, available variables are \`${JSON.stringify(Object.keys(variables))}\``);
            }
            return variables[identifier];
        }

        // Check if there's a random modifier at the end
        let pickRandom: number = 0;
        if (stripped.endsWith('?')) {
            // e.g. "{foo.bar?}"
            pickRandom = 1;
            stripped = stripped.substring(0, stripped.length - 1);
        } else if (stripped.match(/\?\d+$/)) {
            // e.g. "{foo.bar?3}"
            pickRandom = parseInt(stripped.substring(stripped.lastIndexOf('?') + 1));
            stripped = stripped.substring(0, stripped.lastIndexOf('?'));
        }else if (stripped.match(/\?\d+\-\d+$/)) {
            // e.g. "{foo.bar?2-3}"
            const execResult: string[] = /\?(\d+)\-(\d+)$/.exec(stripped) as string[];
            const lo: number = parseInt(execResult[1]);
            const hi: number = parseInt(execResult[2]);
            pickRandom = Math.floor(Math.random() * (hi - lo + 1)) + lo;
            stripped = stripped.substring(0, stripped.lastIndexOf('?'));
        }

        // Resolve the language config node that this selector points to
        const segments: string[] = stripped.split('.');
        let node: any = this._config;
        while (segments.length > 0) {
            const segment: string = segments.shift() as string;
            if (!node || !node.hasOwnProperty(segment)) {
                throw new Error(`Token \`${token}\` has bad selector \`${stripped}\` which failed on segment \`${segment}\``);
            }
            node = node[segment];
        }

        // Resolve list using the pick-random logic
        if (pickRandom === 0) {
            // If no amount specified, then assert the current node is a string
            if (node?.constructor !== String) {
                throw new Error(`Token \`${token}\` expected a string but found type \`${node?.constructor?.name}\``);
            }
            return node.toString();
        } else {
            // If an amount is specified, then assert the current node is an array
            if (!Array.isArray(node)) {
                throw new Error(`Token \`${token}\` expected an array but found type \`${node?.constructor?.name}\``);
            }
            // Copy the array and shuffle it (TODO: Each element of the array may not be a string, but that would be a huge error)
            const choices: string[] = node.map(x => x.toString()).sort((x, y) => Math.random() - Math.random());
            // Assert that we're not taking more than is possible, then take a slice of the desired size
            if (pickRandom > choices.length) {
                throw new Error(`Token \`${token}\` is attempting to select ${pickRandom} elements from only ${choices.length} available choices`);
            }
            const selections: string[] = choices.slice(0, pickRandom);
            // Return the resulting elements joined in proper English
            return naturalJoin(selections);
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

    /**
     * @param input Unresolved input text (may contain tokens)
     * @param variables Variables that may be referenced and injected via variable tokens
     * @returns Processed text with all tokens recursively resolved
     */
    generate(input: string, variables: Record<string, string> = {}): string {
        const p: RegExp = /{\!?([^{}]+)(\?\d*\-?\d*)?}/;
        // This logic can be retried a number of times, in case a bad result is generated
        let attemptsRemaining: number = 10;
        while (attemptsRemaining-- > 0) {
            // Iteratively resolve all existing tokens until none are left (handles recursive tokens)
            let result: string = input;
            try {
                while (result.search(p) !== -1) {
                    result = result.replace(p, (x) => this._resolve(x, variables));
                }
            } catch (err) {
                this._reportFailure((err as Error).message);
                continue;
            }
            // If the resulting output seems to be malformed, log it and try again!
            if (result.includes('{') || result.includes('}') || result.includes('|')) {
                this._reportFailure(`Processed input \`${input}\` and produced a bad output \`${result}\``);
                continue;
            }
            return result;
        }
        // Ultimate fallback text (ideally it should never get here)
        return "Hello";
    }
}

export default LanguageGenerator;
