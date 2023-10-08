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
exports.addReactsSync = exports.getPollChoiceKeys = exports.deleteMessagesBeforeMessage = exports.forEachMessage = exports.countMessagesSinceDate = exports.findLatestMessageBeforeDate = exports.sendLargeMonospaced = exports.getJoinedMentions = exports.toDiscordTimestamp = exports.DiscordTimestampFormat = void 0;
const misc_1 = require("./misc");
const random_1 = require("./random");
const time_1 = require("./time");
var DiscordTimestampFormat;
(function (DiscordTimestampFormat) {
    DiscordTimestampFormat["ShortTime"] = "t";
    DiscordTimestampFormat["LongTime"] = "T";
    DiscordTimestampFormat["ShortDate"] = "d";
    DiscordTimestampFormat["LongDate"] = "D";
    DiscordTimestampFormat["ShortDateTime"] = "f";
    DiscordTimestampFormat["LongDateTime"] = "F";
    DiscordTimestampFormat["Relative"] = "R";
})(DiscordTimestampFormat = exports.DiscordTimestampFormat || (exports.DiscordTimestampFormat = {}));
;
/**
 * Given some date/time, returns a Discord timestamp string in some particular format.
 * @param date The provided date
 * @param format The format of the output timestamp
 * @returns Discord timestamp string
 */
function toDiscordTimestamp(date, format = DiscordTimestampFormat.ShortDateTime) {
    return `<t:${Math.round(date.getTime() / 1000)}:${format}>`;
}
exports.toDiscordTimestamp = toDiscordTimestamp;
function getJoinedMentions(userIds, conjunction = 'and') {
    return (0, misc_1.naturalJoin)(userIds.map(userId => `<@${userId}>`), { conjunction });
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
 * For some text channel, count the messages since some specified date.
 * @param channel the text channel in which to count
 * @param date the specified date
 * @param options.batchSize how many messages to fetch per batch
 * @returns the number of messages in the channel since the specified date
 */
function countMessagesSinceDate(channel, date, options) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const batchSize = (_a = options === null || options === void 0 ? void 0 : options.batchSize) !== null && _a !== void 0 ? _a : 25;
        let count = 0;
        let beforeMessageId = undefined;
        while (true) {
            const options = { limit: batchSize };
            if (beforeMessageId) {
                options.before = beforeMessageId;
            }
            const messages = yield channel.messages.fetch(options);
            messages.sort((x, y) => x.createdTimestamp - y.createdTimestamp);
            if (messages.size === 0) {
                return count;
            }
            const earliestMessage = messages.first();
            // If the earliest message if still after the specified date, query messages before this
            if (earliestMessage.createdAt.getTime() >= date.getTime()) {
                beforeMessageId = earliestMessage.id;
                count += messages.size;
                continue;
            }
            // Count all messages from latest to earliest until one is found before the date, then return the total count
            for (let i = messages.size - 1; i >= 0; i--) {
                const message = messages.at(i);
                if (message.createdAt.getTime() < date.getTime()) {
                    return count;
                }
                count++;
            }
            // If none are before the specified date (this shouldn't happen), then just return the count
            return count;
        }
    });
}
exports.countMessagesSinceDate = countMessagesSinceDate;
/**
 * For some text channel, perform a callback for each message in the channel, starting with newest messages first.
 * @param channel the text channel in which to count
 * @param callback function to perform for each message
 * @param options.batchSize how many messages to fetch per batch
 * @param options.count how many messages to visit total
 */
function forEachMessage(channel, callback, options) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const batchSize = (_a = options === null || options === void 0 ? void 0 : options.batchSize) !== null && _a !== void 0 ? _a : 25;
        let messagesRemaining = (_b = options === null || options === void 0 ? void 0 : options.count) !== null && _b !== void 0 ? _b : Number.MAX_SAFE_INTEGER;
        let beforeMessageId = undefined;
        while (true) {
            const options = { limit: batchSize };
            if (beforeMessageId) {
                options.before = beforeMessageId;
            }
            const messages = yield channel.messages.fetch(options);
            // Sort the messages from oldest to newest
            messages.sort((x, y) => x.createdTimestamp - y.createdTimestamp);
            if (messages.size === 0) {
                return;
            }
            // The oldest message in this batch will be used as the "earliest message" in the next batch
            const earliestMessage = messages.first();
            beforeMessageId = earliestMessage.id;
            // Invoke the callback for each message from newest to oldest
            for (const message of messages.toJSON().reverse()) {
                yield callback(message);
                // Count down and return if we've reached the total count
                messagesRemaining--;
                if (messagesRemaining <= 0) {
                    return;
                }
            }
        }
    });
}
exports.forEachMessage = forEachMessage;
/**
 * For some text channel, delete all messages predating some particular message specified by a provided ID.
 * @param channel the channel in which to delete messages
 * @param messageId the ID of the message before which all messages should be deleted
 * @param options.batchSize how many messages to fetch per batch
 * @param options.delay how many milliseconds to delay between each message deletion operation
 * @param options.beforeDelete some callback to invoke immediately before deleting a message
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
                if (options === null || options === void 0 ? void 0 : options.beforeDelete) {
                    yield options.beforeDelete(message);
                }
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
/**
 * For a list of poll choice values, return an appropriate list of choice key emojis corresponding to the value list.
 * Note: the overrides option only applies to keys (or consecutive keys) at the beginning or end of the list.
 *
 * @param choices list of poll choice values
 * @param options.overrides a of poll choice keys that can be used if a particular choice value is encountered
 * @param options.avoidNumbers if true, then simple in-order numbers won't ever be returned
 * @returns list of choice key emojis corresponding to the provided choice values
 */
