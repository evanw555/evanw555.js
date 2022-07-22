"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadJson = void 0;
const file_storage_1 = require("../file-storage");
const rootStorage = new file_storage_1.FileStorage('./');
/**
 * Synchronously load the JSON file at a given file path, relative to the root of the Node runtime.
 */
function loadJson(path) {
    return rootStorage.readJsonSync(path);
}
exports.loadJson = loadJson;
;
//# sourceMappingURL=load-json.js.map