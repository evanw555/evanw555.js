import { Message, Snowflake, TextChannel } from "discord.js";
import { AsyncStorageInterface } from "../file-storage";
declare type ChannelResolver = (channelId: Snowflake) => Promise<TextChannel>;
declare type PollCompletionCallback = (id: string, winners: string[], pollMessage: Message) => Promise<void>;
export declare class Poller {
    private readonly timeoutManager;
    private readonly channelResolver;
    private readonly pollCompletionCallback;
    constructor(storage: AsyncStorageInterface, channelResolver: ChannelResolver, pollCompletionCallback: PollCompletionCallback);
    schedulePollWithNominations(id: string, channel: TextChannel, pollStart: Date, pollEnd: Date): Promise<void>;
    private startPoll;
    private onNominationEnd;
    private onPollEnd;
    private onPollReminder;
}
export {};
//# sourceMappingURL=poller.d.ts.map