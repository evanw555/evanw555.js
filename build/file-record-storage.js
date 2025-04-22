"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRecordStorage = void 0;
const fs_1 = __importDefault(require("fs"));
class FileRecordStorage {
    constructor(path) {
        this._ENCODING = 'utf8';
        if (!path.endsWith('.jsonl')) {
            throw new Error(`File record storage path \`${path}\` must end with \`.jsonl\``);
        }
        this._path = path;
    }
    addRecord(record) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs_1.default.appendFile(this._path, `\n${JSON.stringify(record)}`, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        });
    }
    readRecords() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs_1.default.readFile(this._path, this._ENCODING, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    // Split by newlines, trim, parse, and return
                    const records = data.split('\n')
                        .map(r => r.trim())
                        .filter(r => r)
                        .map(r => JSON.parse(r));
                    resolve(records);
                });
            });
        });
    }
    /**
     *
     * @param fn
     * @returns
     */
    purge(fn) {
        return __awaiter(this, void 0, void 0, function* () {
            const records = yield this.readRecords();
            const validRecords = records.filter(fn);
            const serialized = validRecords.map(r => JSON.stringify(r)).join('\n');
            return new Promise((resolve, reject) => {
                fs_1.default.writeFile(this._path, serialized, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve({
                        numPurged: records.length - validRecords.length,
                        numKept: validRecords.length
                    });
                });
            });
        });
    }
}
exports.FileRecordStorage = FileRecordStorage;
//# sourceMappingURL=file-record-storage.js.map