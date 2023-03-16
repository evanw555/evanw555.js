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
    private readonly callbacks: Record<T, (arg?: any) => Promise<void>>;

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

    constructor(storage: AsyncStorageInterface, callbacks: Record<T, (arg?: any) => Promise<void>>, options?: { fileName?: string }) {
        this.storage = storage;
        this.callbacks = callbacks;
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
        console.log('Loading up timeouts...');
        
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
        console.log(`Dumped timeouts as ${JSON.stringify(this.timeouts)}`);
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
                // First, un-associate this ID with this timeout instance
                delete this.instances[id];
                // Then, try to add the timeout again
                await this.addTimeoutForId(id, type, date, options);
            }, 1000 * 60 * 60 * 24 * 10);
            console.log(`Timeout for \`${type}\` at ${date.toLocaleString()} is too far out, trying again in 10 days`);
        } else if (millisUntilMessage > 0) {
            // If timeout is in the future, then set a timeout for it as per usual
            this.timeouts[id] = {
                type,
                date: date.toJSON(),
                options
            };
            // Schedule and save the actual timeout
            this.instances[id] = setTimeout(async () => {
                // First, un-associate this ID with this timeout instance
                delete this.instances[id];
                // Perform the actual callback
                await this.callbacks[type](options.arg);
                // Clear the timeout info
                delete this.timeouts[id];
                // Dump the timeouts
                await this.dumpTimeouts();
            }, millisUntilMessage);
            console.log(`Added timeout for \`${type}\` at ${date.toLocaleString()}`);
        } else if (pastStrategy === PastTimeoutStrategy.Invoke) {
            // Timeout is in the past, so just invoke the callback now
            await this.callbacks[type](options.arg);
        } else if (pastStrategy === PastTimeoutStrategy.IncrementDay) {
            // Timeout is in the past, so try again with the day incremented
            const tomorrow: Date = new Date(date);
            tomorrow.setDate(tomorrow.getDate() + 1);
            console.log(`Incrementing timeout for \`${type}\` at ${date.toLocaleString()} by 1 day`);
            await this.addTimeoutForId(id, type, tomorrow, options);
        } else if (pastStrategy === PastTimeoutStrategy.IncrementHour) {
            // Timeout is in the past, so try again with the hour incremented
            const nextHour: Date = new Date(date);
            nextHour.setHours(nextHour.getHours() + 1);
            console.log(`Incrementing timeout for \`${type}\` at ${date.toLocaleString()} by 1 hour`);
            await this.addTimeoutForId(id, type, nextHour, options);
        } else if (pastStrategy === PastTimeoutStrategy.Delete) {
            // Timeout is in the past, so just delete the timeout altogether
            console.log(`Deleted timeout for \`${type}\` at ${date.toLocaleString()}`);
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
     * Cancels an existing timeout.
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
     * Cancels all the timeouts of a given type.
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
     * Postpones an existing timeout to a later date.
     * @param id ID of the timeout to be postponed
     * @param value Either the new date (as a Date object), or a number (in milliseconds) indicating how long to postpone
     * @throws Error if no timeout with this ID is currently scheduled
     */
    async postponeTimeout(id: string, value: Date | number): Promise<void> {
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
    }

    hasTimeoutWithId(id: string): boolean {
        return id in this.timeouts && id in this.instances;
    }

    getDateForTimeoutWithId(id: string): Date | undefined {
        if (id in this.timeouts) {
            return new Date(this.timeouts[id].date);
        }
    }

    /**
     * @returns the date of some currently scheduled timeout of the given type, or undefined if none exists.
     */
    getDateForTimeoutWithType(type: T): Date | undefined {
        for (const id of this.getTimeoutIdsWithType(type)) {
            return new Date(this.timeouts[id].date.trim());
        }
    }

    /**
     * @returns true if a timeout with the given type is currently scheduled.
     */
    hasTimeoutWithType(type: T): boolean {
        return this.getTimeoutIdsWithType(type).length > 0;
    }

    private getTimeoutIdsWithType(type: T): string[] {
        return Object.keys(this.timeouts).filter(id => this.timeouts[id].type === type);
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
