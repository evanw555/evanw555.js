/**
 * A circular queue of unique values with a moving index.
 */
export class CircularQueue<T> {
    private readonly set: Set<T>;
    private list: T[];
    private index: number; 

    constructor() {
        this.set = new Set<T>();
        this.list = [];
        this.index = 0;
    }

    /**
     * If the given value is not in the queue, add it to the end.
     * @param value the value to add
     * @returns true if the value was added
     */
    add(value: T): boolean {
        if (!this.set.has(value)) {
            this.set.add(value);
            this.list.push(value);
            return true;
        }
        return false;
    }

    addAll(values: T[]): void {
        values.forEach(this.add.bind(this));
    }

    /**
     * If the given value is in the queue, remove it.
     * The index will remain pointing to whatever it was pointing to before.
     * @param value 
     * @returns true if the value was removed
     */
    remove(value: T): boolean {
        if (!this.set.has(value)) {
            return false;
        }

        const indexToRemove = this.list.indexOf(value);
        
        // If the index is impacted, correct it
        if (this.index > indexToRemove) {
            this.index--;
        }

        // Remove the value from the queue
        this.set.delete(value);
        this.list.splice(indexToRemove, 1);

        // Handle cases where the index might become out-of-bounds
        if (this.list.length === 0) {
            this.index = 0;
        } else {
            this.index %= this.list.length;
        }

        return true;
    }

    clear(): void {
        this.set.clear();
        this.list = [];
        this.index = 0;
    }

    /**
     * Return the current element, then advance the queue.
     * @returns the current element of the queue, or undefined if the queue is empty
     */
    next(): T | undefined {
        if (this.list.length === 0) {
            return undefined;
        }

        const value = this.list[this.index];
        this.index = (this.index + 1) % this.list.length;
        return value;
    }

    /**
     * Get the current element of the queue.
     * @returns the current element of the queue, or undefined if the queue is empty
     */
    get(): T | undefined {
        return this.list[this.index];
    }

    contains(value: T): boolean {
        return this.set.has(value);
    }

    isEmpty(): boolean {
        return this.list.length === 0;
    }

    toSortedArray(): T[] {
        const array = Array.from(this.set);
        array.sort();
        return array;
    }

    toString(): string {
        return JSON.stringify(this.toSortedArray());
    }
}
