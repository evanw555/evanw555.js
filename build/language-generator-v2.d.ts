export declare class LanguageGeneratorV2 {
    private readonly _config;
    private _lastErrorMessage?;
    private logger?;
    constructor(config: Record<string, any>);
    setLogger(logger: (message: string) => void): void;
    private parseLiterals;
    private parseVariable;
    private parseFunction;
    private parseLanguageReference;
    private parseInjection;
    private parseText;
    private stringify;
    /**
     * @param input Unresolved input text (may contain tokens)
     * @param variables Variables that may be referenced and injected via variable tokens
     * @returns Processed text with all tokens recursively resolved
     */
    generate2(input: string, variables?: Record<string, string>): string;
    /**
     * Report language generation failure by logging and sending a message to the emergency log channel.
     * Refuses to log the failure if it's the same as the previous error message (to avoid retry spamming).
     * @param message error message to report
     */
    private _reportFailure;
}
export default LanguageGeneratorV2;
//# sourceMappingURL=language-generator-v2.d.ts.map