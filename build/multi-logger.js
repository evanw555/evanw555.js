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
exports.MultiLogger = exports.MultiLoggerLevel = void 0;
var MultiLoggerLevel;
(function (MultiLoggerLevel) {
    MultiLoggerLevel[MultiLoggerLevel["All"] = 0] = "All";
    MultiLoggerLevel[MultiLoggerLevel["Trace"] = 1] = "Trace";
    MultiLoggerLevel[MultiLoggerLevel["Debug"] = 2] = "Debug";
    MultiLoggerLevel[MultiLoggerLevel["Info"] = 3] = "Info";
    MultiLoggerLevel[MultiLoggerLevel["Warn"] = 4] = "Warn";
    MultiLoggerLevel[MultiLoggerLevel["Error"] = 5] = "Error";
    MultiLoggerLevel[MultiLoggerLevel["Fatal"] = 6] = "Fatal";
    MultiLoggerLevel[MultiLoggerLevel["Off"] = 7] = "Off";
})(MultiLoggerLevel = exports.MultiLoggerLevel || (exports.MultiLoggerLevel = {}));
/**
 * Unified logger for logging to multiple destinations.
 */
class MultiLogger {
    constructor(options) {
        var _a, _b, _c;
        this.outputs = [];
        this.maxLength = (_a = options === null || options === void 0 ? void 0 : options.maxLength) !== null && _a !== void 0 ? _a : 1990; // Discord's limit is 2000
        this.defaultLoggerLevel = (_b = options === null || options === void 0 ? void 0 : options.defaultLoggerLevel) !== null && _b !== void 0 ? _b : MultiLoggerLevel.All;
        this.defaultLogLevel = (_c = options === null || options === void 0 ? void 0 : options.defaultLogLevel) !== null && _c !== void 0 ? _c : MultiLoggerLevel.Off;
    }
    addOutput(output, level = this.defaultLoggerLevel) {
        this.outputs.push({ output, level });
    }
    log(text, level = this.defaultLogLevel) {
        return __awaiter(this, void 0, void 0, function* () {
            // Truncate text if necessary
            if (text.length > this.maxLength) {
                text = text.substring(0, this.maxLength) + '...';
            }
            // Send the text to each output
            for (const entry of this.outputs) {
                if (level >= entry.level) {
                    try {
                        yield entry.output(text);
                    }
                    catch (err) {
                        // TODO: Should we do something rather than failing silently?
                    }
                }
            }
        });
    }
}
exports.MultiLogger = MultiLogger;
//# sourceMappingURL=multi-logger.js.map