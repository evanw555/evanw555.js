import { AsyncStorageInterface } from "./file-storage";
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
 * More advanced options for some scheduled timeout.
 */
export interface TimeoutOptions {
    /**
     * Some data that will be passed into the callback function as an argument when this timeout is invoked.
     */
    arg?: any;
    /**
     * The past strategy for this timeout.
     */
    pastStrategy?: PastTimeoutStrategy;
}
declare type ErrorCallback<T> = (id: string, type: T, err: any) => Promise<void>;
/**
 * T represents the timeout type. Can either be a generic string or a string-backed enum.
 */
export declare class TimeoutManager<T extends string> {
    private static readonly DEFAULT_PAST_STRATEGY;
    private static readonly DEFAULT_FILE_NAME;
    private readonly storage;
    /**
     * The actual callback that should be invoked when a particular timeout's time has arrived.
     */
    private readonly callbacks;
    /**
     * Optional callback to invoke if an unhandled exception is encountered during the invocation of any timeout callback.
     */
    private readonly onError;
    /**
     * The timeout data for a particular ID. This data should always be in-sync with what's serialized and written to storage.
     */
    private readonly timeouts;
    /**
     * The instances of the actual scheduled timeout in the Node runtime for a particular ID.
     */
    private readonly instances;
    /**
     * The "file name" to be used when writing to storage.
     * TODO: This can be PG, so perhaps it should be renamed?
     */
    private readonly timeoutFileName;
    private previousTimeoutId;
    constructor(storage: AsyncStorageInterface, callbacks: Record<T, (arg?: any) => Promise<void>>, options?: {
        fileName?: string;
        onError?: ErrorCallback<T>;
    });
    private getNextTimeoutId;
    loadTimeouts(): Promise<void>;
    private dumpTimeouts;
    private addTimeoutForId;
    private invokeTimeout;
    /**
     * Registers a timeout.
     * @param type
     * @param date
     * @param options
     * @returns The ID of the newly scheduled timeout
     */
    registerTimeout(type: T, date: Date, options?: TimeoutOptions): Promise<string>;
    /**
     * Cancels an existing timeout.
     * @param id ID of the timeout to be canceled
     * @throws Error if no timeout with this ID is currently scheduled
     */
    cancelTimeout(id: string): Promise<void>;
    /**
     * Cancels all the timeouts of a given type.
     * @param type Type of timeouts to cancel
     * @returns The IDs of all canceled timeouts
     */
    cancelTimeoutsWithType(type: T): Promise<string[]>;
    /**
     * Postpones an existing timeout to a later date.
     * @param id ID of the timeout to be postponed
     * @param value Either the new date (as a Date object), or a number (in milliseconds) indicating how long to postpone
     * @throws Error if no timeout with this ID is currently scheduled
     */
    postponeTimeout(id: string, value: Date | number): Promise<void>;
    hasTimeoutWithId(id: string): boolean;
    getDateForTimeoutWithId(id: string): Date | undefined;
    /**
     * @returns the date of some currently scheduled timeout of the given type, or undefined if none exists.
     */
    getDateForTimeoutWithType(type: T): Date | undefined;
    /**
     * @returns true if a timeout with the given type is currently scheduled.
     */
    hasTimeoutWithType(type: T): boolean;
    private getTimeoutIdsWithType;
    /**
     * @returns list of human-readable strings representing each timeout (in ascending date order)
     */
    toStrings(): string[];
}
export {};
//# sourceMappingURL=timeout-manager.d.ts.map