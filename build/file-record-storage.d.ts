export declare class FileRecordStorage<T> {
    private readonly _ENCODING;
    private readonly _path;
    constructor(path: string);
    addRecord(record: T): Promise<void>;
    readRecords(): Promise<T[]>;
    /**
     *
     * @param fn
     * @returns
     */
    purge(fn: (record: T) => boolean): Promise<{
        numPurged: number;
        numKept: number;
    }>;
    /**
     * Given a predicate and a transformation function, applies the transformation function
     * to the first record matched against the predicate. Only applies to one record for safety.
     * @param options.predicate Predicate function
     * @param options.transformation Transformation function
     * @returns The edited record, or undefined if none were edited
     */
    editRecord(options: {
        predicate: (record: T) => boolean;
        transformation: (record: T) => void;
    }): Promise<T | undefined>;
}
//# sourceMappingURL=file-record-storage.d.ts.map