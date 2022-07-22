/**
 * A circular queue of unique values with a moving index.
 */
export declare class CircularQueue<T> {
    private readonly set;
    private list;
    private index;
    constructor();
    /**
     * If the given value is not in the queue, add it to the end.
     * @param value the value to add
     * @returns true if the value was added
     */
    add(value: T): boolean;
    addAll(values: T[]): void;
    /**
     * If the given value is in the queue, remove it.
     * The index will remain pointing to whatever it was pointing to before.
     * @param value
     * @returns true if the value was removed
     */
    remove(value: T): boolean;
    clear(): void;
    /**
     * Return the current element, then advance the queue.
     * @returns the current element of the queue, or undefined if the queue is empty
     */
    next(): T | undefined;
    /**
     * Get the current element of the queue.
     * @returns the current element of the queue, or undefined if the queue is empty
     */
    get(): T | undefined;
    contains(value: T): boolean;
    isEmpty(): boolean;
    toSortedArray(): T[];
    toString(): string;
}
//# sourceMappingURL=circular-queue.d.ts.map