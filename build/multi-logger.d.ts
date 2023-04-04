type MultiLoggerOutput = (text: string) => Promise<void>;
export declare enum MultiLoggerLevel {
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
export declare class MultiLogger {
    private readonly outputs;
    private readonly maxLength;
    private readonly defaultLoggerLevel;
    private readonly defaultLogLevel;
    constructor(options?: {
        maxLength?: number;
        defaultLoggerLevel?: MultiLoggerLevel;
        defaultLogLevel?: MultiLoggerLevel;
    });
    /**
     * Adds a new output for this logger.
     * @param output The actual logger callback
     * @param level Optional logging level of this output (defaults to this logger's default)
     * @returns The index of this output (used to configure this output at a later time)
     */
    addOutput(output: MultiLoggerOutput, level?: MultiLoggerLevel): number;
    /**
     * Adjust the logging level of an existing output.
     * @param index The index of the output to be reconfigured
     * @param level The new level of this output
     */
    setOutputLevel(index: number, level: MultiLoggerLevel): void;
    log(text: string, level?: MultiLoggerLevel): Promise<void>;
}
export {};
//# sourceMappingURL=multi-logger.d.ts.map