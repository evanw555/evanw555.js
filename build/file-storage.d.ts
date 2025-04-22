/// <reference types="node" />
export interface AsyncStorageInterface {
    read(id: string): Promise<string>;
    readJson(id: string): Promise<any>;
    write(id: string, value: any): Promise<void>;
}
export declare class FileStorage implements AsyncStorageInterface {
    private readonly _ENCODING;
    private readonly _basePath;
    constructor(basePath: string);
    read(id: string): Promise<string>;
    readSync(id: string): string;
    readJson(id: string): Promise<any>;
    readJsonSync(id: string): any;
    write(id: string, value: any): Promise<void>;
    /**
     * NOTE: This is still experimental and not confirmed to work.
     */
    readBlob(id: string): Promise<Buffer>;
    /**
     * NOTE: This is still experimental and not confirmed to work.
     * @returns The file path of the written BLOB (including the storage's base URL)
     */
    writeBlob(id: string, value: Buffer): Promise<string>;
    /**
     * Checks the existence of a given file.
     * @param id File to check
     * @returns True if the file with the given ID exists
     */
    exists(id: string): boolean;
}
//# sourceMappingURL=file-storage.d.ts.map