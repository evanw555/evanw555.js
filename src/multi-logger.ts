type MultiLoggerOutput = (text: string) => Promise<void>;

/**
 * Unified logger for logging to multiple destinations.
 */
export class MultiLogger {
    private readonly outputs: MultiLoggerOutput[];
    private readonly maxLength: number;

    constructor(options?: { maxLength: number }) {
        this.outputs = [];
        this.maxLength = options?.maxLength ?? 1990; // Discord's limit is 2000
    }

    addOutput(output: MultiLoggerOutput): void {
        this.outputs.push(output);
    }

    async log(text: string): Promise<void> {
        // Truncate text if necessary
        if (text.length > this.maxLength) {
            text = text.substring(0, this.maxLength) + '...';
        }
        // Send the text to each output
        for (const output of this.outputs) {
            try {
                await output(text);
            } catch (err) {
                // TODO: Should we do something rather than failing silently?
            }
        }
    }
}