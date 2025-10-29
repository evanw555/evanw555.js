import { AsyncStorageInterface } from "./file-storage";
import { getRelativeDateTimeString } from "./utils/time";

/**
 * How to handle a timeout which is registered for sometime in the past.
 * The action will be taken on timeout registration (e.g. when the timeouts are loaded).
 */
export enum PastTimeoutStrategy {
    /**
     * Delete and clear the timeout.
     */
    Delete = 'DELETE',
    /**
     * Invoke the timeout as soon as possible.
     */
    Invoke = 'INVOKE',
    /**
     * Postpone the timeout by an hour.
     */
    IncrementHour = 'INCREMENT_HOUR',
    /**
     * Postone the timeout by 24 hours.
     */
    IncrementDay = 'INCREMENT_DAY'
}

/**
 * More advanced options for some scheduled timeout.
 */
export interface TimeoutOptions {
    /**
     * Some data that will be passed into the callback function as an argument when this timeout is invoked.
     */
    arg?: any,
    /**
     * The past strategy for this timeout.
     */
    pastStrategy?: PastTimeoutStrategy
}

interface Timeout<T> {
    type: T,
    date: string,
    options: TimeoutOptions
}

type ErrorCallback<T> = (id: string, type: T, err: any) => Promise<void>;

type MappedCallbacks<T extends string> = Record<T, (arg?: any) => Promise<void>>;
type MasterCallback<T> = (type: T, arg?: any) => Promise<void>;

/**
 * T represents the timeout type. Can either be a generic string or a string-backed enum.
 */
export class TimeoutManager<T extends string> {
    private static readonly DEFAULT_PAST_STRATEGY: PastTimeoutStrategy = PastTimeoutStrategy.Delete;
    private static readonly DEFAULT_FILE_NAME = 'timeouts.json';

    private readonly storage: AsyncStorageInterface;

    /**
     * The actual callback that should be invoked when a particular timeout's time has arrived.
     */
    private readonly callbacks: MasterCallback<T>;

    /**
     * Optional callback to invoke if an unhandled exception is encountered during the invocation of any timeout callback.
     */
    private readonly onError: ErrorCallback<T>;

    /**
     * The timeout data for a particular ID. This data should always be in-sync with what's serialized and written to storage.
     */
    private readonly timeouts: Record<string, Timeout<T>>;

    /**
     * The instances of the actual scheduled timeout in the Node runtime for a particular ID.
     */
    private readonly instances: Record<string, NodeJS.Timeout>;

    /**
     * The "file name" to be used when writing to storage.
     * TODO: This can be PG, so perhaps it should be renamed?
     */
    private readonly timeoutFileName: string;

    private previousTimeoutId: number;

    constructor(storage: AsyncStorageInterface, callbacks: MasterCallback<T> | MappedCallbacks<T>, options?: { fileName?: string, onError?: ErrorCallback<T> }) {
        this.storage = storage;
        // Allow the user to pass in a map-of-callbacks, but transform it to a master typed callback for internal use
        if (callbacks instanceof Function) {
            this.callbacks = callbacks;
        } else {
            this.callbacks = async (_type: T, _arg?: any) => {
                await callbacks[_type](_arg);
            };
        }
        this.onError = options?.onError ?? (async () => {});
        this.timeouts = {};
        this.instances = {};
        this.timeoutFileName = options?.fileName ?? TimeoutManager.DEFAULT_FILE_NAME;
        this.previousTimeoutId = 0;
    }

    private getNextTimeoutId(): string {
        // Iterate to next available ID and return
        while (this.timeouts.hasOwnProperty(++this.previousTimeoutId)) {}
        return this.previousTimeoutId.toString();
    }

    async loadTimeouts(): Promise<void> {
        // console.log('Loading up timeouts...');
        
        let timeouts: Record<string, any> = {};
        try {
            timeouts = await this.storage.readJson(this.timeoutFileName);
        } catch (err) {}
        
        for (const id of Object.keys(timeouts)) {
            const timeout: Timeout<T> = timeouts[id];
            const date: Date = new Date(timeout.date.trim());
            await this.addTimeoutForId(id, timeout.type, date, timeout.options);
        };
        await this.dumpTimeouts();
    }

    private async dumpTimeouts(): Promise<void> {
        await this.storage.write(this.timeoutFileName, JSON.stringify(this.timeouts, null, 2));
        // console.log(`Dumped timeouts as ${JSON.stringify(this.timeouts)}`);
    }

