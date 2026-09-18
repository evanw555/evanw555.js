
import fs from 'fs';
import { join } from 'path';

export class FileRecordStorage<T> {
    private readonly _ENCODING = 'utf8';
    private readonly _path;

    constructor(path: string) {
        if (!path.endsWith('.jsonl')) {
            throw new Error(`File record storage path \`${path}\` must end with \`.jsonl\``);
        }
        this._path = path;
    }

    async addRecord(record: T) {
        return new Promise<void>((resolve, reject) => {
            fs.appendFile(this._path, `\n${JSON.stringify(record)}`, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        })
    }

    async readRecords(): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            fs.readFile(this._path, this._ENCODING, (err, data) => {
                if (err) {
                    return reject(err);
                }
                // Split by newlines, trim, parse, and return
                const records: T[] = data.split('\n')
                    .map(r => r.trim())
                    .filter(r => r)
                    .map(r => JSON.parse(r));
                resolve(records);
            });
        });
    }

    /**
     * 
     * @param fn 
     * @returns 
     */
    async purge(fn: (record: T) => boolean): Promise<{ numPurged: number, numKept: number }> {
        const records = await this.readRecords();
        const validRecords = records.filter(fn);
        const serialized = validRecords.map(r => JSON.stringify(r)).join('\n');

        return new Promise((resolve, reject) => {
            fs.writeFile(this._path, serialized, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve({
                    numPurged: records.length - validRecords.length,
                    numKept: validRecords.length
                });
            });
        });
    }

    /**
     * Given a predicate and a transformation function, applies the transformation function
     * to the first record matched against the predicate. Only applies to one record for safety.
     * @param options.predicate Predicate function
     * @param options.transformation Transformation function
     * @returns The edited record, or undefined if none were edited
     */
    async editRecord(options: { predicate: (record: T) => boolean, transformation: (record: T) => void }): Promise<T | undefined> {
        const records = await this.readRecords();

        // Find the first one that matches and edit it in-place
        let edited: T | undefined = undefined;
        for (const record of records) {
            if (options.predicate(record)) {
                options.transformation(record);
                edited = record;
                break;
            }
        }

        // Don't write back if none were edited
        if (!edited) {
            return;
        }

        const serialized = records.map(r => JSON.stringify(r)).join('\n');

        return new Promise((resolve, reject) => {
            fs.writeFile(this._path, serialized, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve(edited);
            });
        });
    }
}