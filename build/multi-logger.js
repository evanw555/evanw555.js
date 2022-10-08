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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiLogger = void 0;
/**
 * Unified logger for logging to multiple destinations.
 */
class MultiLogger {
    constructor(options) {
        var _a;
        this.outputs = [];
        this.maxLength = (_a = options === null || options === void 0 ? void 0 : options.maxLength) !== null && _a !== void 0 ? _a : 1990; // Discord's limit is 2000
    }
    addOutput(output) {
        this.outputs.push(output);
    }
    log(text) {
        return __awaiter(this, void 0, void 0, function* () {
            // Truncate text if necessary
            if (text.length > this.maxLength) {
                text = text.substring(0, this.maxLength) + '...';
            }
            // Send the text to each output
            for (const output of this.outputs) {
                try {
                    yield output(text);
                }
                catch (err) {
                    // TODO: Should we do something rather than failing silently?
                }
            }
        });
    }
}
exports.MultiLogger = MultiLogger;
//# sourceMappingURL=multi-logger.js.map