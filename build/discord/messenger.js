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
    /**
     * @param options.alwaysImmediate If true, then every message sent with this messenger will be immediate (no typing delay)
     */
    constructor(options) {
        var _a;
        this._busy = false;
        this._backlog = [];
        this._alwaysImmediate = (_a = options === null || options === void 0 ? void 0 : options.alwaysImmediate) !== null && _a !== void 0 ? _a : false;
    }
    setLogger(logger) {
        this.logger = logger;
    }
    setMemberResolver(memberResolver) {
        this.memberResolver = memberResolver;
    }
    /**
     * Sends a message payload to the specified text channel.
     * @param channel Channel to send this message payload to
     * @param payload Message payload to send
     * @param options Options to control how this payload is sent
     * @returns The sent message object if it was successful, else undefined
     */
    send(channel, payload, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._send({ channel, payload, options });
        });
    }
    /**
     * Sends a list of message payloads to the specified text channel in the order that they're provided.
     * @param channel Channel to send these message payloads to
     * @param payloads List of message payloads to send (in order)
     * @param options Options to control how these payloads are sent
     * @returns List of message objects sent successfully to the target channel
     */
    sendAll(channel, payloads, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = [];
            for (const payload of payloads) {
                const message = yield this.send(channel, payload, options);
                // Only add this message to the list if it sent successfully
                if (message) {
                    messages.push(message);
                }
            }
            return messages;
        });
    }
    /**
     * Sends a message payload as a reply to some provided message.
     * @param message Message to which the payload is sent as a reply
     * @param payload Message payload to send
     * @param options Options to control how this payload is sent
     * @returns The sent message object if it was successful, else undefined
     */
    reply(message, payload, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._send({ channel: message.channel, message, payload, options });
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
    /**
     * Sends a message payload to the specified guild member's DMs.
     * @param member The guild member (or the ID of the guild member) to DM this message payload to
     * @param payload The message payload to send
     * @param options Options to control how this payload is sent
     * @returns The sent message object if it was successful, else undefined
     */
    dm(member, payload, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const resolvedMember = yield this._resolveMember(member);
                const dmChannel = yield resolvedMember.createDM();
                return yield this._send({ channel: dmChannel, payload, options });
            }
            catch (err) {
                this.log(`Unable to send DM via \`Messenger.dm\`: \`${err}\``);
            }
        });
    }
    /**
     * Sends a list of message payloads to the specified guild member's DMs in the order that they're provided.
     * @param member The guild member (or the ID of the guild member) to DM these message payloads to
     * @param payloads List of message payloads to send (in order)
     * @param options Options to control how these payloads are sent
     * @returns List of message objects sent successfully to the target channel
     */
    dmAll(member, payloads, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = [];
            for (const payload of payloads) {
                const message = yield this.dm(member, payload, options);
                // Only add this message to the list if it sent successfully
                if (message) {
                    messages.push(message);
                }
            }
            return messages;
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
                    let result = undefined;
                    try {
                        // Unless the options specify to send immediately, add an artificial delay
                        const immediate = ((_a = entry.options) === null || _a === void 0 ? void 0 : _a.immediate) || this._alwaysImmediate;
                        if (!immediate) {
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
                            result = yield message.reply(payload);
                        }
                        else {
                            result = yield channel.send(payload);
                        }
                    }
                    catch (err) {
                        this.log(`Failed to send message: \`${err}\``);
                    }
                    // Resolve the promise for this message
                    if (resolve) {
                        resolve(result);
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