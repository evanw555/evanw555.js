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
type ErrorCallback<T> = (id: string, type: T, err: any) => Promise<void>;
type MappedCallbacks<T extends string> = Record<T, (arg?: any) => Promise<void>>;
type MasterCallback<T> = (type: T, arg?: any) => Promise<void>;
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
    constructor(storage: AsyncStorageInterface, callbacks: MasterCallback<T> | MappedCallbacks<T>, options?: {
        fileName?: string;
        onError?: ErrorCallback<T>;
    });
    private getNextTimeoutId;
    loadTimeouts(): Promise<void>;
    private dumpTimeouts;
    private addTimeoutForId;
    /**
     * Safely invokes a given timeout, reporting any errors back to the user via the error callback.
     * This method is safe and thus can be assumed to never fail.
     * @param id ID of the timeout to be invoked
     * @param type Type of the timeout to be invoked
     * @param options Options of the timeout to be invoked
     */
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
     * Cancels an existing timeout. This method will fail if the timeout is mid-invocation or nonexistent.
     * @param id ID of the timeout to be canceled
     * @throws Error if no timeout with this ID is currently scheduled
     */
    cancelTimeout(id: string): Promise<void>;
    /**
     * Cancels all the timeouts of a given type. Any timeouts that are mid-invocation will not be cancelled.
     * @param type Type of timeouts to cancel
     * @returns The IDs of all canceled timeouts
     */
    cancelTimeoutsWithType(type: T): Promise<string[]>;
    /**
     * Postpones an existing timeout to a later date. This method will fail if the timeout is mid-invocation or nonexistent.
     * @param id ID of the timeout to be postponed
     * @param value Either the new date (as a Date object), or a number (in milliseconds) indicating how long to postpone
     * @throws Error if no timeout with this ID is currently scheduled
     */
    postponeTimeout(id: string, value: Date | number): Promise<void>;
    /**
     * Postpones all existing timeouts of a given type to a later date. Any timeouts that are mid-invocation will not be postponed.
     * @param type Type of timeouts to postpone
     * @param value Either the new date (as a Date object), or a number (in milliseconds) indicating how long to postpone
     * @returns The IDs of all postpones timeouts
     */
    postponeTimeoutsWithType(type: T, value: Date | number): Promise<string[]>;
    /**
     * Determines if this manager has an existing timeout with the provided ID.
     * @param id Timeout ID
     * @returns True if a timeout with the given ID is scheduled and has not yet begun invocation
     */
    hasTimeoutWithId(id: string): boolean;
    /**
     * Gets the date of the scheduled timeout with a given ID, or undefined if none exists.
     * @param id Timeout ID
     * @returns The date of the corresponding timeout, or undefined if it doesn't exist (or has begun invocation).
     */
    getDateForTimeoutWithId(id: string): Date | undefined;
    /**
     * Gets the date of some timeout with the provided type, or undefined if none exists.
     * Note that if there are multiple timeouts with this type, there is no guarantee which one will be selected.
     * @returns the date of some currently scheduled timeout of the given type, or undefined if none exists.
     */
    getDateForTimeoutWithType(type: T): Date | undefined;
    /**
     * Determines if there is at least one scheduled timeout with a given type that has not yet begun invocation.
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