function getPollChoiceKeys(choices, options) {
    const n = choices.length;
    // Recursively handle overrides
    // TODO: Can we handle overrides for a key that's not first or last?
    if (options === null || options === void 0 ? void 0 : options.overrides) {
        // Override the first choice key
        const firstKey = choices[0];
        if (firstKey in options.overrides) {
            return [(0, random_1.randChoice)(...options.overrides[firstKey]), ...getPollChoiceKeys(choices.slice(1), options)];
        }
        // Override the last choice key
        const lastKey = choices[n - 1];
        if (lastKey in options.overrides) {
            return [...getPollChoiceKeys(choices.slice(0, -1), options), (0, random_1.randChoice)(...options.overrides[lastKey])];
        }
    }
    // Specially handle 2-choice polls
    if (n === 2) {
        if (choices[0].toLowerCase() === 'yes' && choices[1].toLowerCase() === 'no') {
            return (0, random_1.randChoice)(['✅', '❌'], ['👍', '👎']);
        }
        else {
            return (0, random_1.randChoice)(['🅰️', '🅱️'], (0, random_1.shuffle)(['🏳️', '🏴']));
        }
    }
    // If there are 10 or fewer options, just return numbers with a 10% chance
    if (n <= 10 && !(options === null || options === void 0 ? void 0 : options.avoidNumbers) && (0, random_1.chance)(0.1)) {
        // Keep numbers in order
        return ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'].slice(0, n);
    }
    // For all other cases, just shuffle some array of symbols and slice it
    if (n === 3) {
        return (0, random_1.shuffle)((0, random_1.randChoice)(['🔴', '⚫', '⚪'], ['🏴', '🏳️', '🏁'], ['🟥', '🟨', '🟦']));
    }
    else if (n === 4) {
        return (0, random_1.shuffle)((0, random_1.randChoice)(['♠️', '♥️', '♦️', '♣️'], ['⬆️', '⬇️', '⬅️', '➡️'], ['➕', '➖', '✖️', '➗'], ['🟥', '🟨', '🟦', '🟩']));
    }
    else if (n <= 9) {
        // Keep colors in order
        return ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪'].slice(0, n);
    }
    else if (n <= 20) {
        // Slice to the right size
        return (0, random_1.shuffle)(['🍒', '🍉', '🍌', '🍎', '🥕', '🏐', '🏀', '🏈', '🌲', '🎱', '🎲', '💎', '💰', '🪐', '☘️', '🌻', '🍄', '🌎', '🌙', '🔥']).slice(0, n);
    }
    else {
        throw new Error('Cannot have more than 20 poll choices!');
    }
}
exports.getPollChoiceKeys = getPollChoiceKeys;
/**
 * Adds the list of reacts in-order, taking a delay between each.
 * Handles failures gracefully by extending the delay between each react.
 *
 * @param message the message to which we are reacting
 * @param reacts the ordered list of emojis to react with
 * @param options.delay the base delay between each message (will grow on failure)
 * @param options.retries number of failed reacts to allow before aborting with an error
 */
function addReactsSync(message, reacts, options) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let delay = (_a = options === null || options === void 0 ? void 0 : options.delay) !== null && _a !== void 0 ? _a : 1000;
        let retriesLeft = (_b = options === null || options === void 0 ? void 0 : options.retries) !== null && _b !== void 0 ? _b : 3;
        // Add all emojis to the queue
        const queue = [];
        queue.push(...reacts);
        // For each emoji in the queue, attempt to react to the message with it
        while (queue.length > 0) {
            const react = queue[0];
            yield (0, time_1.sleep)(delay);
            try {
                yield message.react(react);
            }
            catch (err) {
                // If the react failed, increase the delay, consume one retry, and try again
                delay = Math.floor(delay * 1.5);
                retriesLeft--;
                if (retriesLeft === 0) {
                    throw new Error(`Ran out of retries while adding reacts to message, aborting: \`${err}\``);
                }
                continue;
            }
            queue.shift();
        }
    });
}
exports.addReactsSync = addReactsSync;
//# sourceMappingURL=discord.js.map