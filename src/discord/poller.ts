import { Message, Snowflake, TextChannel } from "discord.js";
import { AsyncStorageInterface } from "../file-storage";
import { PastTimeoutStrategy, TimeoutManager } from "../timeout-manager";
import { addReactsSync, getPollChoiceKeys } from "../utils/discord";
import { toMap } from "../utils/misc";
import { shuffle } from "../utils/random";
import { getDateBetween, getRelativeDateTimeString } from "../utils/time";

type PollerTimeoutTypes = 'nominationEnd' | 'pollEnd' | 'pollReminder';
type ChannelResolver = (channelId: Snowflake) => Promise<TextChannel>;
type PollCompletionCallback = (id: string, winners: string[], pollMessage: Message) => Promise<void>;

interface PollerTimeoutData {
    id: string,
    channelId: Snowflake,
    pollStartTime: number,
    pollEndTime: number,
    header: string,
    prompt: string
    nominationMessageId?: Snowflake,
    pollData?: {
        messageId: Snowflake,
        choices: Record<string, string>
    }
    options?: {
        sendReminder?: boolean
    }
}

// TODO: This implementation is incomplete
export class Poller {
    private readonly timeoutManager: TimeoutManager<PollerTimeoutTypes>;
    private readonly channelResolver: ChannelResolver;
    private readonly pollCompletionCallback: PollCompletionCallback;

    constructor (storage: AsyncStorageInterface, channelResolver: ChannelResolver, pollCompletionCallback: PollCompletionCallback) {
        const timeoutCallbacks: Record<PollerTimeoutTypes, (arg?: any) => Promise<void>> = {
            nominationEnd: this.onNominationEnd,
            pollEnd: this.onPollEnd,
            pollReminder: this.onPollReminder
        };
        this.timeoutManager = new TimeoutManager(storage, timeoutCallbacks, { fileName: 'discord-poller.json' });
        this.channelResolver = channelResolver;
        this.pollCompletionCallback = pollCompletionCallback;
    }

    async schedulePollWithNominations(id: string, channel: TextChannel, pollStart: Date, pollEnd: Date) {

        const nominationMessage = await channel.send('Starting poll! TODO');

        const data: PollerTimeoutData = {
            id,
            channelId: channel.id,
            pollStartTime: pollStart.getTime(),
            pollEndTime: pollEnd.getTime(),
            header: 'SOME HEADER',
            prompt: 'SOME PROMPT',
            nominationMessageId: nominationMessage.id
        };
        
        await this.timeoutManager.registerTimeout('nominationEnd', pollStart, { pastStrategy: PastTimeoutStrategy.Invoke, arg: data });
    }

    private async startPoll(choiceValues: string[], data: PollerTimeoutData, target: TextChannel | Message) {
        // Construct poll data
        const choiceKeys: string[] = getPollChoiceKeys(choiceValues);
        const choices: Record<string, string> = toMap(choiceKeys, choiceValues);
        const renderedChoices: string = choiceKeys.map(key => `${key} ${choices[key]}`).join('\n');

        const messageText: string = `${data.header}\n_${data.prompt}_\n`
            + `${renderedChoices}\n`
            + `(Poll ends **${getRelativeDateTimeString(new Date(data.pollEndTime))}**)`;

        // Send out poll message
        let pollMessage;
        if (target instanceof Message) {
            pollMessage = await target.reply(messageText);
        } else {
            pollMessage = await target.send(messageText);
        }
        data.pollData = {
            choices,
            messageId: pollMessage.id
        };

        // Schedule the poll timeout
        await this.timeoutManager.registerTimeout('pollEnd', new Date(data.pollEndTime), { pastStrategy: PastTimeoutStrategy.Invoke, arg: data });

        // Prime the reactions with all valid options
        await addReactsSync(pollMessage, choiceKeys);

        if (data.options?.sendReminder) {
            // TODO: Should we provide the "along" value as an option rather than hardcoding it?
            const reminderDate = getDateBetween(new Date(data.pollStartTime), new Date(data.pollEndTime), 0.8);
            await this.timeoutManager.registerTimeout('pollReminder', new Date(data.pollEndTime), { pastStrategy: PastTimeoutStrategy.Invoke, arg: data });
        }
    }

    private async onNominationEnd(data: PollerTimeoutData) {
        const channel = await this.channelResolver(data.channelId);

        if (!data.nominationMessageId) {
            throw new Error('No nomination message ID!');
        }

        const nominationMessage = await channel.messages.fetch(data.nominationMessageId);

        // Construct the set of proposed submission types by fetching replies to the original FYI message
        let proposalSet: Set<string> = new Set();
        const messages = await channel.messages.fetch({ after: nominationMessage.id });
        for (const message of messages.toJSON()) {
            if (message.reference?.messageId === nominationMessage.id) {
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
        const maxAlternatives: number = 10;
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
        const choiceValues: string[] = Array.from(proposalSet);
        // TODO: Option for shuffling choice values?
        shuffle(choiceValues);

        await this.startPoll(choiceValues, data, nominationMessage);
    }

    private async onPollEnd(data: PollerTimeoutData) {
        const channel = await this.channelResolver(data.channelId);

        if (!data.pollData) {
            throw new Error('No poll data!');
        }

        const pollMessage = await channel.messages.fetch(data.pollData.messageId);

        // Determine the winner(s) of the poll
        let maxVotes: number = -1;
        let winningChoices: string[] = [];
        for (const key of Object.keys(data.pollData.choices)) {
            const choice: string = data.pollData.choices[key];
            const votes: number = pollMessage.reactions.cache.get(key)?.count ?? 0;
            if (votes > maxVotes) {
                maxVotes = votes;
                winningChoices = [choice];
            } else if (votes == maxVotes) {
                winningChoices.push(choice);
            }
        }

        if (winningChoices.length > 1) {
            // Construct the new poll data and start the poll
            const runoffData: PollerTimeoutData = {
                id: data.id,
                channelId: data.channelId,
                pollStartTime: data.pollEndTime,
                pollEndTime: new Date(2 * data.pollEndTime - data.pollStartTime).getTime(),
                header: `There was a tie between **${winningChoices.length}** choices! Please vote again:`,
                prompt: data.prompt,
                options: data.options
            };
            await this.startPoll(winningChoices, runoffData, pollMessage);
        } else if (winningChoices.length === 1) {
            // Trigger poll winning logic
            await this.pollCompletionCallback(data.id, winningChoices, pollMessage);
        } else {
            // No winners?
            await pollMessage.reply('There were no winners for this poll somehow! Damn...');
        }
    }

    private async onPollReminder(data: PollerTimeoutData) {
        const channel = await this.channelResolver(data.channelId);

        if (!data.pollData) {
            throw new Error('No poll data!');
        }

        const pollMessage = await channel.messages.fetch(data.pollData.messageId);

        await pollMessage.reply('There\'s still time to vote!');
    }
}