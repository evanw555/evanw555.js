import { FileStorage } from "./file-storage";
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

    private readonly storage: FileStorage;
    private readonly callbacks: Record<T, (arg?: any) => Promise<void>>;
    private readonly timeouts: Record<string, Timeout<T>>;
    private readonly timeoutFileName: string;
    private previousTimeoutId: number;

    constructor(storage: FileStorage, callbacks: Record<T, (arg?: any) => Promise<void>>, options?: { fileName?: string }) {
        this.storage = storage;
        this.callbacks = callbacks;
        this.timeouts = {};
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
        if (millisUntilMessage > 0) {
            // If timeout is in the future, then set a timeout for it as per usual
            this.timeouts[id] = {
                type,
                date: date.toJSON(),
                options
            };
            setTimeout(async () => {
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
     * Registers a timeout 
     * @param type 
     * @param date 
     * @param options
     */
    async registerTimeout(type: T, date: Date, options: TimeoutOptions = {}): Promise<void> {
        const id = this.getNextTimeoutId();
        await this.addTimeoutForId(id, type, date, options);
        await this.dumpTimeouts();
    }

    /**
     * @returns the date of some currently scheduled timeout of the given type, or undefined if none exists.
     */
    getDate(type: T): Date | undefined {
        for (const timeoutInfo of Object.values(this.timeouts)) {
            if (timeoutInfo.type === type) {
                return new Date(timeoutInfo.date.trim());
            }
        }
    }

    /**
     * @returns true if a timeout with the given type is currently scheduled.
     */
    hasTimeout(type: T): boolean {
        return Object.values(this.timeouts).some(t => t.type === type);
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
