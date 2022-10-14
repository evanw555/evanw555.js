import { GuildMember, Message, Snowflake, TextBasedChannel } from "discord.js";
interface MessengerOptions {
    /**
     * Whether to skip the typing delay and send immediately.
     */
    immediate?: boolean;
}
export declare class Messenger {
    private static MAX_TYPING_DURATION;
    private _busy;
    private readonly _backlog;
    private logger?;
    private memberResolver?;
    constructor();
    setLogger(logger: (message: string) => void): void;
    setMemberResolver(memberResolver: (id: Snowflake) => Promise<GuildMember>): void;
    send(channel: TextBasedChannel, text: string, options?: MessengerOptions): Promise<void>;
    reply(message: Message, text: string, options?: MessengerOptions): Promise<void>;
    private _resolveMember;
    dm(member: GuildMember | Snowflake, text: string, options?: MessengerOptions): Promise<void>;
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
    private log;
}
export {};
//# sourceMappingURL=messenger.d.ts.map