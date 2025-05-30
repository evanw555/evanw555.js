import fs from 'fs';
import { join } from 'path';

export interface AsyncStorageInterface {
    read(id: string): Promise<string>
    readJson(id: string): Promise<any>
    write(id: string, value: any): Promise<void>
}

export class FileStorage implements AsyncStorageInterface {
    private readonly _ENCODING = 'utf8';
    private readonly _basePath: string;

    constructor(basePath: string) {
        this._basePath = basePath;
    }

    async read(id: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(join(this._basePath, id), this._ENCODING, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    readSync(id: string): string {
        return fs.readFileSync(join(this._basePath, id), this._ENCODING);
    }

    async readJson(id: string): Promise<any> {
        return JSON.parse(await this.read(id));
    }

    readJsonSync(id: string): any {
        return JSON.parse(this.readSync(id));
    }

    async write(id: string, value: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(join(this._basePath, id), value.toString(), (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    /**
     * NOTE: This is still experimental and not confirmed to work.
     */
    async readBlob(id: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            fs.readFile(join(this._basePath, id), (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    /**
     * NOTE: This is still experimental and not confirmed to work.
     * @returns The file path of the written BLOB (including the storage's base URL)
     */
    async writeBlob(id: string, value: Buffer): Promise<string> {
        const filePath = join(this._basePath, id);
        return new Promise<string>((resolve, reject) => {
            fs.writeFile(filePath, value, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve(filePath);
            });
        });
    }

    /**
     * Checks the existence of a given file.
     * @param id File to check
     * @returns True if the file with the given ID exists
     */
    exists(id: string): boolean {
        return fs.existsSync(join(this._basePath, id));
    }
}
