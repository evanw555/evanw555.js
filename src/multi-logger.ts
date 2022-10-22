type MultiLoggerOutput = (text: string) => Promise<void>;

export enum MultiLoggerLevel {
    All = 0,
    Trace = 1,
    Debug = 2,
    Info = 3,
    Warn = 4,
    Error = 5,
    Fatal = 6,
    Off = 7
}

/**
 * Unified logger for logging to multiple destinations.
 */
export class MultiLogger {
    private readonly outputs: { output: MultiLoggerOutput, level: MultiLoggerLevel }[];
    private readonly maxLength: number;
    private readonly defaultLoggerLevel: MultiLoggerLevel;
    private readonly defaultLogLevel: MultiLoggerLevel;

    constructor(options?: { maxLength?: number, defaultLoggerLevel?: MultiLoggerLevel, defaultLogLevel?: MultiLoggerLevel }) {
        this.outputs = [];
        this.maxLength = options?.maxLength ?? 1990; // Discord's limit is 2000
        this.defaultLoggerLevel = options?.defaultLoggerLevel ?? MultiLoggerLevel.All;
        this.defaultLogLevel = options?.defaultLogLevel ?? MultiLoggerLevel.Off;
    }

    addOutput(output: MultiLoggerOutput, level: MultiLoggerLevel = this.defaultLoggerLevel): void {
        this.outputs.push({ output, level });
    }

    async log(text: string, level: MultiLoggerLevel = this.defaultLogLevel): Promise<void> {
        // Truncate text if necessary
        if (text.length > this.maxLength) {
            text = text.substring(0, this.maxLength) + '...';
        }
        // Send the text to each output
        for (const entry of this.outputs) {
            if (level >= entry.level) {
                try {
                    await entry.output(text);
                } catch (err) {
                    // TODO: Should we do something rather than failing silently?
                }
            }
        }
    }
}