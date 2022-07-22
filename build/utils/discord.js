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
exports.deleteMessagesBeforeMessage = exports.findLatestMessageBeforeDate = exports.sendLargeMonospaced = exports.getJoinedMentions = void 0;
const misc_1 = require("./misc");
const time_1 = require("./time");
function getJoinedMentions(userIds, conjunction = 'and') {
    return (0, misc_1.naturalJoin)(userIds.map(userId => `<@${userId}>`), conjunction);
}
exports.getJoinedMentions = getJoinedMentions;
/**
 * Send the provided text as a series of boxed (monospaced) messages limited to no more than 2000 characters each.
 * @param channel the target channel
 * @param text the text to send
 */
function sendLargeMonospaced(channel, text) {
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
exports.sendLargeMonospaced = sendLargeMonospaced;
/**
 * For some text channel, fetch the most recent message before some specified date.
 * @param channel the text channel in which to search
 * @param date the specified date
 * @param options.batchSize how many messages to fetch per batch
 * @returns the message fitting this criteria, or undefined if none exist
 */
function findLatestMessageBeforeDate(channel, date, options) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const batchSize = (_a = options === null || options === void 0 ? void 0 : options.batchSize) !== null && _a !== void 0 ? _a : 25;
        let beforeMessageId = undefined;
        while (true) {
            const options = { limit: batchSize };
            if (beforeMessageId) {
                options.before = beforeMessageId;
            }
            const messages = yield channel.messages.fetch(options);
            console.log(`Fetched ${messages.size} messages`);
            messages.sort((x, y) => x.createdTimestamp - y.createdTimestamp);
            if (messages.size === 0) {
                return undefined;
            }
            const earliestMessage = messages.first();
            // If the earliest message if still after the specified date, query messages before this
            if (earliestMessage.createdAt.getTime() >= date.getTime()) {
                beforeMessageId = earliestMessage.id;
                console.log(`Earliest message sent by ${earliestMessage.author.username} on ${earliestMessage.createdAt.toLocaleString()} is still after the target date, querying more...`);
                continue;
            }
            console.log(`Earliest message sent by ${earliestMessage.author.username} on ${earliestMessage.createdAt.toLocaleString()} is before the target date, navigating...`);
            // Find the first message after the specified date and return the one before that
            for (let i = 1; i < messages.size; i++) {
                const message = messages.at(i);
                if (message.createdAt.getTime() >= date.getTime()) {
                    return messages.at(i - 1);
                }
                console.log(`Navigating: ${message.createdAt.toLocaleString()} by ${message.author.username}`);
            }
            // If none are after the specified date, just return the last one (which is the one right before the earliest of the previous query)
            return messages.last();
        }
    });
}
exports.findLatestMessageBeforeDate = findLatestMessageBeforeDate;
/**
 * For some text channel, delete all messages predating some particular message specified by a provided ID.
 * @param channel the channel in which to delete messages
 * @param messageId the ID of the message before which all messages should be deleted
 * @param options.batchSize how many messages to fetch per batch
 * @param options.delay how many milliseconds to delay between each message deletion operation
 * @returns how many messages were deleted by this operation
 */
function deleteMessagesBeforeMessage(channel, messageId, options) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const batchSize = (_a = options === null || options === void 0 ? void 0 : options.batchSize) !== null && _a !== void 0 ? _a : 50;
        const delay = (_b = options === null || options === void 0 ? void 0 : options.delay) !== null && _b !== void 0 ? _b : 1000;
        let numMessagesDeleted = 0;
        while (true) {
            const messages = yield channel.messages.fetch({ limit: batchSize, before: messageId });
            if (messages.size === 0) {
                console.log('Found no more messages to delete.');
                return numMessagesDeleted;
            }
            console.log(`Found ${messages.size} messages, deleting all...`);
            for (let message of messages.values()) {
                yield message.delete();
                numMessagesDeleted++;
                process.stdout.write('.');
                yield (0, time_1.sleep)(delay);
            }
            process.stdout.write('✔️\n');
        }
    });
}
exports.deleteMessagesBeforeMessage = deleteMessagesBeforeMessage;
//# sourceMappingURL=discord.js.map