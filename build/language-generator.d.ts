declare class LanguageGenerator {
    private readonly _config;
    private _lastErrorMessage?;
    private logger?;
    constructor(config: Record<string, any>);
    setLogger(logger: (message: string) => void): void;
    private _resolve;
    /**
     * Report language generation failure by logging and sending a message to the emergency log channel.
     * Refuses to log the failure if it's the same as the previous error message (to avoid retry spamming).
     * @param message error message to report
     */
    private _reportFailure;
    /**
     * @param input Unresolved input text (may contain tokens)
     * @param variables Variables that may be referenced and injected via variable tokens
     * @returns Processed text with all tokens recursively resolved
     */
    generate(input: string, variables?: Record<string, string>): string;
}
export default LanguageGenerator;
//# sourceMappingURL=language-generator.d.ts.map