    private async addTimeoutForId(id: string, type: T, date: Date, options: TimeoutOptions): Promise<void> {
        const pastStrategy: PastTimeoutStrategy = options.pastStrategy ?? TimeoutManager.DEFAULT_PAST_STRATEGY;
        const millisUntilMessage: number = date.getTime() - new Date().getTime();
        if (millisUntilMessage > 2147483647) {
            // If the timeout is too far in the future (more than 24 days, max 32-bit signed int), save it but don't schedule timeout
            this.timeouts[id] = {
                type,
                date: date.toJSON(),
                options
            };
            // Schedule a timeout to try again in 10 days
            this.instances[id] = setTimeout(async () => {
                // First, clear the timeout info and un-associate this ID with this timeout instance
                delete this.timeouts[id];
                delete this.instances[id];
                // Then, try to add the timeout again with the same ID, options, etc.
                await this.addTimeoutForId(id, type, date, options);
                // Dump the timeouts
                await this.dumpTimeouts();
            }, 1000 * 60 * 60 * 24 * 10);
            // console.log(`Timeout for \`${type}\` at ${date.toLocaleString()} is too far out, trying again in 10 days`);
        } else if (millisUntilMessage > 0) {
            // If timeout is in the future, then set a timeout for it as per usual
            this.timeouts[id] = {
                type,
                date: date.toJSON(),
                options
            };
            // Schedule and save the actual timeout
            this.instances[id] = setTimeout(async () => {
                // First, clear the timeout info and un-associate this ID with this timeout instance
                delete this.timeouts[id];
                delete this.instances[id];
                // Perform the actual callback
                await this.invokeTimeout(id, type, options);
                // Dump the timeouts
                await this.dumpTimeouts();
            }, millisUntilMessage);
            // console.log(`Added timeout for \`${type}\` at ${date.toLocaleString()}`);
        } else if (pastStrategy === PastTimeoutStrategy.Invoke) {
            // Timeout is in the past, so just invoke the callback now
            await this.invokeTimeout(id, type, options);
        } else if (pastStrategy === PastTimeoutStrategy.IncrementDay) {
            // Timeout is in the past, so try again with the day incremented
            const tomorrow: Date = new Date(date);
            tomorrow.setDate(tomorrow.getDate() + 1);
            // console.log(`Incrementing timeout for \`${type}\` at ${date.toLocaleString()} by 1 day`);
            await this.addTimeoutForId(id, type, tomorrow, options);
        } else if (pastStrategy === PastTimeoutStrategy.IncrementHour) {
            // Timeout is in the past, so try again with the hour incremented
            const nextHour: Date = new Date(date);
            nextHour.setHours(nextHour.getHours() + 1);
            // console.log(`Incrementing timeout for \`${type}\` at ${date.toLocaleString()} by 1 hour`);
            await this.addTimeoutForId(id, type, nextHour, options);
        } else if (pastStrategy === PastTimeoutStrategy.Delete) {
            // Timeout is in the past, so just delete the timeout altogether
            // console.log(`Deleted timeout for \`${type}\` at ${date.toLocaleString()}`);
        }
    }

    /**
     * Safely invokes a given timeout, reporting any errors back to the user via the error callback.
     * This method is safe and thus can be assumed to never fail. Note that there doesn't necessarily
     * need to be a timeout with the given ID or type in the state.
     * @param id ID of the timeout to be invoked
     * @param type Type of the timeout to be invoked
     * @param options Options of the timeout to be invoked
     */
    private async invokeTimeout(id: string, type: T, options: TimeoutOptions): Promise<void> {
        // Invoke the callback safely so that errors can be reported back to the user
        try {
            await this.callbacks(type, options.arg);
        } catch (err) {
            // This method failing is fatal, so ensure the error callback is also safe
            try {
                await this.onError(id, type, err);
            } catch (err) {
                // TODO: Can we report this in a better way?
                console.log(`Failed to invoke both the callback and the error handler for \`${type}\` timeout with ID \`${id}\`: \`${err}\``);
            }
        }
    }

    /**
     * Registers a timeout.
     * @param type 
     * @param date 
     * @param options
     * @returns The ID of the newly scheduled timeout
     */
    async registerTimeout(type: T, date: Date, options: TimeoutOptions = {}): Promise<string> {
        const id = this.getNextTimeoutId();
        await this.addTimeoutForId(id, type, date, options);
        await this.dumpTimeouts();
        return id;
    }

    /**
     * Cancels an existing timeout. This method will fail if the timeout is mid-invocation or nonexistent.
     * @param id ID of the timeout to be canceled
     * @throws Error if no timeout with this ID is currently scheduled
     */
    async cancelTimeout(id: string): Promise<void> {
        if (!this.instances[id] || !this.timeouts[id]) {
            throw new Error(`Cannot cancel non-existent timeout with ID ${id}`);
        }
        // Actually cancel the timeout in the Node runtime
        clearTimeout(this.instances[id]);
        // Delete it from the revelant maps
        delete this.instances[id];
        delete this.timeouts[id];
        // Dump the timeouts
        await this.dumpTimeouts();
    }

    /**
     * Cancels all the timeouts of a given type. Any timeouts that are mid-invocation will not be cancelled.
     * @param type Type of timeouts to cancel
     * @returns The IDs of all canceled timeouts
     */
    async cancelTimeoutsWithType(type: T): Promise<string[]> {
        const ids: string[] = this.getTimeoutIdsWithType(type);
        for (const id of ids) {
            await this.cancelTimeout(id);
        }
        return ids;
    }

