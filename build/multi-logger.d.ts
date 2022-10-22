declare type MultiLoggerOutput = (text: string) => Promise<void>;
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
    addOutput(output: MultiLoggerOutput, level?: MultiLoggerLevel): void;
    log(text: string, level?: MultiLoggerLevel): Promise<void>;
}
export {};
//# sourceMappingURL=multi-logger.d.ts.map