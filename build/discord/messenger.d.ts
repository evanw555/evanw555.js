import { GuildMember, Message, MessageCreateOptions, Snowflake, TextBasedChannel } from "discord.js";
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
    private readonly _alwaysImmediate;
    private logger?;
    private memberResolver?;
    /**
     * @param options.alwaysImmediate If true, then every message sent with this messenger will be immediate (no typing delay)
     */
    constructor(options?: {
        alwaysImmediate?: true;
    });
    setLogger(logger: (message: string) => void): void;
    setMemberResolver(memberResolver: (id: Snowflake) => Promise<GuildMember>): void;
    /**
     * Sends a message payload to the specified text channel.
     * @param channel Channel to send this message payload to
     * @param payload Message payload to send
     * @param options Options to control how this payload is sent
     * @returns The sent message object if it was successful, else undefined
     */
    send(channel: TextBasedChannel, payload: string | MessageCreateOptions, options?: MessengerOptions): Promise<Message | undefined>;
    /**
     * Sends a list of message payloads to the specified text channel in the order that they're provided.
     * @param channel Channel to send these message payloads to
     * @param payloads List of message payloads to send (in order)
     * @param options Options to control how these payloads are sent
     * @returns List of message objects sent successfully to the target channel
     */
    sendAll(channel: TextBasedChannel, payloads: (string | MessageCreateOptions)[], options?: MessengerOptions): Promise<Message[]>;
    /**
     * Sends a message payload as a reply to some provided message.
     * @param message Message to which the payload is sent as a reply
     * @param payload Message payload to send
     * @param options Options to control how this payload is sent
     * @returns The sent message object if it was successful, else undefined
     */
    reply(message: Message, payload: string | MessageCreateOptions, options?: MessengerOptions): Promise<Message | undefined>;
    private _resolveMember;
    /**
     * Sends a message payload to the specified guild member's DMs.
     * @param member The guild member (or the ID of the guild member) to DM this message payload to
     * @param payload The message payload to send
     * @param options Options to control how this payload is sent
     * @returns The sent message object if it was successful, else undefined
     */
    dm(member: GuildMember | Snowflake, payload: string | MessageCreateOptions, options?: MessengerOptions): Promise<Message | undefined>;
    /**
     * Sends a list of message payloads to the specified guild member's DMs in the order that they're provided.
     * @param member The guild member (or the ID of the guild member) to DM these message payloads to
     * @param payloads List of message payloads to send (in order)
     * @param options Options to control how these payloads are sent
     * @returns List of message objects sent successfully to the target channel
     */
    dmAll(member: GuildMember | Snowflake, payloads: (string | MessageCreateOptions)[], options?: MessengerOptions): Promise<Message[]>;
    private _send;
    private _processEntry;
    /**
     * Send the provided text as a series of boxed (monospaced) messages limited to no more than 2000 characters each.
     * @param channel the target channel
     * @param text the text to send
     */
    sendLargeMonospaced(channel: TextBasedChannel, text: string): Promise<void>;
    private log;
    /**
     * @param content the message payload
     * @returns The "typing" duration in milliseconds for this payload
     */
    private getTypingDuration;
}
export {};
//# sourceMappingURL=messenger.d.ts.map