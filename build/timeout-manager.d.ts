import { FileStorage } from "./file-storage";
/**
 * How to handle a timeout which is registered for sometime in the past.
 * The action will be taken on timeout registration (e.g. when the timeouts are loaded).
 */
export declare enum PastTimeoutStrategy {
    /**
     * Delete and clear the timeout.
     */
    Delete = "DELETE",
    /**
     * Invoke the timeout as soon as possible.
     */
    Invoke = "INVOKE",
    /**
     * Postpone the timeout by an hour.
     */
    IncrementHour = "INCREMENT_HOUR",
    /**
     * Postone the timeout by 24 hours.
     */
    IncrementDay = "INCREMENT_DAY"
}
/**
 * T represents the timeout type. Can either be a generic string or a string-backed enum.
 */
export declare class TimeoutManager<T extends string> {
    private static readonly DEFAULT_PAST_STRATEGY;
    private static readonly DEFAULT_FILE_NAME;
    private readonly storage;
    private readonly callbacks;
    private readonly timeouts;
    private readonly timeoutFileName;
    private previousTimeoutId;
    constructor(storage: FileStorage, callbacks: Record<T, () => Promise<void>>, options?: {
        fileName?: string;
    });
    private getNextTimeoutId;
    loadTimeouts(): Promise<void>;
    private dumpTimeouts;
    private addTimeoutForId;
    /**
     * Registers a timeout
     * @param type
     * @param date
     * @param pastStrategy
     */
    registerTimeout(type: T, date: Date, pastStrategy: PastTimeoutStrategy): Promise<void>;
    /**
     * @returns the date of some currently scheduled timeout of the given type, or undefined if none exists.
     */
    getDate(type: T): Date | undefined;
    /**
     * @returns true if a timeout with the given type is currently scheduled.
     */
    hasTimeout(type: T): boolean;
    /**
     * @returns list of human-readable strings representing each timeout (in ascending date order)
     */
    toStrings(): string[];
}
//# sourceMappingURL=timeout-manager.d.ts.map