    /**
     * Postpones an existing timeout to a later date. This method will fail if the timeout is mid-invocation or nonexistent.
     * @param id ID of the timeout to be postponed
     * @param value Either the new date (as a Date object), or a number (in milliseconds) indicating how long to postpone
     * @throws Error if no timeout with this ID is currently scheduled
     * @returns New date of the postponed timeout
     */
    async postponeTimeout(id: string, value: Date | number): Promise<Date> {
        if (!this.instances[id] || !this.timeouts[id]) {
            throw new Error(`Cannot postpone non-existent timeout with ID ${id}`);
        }
        const timeout = this.timeouts[id];
        // Cancel the existing timeout
        await this.cancelTimeout(id);
        // Determine the new date
        const previousDate = new Date(timeout.date);
        let newDate: Date;
        if (value instanceof Date) {
            newDate = value;
        } else {
            newDate = new Date(previousDate.getTime() + value);
        }
        // Add and schedule the new timeout
        await this.addTimeoutForId(id, timeout.type, newDate, timeout.options);
        // Dump the updated timeouts
        await this.dumpTimeouts();
        return newDate;
    }

    /**
     * Postpones all existing timeouts of a given type to a later date. Any timeouts that are mid-invocation will not be postponed.
     * @param type Type of timeouts to postpone
     * @param value Either the new date (as a Date object), or a number (in milliseconds) indicating how long to postpone
     * @returns The IDs of all postponed timeouts
     */
    async postponeTimeoutsWithType(type: T, value: Date | number): Promise<string[]> {
        const ids: string[] = this.getTimeoutIdsWithType(type);
        for (const id of ids) {
            await this.postponeTimeout(id, value);
        }
        return ids;
    }

    /**
     * Forces an existing timeout into invocation immediately. This method will fail if the timeout is mid-invocation or nonexistent.
     * @param id ID of the timeout to be postponed
     * @param value Either the new date (as a Date object), or a number (in milliseconds) indicating how long to postpone
     * @throws Error if no timeout with this ID is currently scheduled
     */
    async forceTimeout(id: string) {
        if (!this.instances[id] || !this.timeouts[id]) {
            throw new Error(`Cannot force non-existent timeout with ID ${id}`);
        }
        const timeout = this.timeouts[id];
        // Cancel the existing timeout
        await this.cancelTimeout(id);
        // Invoke it now
        await this.invokeTimeout(id, timeout.type, timeout.options);
    }

    /**
     * Forces all existing timeouts of a given type into invocation immediately. Any timeouts that are mid-invocation will not be forced.
     * @param type Type of timeouts to force
     * @returns The IDs of all forced timeouts
     */
    async forceTimeoutsWithType(type: T): Promise<string[]> {
        const ids: string[] = this.getTimeoutIdsWithType(type);
        for (const id of ids) {
            await this.forceTimeout(id);
        }
        return ids;
    }

    /**
     * Determines if this manager has an existing timeout with the provided ID.
     * @param id Timeout ID
     * @returns True if a timeout with the given ID is scheduled and has not yet begun invocation
     */
    hasTimeoutWithId(id: string): boolean {
        return id in this.timeouts && id in this.instances;
    }

    /**
     * Gets the date of the scheduled timeout with a given ID, or undefined if none exists.
     * @param id Timeout ID
     * @returns The date of the corresponding timeout, or undefined if it doesn't exist (or has begun invocation).
     */
    getDateForTimeoutWithId(id: string): Date | undefined {
        if (id in this.timeouts) {
            return new Date(this.timeouts[id].date);
        }
    }

    /**
     * Gets the date of some timeout with the provided type, or undefined if none exists.
     * Note that if there are multiple timeouts with this type, there is no guarantee which one will be selected.
     * @returns the date of some currently scheduled timeout of the given type, or undefined if none exists.
     */
    getDateForTimeoutWithType(type: T): Date | undefined {
        for (const id of this.getTimeoutIdsWithType(type)) {
            return new Date(this.timeouts[id].date.trim());
        }
    }

    /**
     * Determines if there is at least one scheduled timeout with a given type that has not yet begun invocation.
     * @returns true if a timeout with the given type is currently scheduled.
     */
    hasTimeoutWithType(type: T): boolean {
        return this.getTimeoutIdsWithType(type).length > 0;
    }

    private getTimeoutIdsWithType(type: T): string[] {
        return Object.keys(this.timeouts).filter(id => this.timeouts[id].type === type);
    }

    /**
     * Given a predicate that takes a timeout arg as input, return IDs for all timeouts for which the predicate is true.
     * @param type Only compare against timeouts with this type
     * @param predicate Timeout argument predicate
     */
    getTimeoutIdsWithArg(type: T, predicate: (arg: any) => boolean): string[] {
        return this.getTimeoutIdsWithType(type).filter(id => predicate(this.timeouts[id].options.arg));
    }

    /**
     * @returns list of human-readable strings representing each timeout (in ascending date order)
     */
    toStrings(): string[] {
        return Object.values(this.timeouts)
            .sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime())
            .map(timeout => {
                return `**${getRelativeDateTimeString(new Date(timeout.date))}:** \`${timeout.type}(${JSON.stringify(timeout.options.arg) ?? ''}) -> ${timeout.options.pastStrategy}\``;
            });
    }
}
