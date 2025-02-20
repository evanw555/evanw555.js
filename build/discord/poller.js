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
exports.Poller = void 0;
const discord_js_1 = require("discord.js");
const timeout_manager_1 = require("../timeout-manager");
const discord_1 = require("../utils/discord");
const random_1 = require("../utils/random");
const time_1 = require("../utils/time");
const collections_1 = require("../utils/collections");
// TODO: This implementation is incomplete
class Poller {
    constructor(storage, channelResolver, pollCompletionCallback) {
        const timeoutCallbacks = {
            nominationEnd: this.onNominationEnd,
            pollEnd: this.onPollEnd,
            pollReminder: this.onPollReminder
        };
        this.timeoutManager = new timeout_manager_1.TimeoutManager(storage, timeoutCallbacks, { fileName: 'discord-poller.json' });
        this.channelResolver = channelResolver;
        this.pollCompletionCallback = pollCompletionCallback;
    }
    schedulePollWithNominations(id, channel, pollStart, pollEnd) {
        return __awaiter(this, void 0, void 0, function* () {
            const nominationMessage = yield channel.send('Starting poll! TODO');
            const data = {
                id,
                channelId: channel.id,
                pollStartTime: pollStart.getTime(),
                pollEndTime: pollEnd.getTime(),
                header: 'SOME HEADER',
                prompt: 'SOME PROMPT',
                nominationMessageId: nominationMessage.id
            };
            yield this.timeoutManager.registerTimeout('nominationEnd', pollStart, { pastStrategy: timeout_manager_1.PastTimeoutStrategy.Invoke, arg: data });
        });
    }
    startPoll(choiceValues, data, target) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Construct poll data
            const choiceKeys = (0, discord_1.getPollChoiceKeys)(choiceValues);
            const choices = (0, collections_1.toMap)(choiceKeys, choiceValues);
            const renderedChoices = choiceKeys.map(key => `${key} ${choices[key]}`).join('\n');
            const messageText = `${data.header}\n_${data.prompt}_\n`
                + `${renderedChoices}\n`
                + `(Poll ends **${(0, time_1.getRelativeDateTimeString)(new Date(data.pollEndTime))}**)`;
            // Send out poll message
            let pollMessage;
            if (target instanceof discord_js_1.Message) {
                pollMessage = yield target.reply(messageText);
            }
            else {
                pollMessage = yield target.send(messageText);
            }
            data.pollData = {
                choices,
                messageId: pollMessage.id
            };
            // Schedule the poll timeout
            yield this.timeoutManager.registerTimeout('pollEnd', new Date(data.pollEndTime), { pastStrategy: timeout_manager_1.PastTimeoutStrategy.Invoke, arg: data });
            // Prime the reactions with all valid options
            yield (0, discord_1.addReactsSync)(pollMessage, choiceKeys);
            if ((_a = data.options) === null || _a === void 0 ? void 0 : _a.sendReminder) {
                // TODO: Should we provide the "along" value as an option rather than hardcoding it?
                const reminderDate = (0, time_1.getDateBetween)(new Date(data.pollStartTime), new Date(data.pollEndTime), 0.8);
                yield this.timeoutManager.registerTimeout('pollReminder', new Date(data.pollEndTime), { pastStrategy: timeout_manager_1.PastTimeoutStrategy.Invoke, arg: data });
            }
        });
    }
    onNominationEnd(data) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield this.channelResolver(data.channelId);
            if (!data.nominationMessageId) {
                throw new Error('No nomination message ID!');
            }
            const nominationMessage = yield channel.messages.fetch(data.nominationMessageId);
            // Construct the set of proposed submission types by fetching replies to the original FYI message
            let proposalSet = new Set();
            const messages = yield channel.messages.fetch({ after: nominationMessage.id });
            for (const message of messages.toJSON()) {
                if (((_a = message.reference) === null || _a === void 0 ? void 0 : _a.messageId) === nominationMessage.id) {
                    proposalSet.add(message.content.trim().toLowerCase());
                }
            }
            // If there are no proposed alternatives, so abort the entire process!
            if (proposalSet.size === 0) {
                // TODO: What to do here?
                return;
            }
            // If there are too many, trim it down to 10
            // TODO: Make this configurable?
            const maxAlternatives = 10;
            if (proposalSet.size > maxAlternatives) {
                // await logger.log(`Too many anonymous submission type proposals, truncating from **${proposalSet.size}** to **${maxAlternatives}**`);
                proposalSet = new Set(Array.from(proposalSet).slice(0, maxAlternatives));
            }
            // Add the original proposed prompt
            // TODO: Support for pre-loaded choices?
            // if (event.submissionType) {
            //     proposalSet.add(event.submissionType);
            // }
            // Shuffle all the prompts
            const choiceValues = Array.from(proposalSet);
            // TODO: Option for shuffling choice values?
            (0, random_1.shuffle)(choiceValues);
            yield this.startPoll(choiceValues, data, nominationMessage);
        });
    }
    onPollEnd(data) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield this.channelResolver(data.channelId);
            if (!data.pollData) {
                throw new Error('No poll data!');
            }
            const pollMessage = yield channel.messages.fetch(data.pollData.messageId);
            // Determine the winner(s) of the poll
            let maxVotes = -1;
            let winningChoices = [];
            for (const key of Object.keys(data.pollData.choices)) {
                const choice = data.pollData.choices[key];
                const votes = (_b = (_a = pollMessage.reactions.cache.get(key)) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0;
                if (votes > maxVotes) {
                    maxVotes = votes;
                    winningChoices = [choice];
                }
                else if (votes == maxVotes) {
                    winningChoices.push(choice);
                }
            }
            if (winningChoices.length > 1) {
                // Construct the new poll data and start the poll
                const runoffData = {
                    id: data.id,
                    channelId: data.channelId,
                    pollStartTime: data.pollEndTime,
                    pollEndTime: new Date(2 * data.pollEndTime - data.pollStartTime).getTime(),
                    header: `There was a tie between **${winningChoices.length}** choices! Please vote again:`,
                    prompt: data.prompt,
                    options: data.options
                };
                yield this.startPoll(winningChoices, runoffData, pollMessage);
            }
            else if (winningChoices.length === 1) {
                // Trigger poll winning logic
                yield this.pollCompletionCallback(data.id, winningChoices, pollMessage);
            }
            else {
                // No winners?
                yield pollMessage.reply('There were no winners for this poll somehow! Damn...');
            }
        });
    }
    onPollReminder(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield this.channelResolver(data.channelId);
            if (!data.pollData) {
                throw new Error('No poll data!');
            }
            const pollMessage = yield channel.messages.fetch(data.pollData.messageId);
            yield pollMessage.reply('There\'s still time to vote!');
        });
    }
}
exports.Poller = Poller;
//# sourceMappingURL=poller.js.map