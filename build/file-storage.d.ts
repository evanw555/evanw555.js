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
}
//# sourceMappingURL=file-storage.d.ts.map