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
exports.FileStorage = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
class FileStorage {
    constructor(basePath) {
        this._ENCODING = 'utf8';
        this._basePath = basePath;
    }
    read(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs_1.default.readFile((0, path_1.join)(this._basePath, id), this._ENCODING, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        });
    }
    readSync(id) {
        return fs_1.default.readFileSync((0, path_1.join)(this._basePath, id), this._ENCODING);
    }
    readJson(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return JSON.parse(yield this.read(id));
        });
    }
    readJsonSync(id) {
        return JSON.parse(this.readSync(id));
    }
    write(id, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs_1.default.writeFile((0, path_1.join)(this._basePath, id), value.toString(), (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        });
    }
    /**
     * NOTE: This is still experimental and not confirmed to work.
     */
    readBlob(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs_1.default.readFile((0, path_1.join)(this._basePath, id), (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        });
    }
    /**
     * NOTE: This is still experimental and not confirmed to work.
     * @returns The file path of the written BLOB (including the storage's base URL)
     */
    writeBlob(id, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = (0, path_1.join)(this._basePath, id);
            return new Promise((resolve, reject) => {
                fs_1.default.writeFile(filePath, value, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(filePath);
                });
            });
        });
    }
    /**
     * Checks the existence of a given file.
     * @param id File to check
     * @returns True if the file with the given ID exists
     */
    exists(id) {
        return fs_1.default.existsSync((0, path_1.join)(this._basePath, id));
    }
}
exports.FileStorage = FileStorage;
//# sourceMappingURL=file-storage.js.map