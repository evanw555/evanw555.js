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
exports.Messenger = void 0;
const discord_js_1 = require("discord.js");
const random_1 = require("../utils/random");
const time_1 = require("../utils/time");
class Messenger {
    constructor() {
        this._busy = false;
        this._backlog = [];
    }
    setLogger(logger) {
        this.logger = logger;
    }
    setMemberResolver(memberResolver) {
        this.memberResolver = memberResolver;
    }
    send(channel, payload, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._send({ channel, payload, options });
        });
    }
    reply(message, payload, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._send({ channel: message.channel, message, payload, options });
        });
    }
    _resolveMember(member) {
        return __awaiter(this, void 0, void 0, function* () {
            if (member instanceof discord_js_1.GuildMember) {
                return member;
            }
            else if (typeof member === 'string') {
                if (this.memberResolver) {
                    try {
                        return yield this.memberResolver(member);
                    }
                    catch (err) {
                        throw new Error(`Unable to resolve member with ID ${member}: ${err}`);
                    }
                }
                else {
                    throw new Error('No memberResolver set');
                }
            }
            else {
                throw new Error(`Expected member argument to be GuildMember or Snowflake but found ${member}`);
            }
        });
    }
    dm(member, payload, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const resolvedMember = yield this._resolveMember(member);
                const dmChannel = yield resolvedMember.createDM();
                yield this._send({ channel: dmChannel, payload, options });
            }
            catch (err) {
                this.log(`Unable to send DM via \`Messenger.dm\`: \`${err}\``);
            }
        });
    }
    _send(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                entry.resolve = resolve;
                yield this._processEntry(entry);
            }));
        });
    }
    _processEntry(entry) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._busy) {
                // If the messenger isn't typing/waiting/sending, then go ahead and process the message now
                this._busy = true;
                this._backlog.push(entry);
                while (this._backlog.length > 0) {
                    const { channel, message, payload, resolve } = this._backlog.shift();
                    try {
                        // Unless the options specify to send immediately, add an artificial delay
                        if (!((_a = entry.options) === null || _a === void 0 ? void 0 : _a.immediate)) {
                            // Take a brief pause
                            yield (0, time_1.sleep)((0, random_1.randInt)(100, 1500));
                            // Send the typing event and wait a bit
                            try {
                                yield channel.sendTyping();
                                yield (0, time_1.sleep)(this.getTypingDuration(payload));
                            }
                            catch (err) {
                                // Typing events are non-critical, so allow them to fail silently...
                            }
                        }
                        // Now actually reply/send the message
                        if (message) {
                            yield message.reply(payload);
                        }
                        else {
                            yield channel.send(payload);
                        }
                    }
                    catch (err) {
                        this.log(`Failed to send message: \`${err}\``);
                    }
                    // Resolve the promise for this message
                    if (resolve) {
                        resolve();
                    }
                    else {
                        this.log(`No resolve function found for messenger backlog entry to ${channel}`);
                    }
                }
                this._busy = false;
            }
            else {
                // If the messenger is busy, just add the info to the backlog and let the active thread send it when it's done
                this._backlog.push(entry);
            }
        });
    }
    /**
     * TODO: do this better. De-dup logic.
     */
    sendAndGet(channel, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            // Take a brief pause
            yield (0, time_1.sleep)((0, random_1.randInt)(100, 1500));
            // Send the typing event and wait a bit
            try {
                yield channel.sendTyping();
                yield (0, time_1.sleep)(this.getTypingDuration(payload));
            }
            catch (err) {
                // Typing events are non-critical, so allow them to fail silently...
            }
            // Now actually reply/send the message
            return channel.send(payload);
        });
    }
    /**
     * Send the provided text as a series of boxed (monospaced) messages limited to no more than 2000 characters each.
     * @param channel the target channel
     * @param text the text to send
     */
    sendLargeMonospaced(channel, text) {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = text.split('\n');
            let buffer = '';
            let segmentIndex = 0;
            while (lines.length !== 0) {
                const prefix = buffer ? '\n' : '';
                buffer += prefix + lines.shift();
                if (lines.length === 0 || buffer.length + lines[0].length > 1990) {
                    try {
                        yield channel.send(`\`\`\`${buffer}\`\`\``);
                    }
                    catch (err) {
                        yield channel.send(`Failed sending segment **${segmentIndex}**`);
                    }
                    buffer = '';
                    segmentIndex++;
                }
            }
        });
    }
    log(text) {
        if (this.logger) {
            this.logger(text);
        }
    }
    /**
     * @param content the message payload
     * @returns The "typing" duration in milliseconds for this payload
     */
    getTypingDuration(payload) {
        var _a, _b, _c, _d, _e, _f;
        let contentLength = 0;
        if (typeof payload === 'string') {
            contentLength += payload.length;
        }
        else {
            contentLength += (_b = (_a = payload.content) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
            // Each embed is treated as 10 characters
            contentLength += ((_d = (_c = payload.embeds) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) * 10;
            // Each file is treated as 20 characters
            contentLength += ((_f = (_e = payload.files) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0) * 20;
        }
        // Calculate the typing duration using the length of the message, but cap it at Discord's max typing duration
        return Math.min((0, random_1.randInt)(45, 55) * contentLength, Messenger.MAX_TYPING_DURATION);
    }
}
exports.Messenger = Messenger;
// The Discord API will automatically stop typing events after 10 seconds
Messenger.MAX_TYPING_DURATION = 10000;
//# sourceMappingURL=messenger.js.map