"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircularQueue = void 0;
/**
 * A circular queue of unique values with a moving index.
 */
class CircularQueue {
    constructor() {
        this.set = new Set();
        this.list = [];
        this.index = 0;
    }
    /**
     * If the given value is not in the queue, add it to the end.
     * @param value the value to add
     * @returns true if the value was added
     */
    add(value) {
        if (!this.set.has(value)) {
            this.set.add(value);
            this.list.push(value);
            return true;
        }
        return false;
    }
    addAll(values) {
        values.forEach(this.add.bind(this));
    }
    /**
     * If the given value is in the queue, remove it.
     * The index will remain pointing to whatever it was pointing to before.
     * @param value
     * @returns true if the value was removed
     */
    remove(value) {
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
        }
        else {
            this.index %= this.list.length;
        }
        return true;
    }
    clear() {
        this.set.clear();
        this.list = [];
        this.index = 0;
    }
    /**
     * Return the current element, then advance the queue.
     * @returns the current element of the queue, or undefined if the queue is empty
     */
    next() {
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
    get() {
        return this.list[this.index];
    }
    contains(value) {
        return this.set.has(value);
    }
    size() {
        return this.list.length;
    }
    isEmpty() {
        return this.size() === 0;
    }
    toSortedArray() {
        const array = Array.from(this.set);
        array.sort();
        return array;
    }
    toString() {
        return JSON.stringify(this.toSortedArray());
    }
}
exports.CircularQueue = CircularQueue;
//# sourceMappingURL=circular-queue.js.map