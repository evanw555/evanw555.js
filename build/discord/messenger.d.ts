import { GuildMember, Message, TextBasedChannel } from "discord.js";
export declare class Messenger {
    private _busy;
    private readonly _backlog;
    private logger?;
    constructor();
    setLogger(logger: (message: string) => void): void;
    send(channel: TextBasedChannel, text: string): Promise<void>;
    reply(message: Message, text: string): Promise<void>;
    dm(member: GuildMember, text: string): Promise<void>;
    private _send;
    private _processEntry;
    /**
     * TODO: do this better. De-dup logic.
     */
    sendAndGet(channel: TextBasedChannel, text: string): Promise<Message>;
    /**
     * Send the provided text as a series of boxed (monospaced) messages limited to no more than 2000 characters each.
     * @param channel the target channel
     * @param text the text to send
     */
    sendLargeMonospaced(channel: TextBasedChannel, text: string): Promise<void>;
}
//# sourceMappingURL=messenger.d.ts.map