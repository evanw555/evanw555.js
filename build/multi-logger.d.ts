declare type MultiLoggerOutput = (text: string) => Promise<void>;
/**
 * Unified logger for logging to multiple destinations.
 */
export declare class MultiLogger {
    private readonly outputs;
    private readonly maxLength;
    constructor(options?: {
        maxLength: number;
    });
    addOutput(output: MultiLoggerOutput): void;
    log(text: string): Promise<void>;
}
export {};
//# sourceMappingURL=multi-logger.d.ts.map