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
}
//# sourceMappingURL=file-record-storage.d.ts.map