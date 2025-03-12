import { Message, Attachment, MessageCreateOptions, Client, User } from "discord.js";
/**
 * Utility class for conveniently sending DM messages and collecting their replies.
 */
export declare class DmReplyCollector {
    private readonly messageReplyCallbacks;
    constructor(client: Client);
    registerDmReplyCallback(user: User, messagePayload: string | MessageCreateOptions, callback: (message: Message) => Promise<void>): Promise<void>;
    /**
     * Simple wrapper around {@link registerDmReplyCallback} that extracts an image attachment automatically and invokes the callback if found.
     */
    registerDmReplyImageCallback(user: User, messagePayload: string | MessageCreateOptions, callback: (message: Message, imageAttachment: Attachment) => Promise<void>): Promise<void>;
    private deleteDmReplyCallback;
    private hasDmReplyCallbackForMessage;
    private invokeMessageReplyCallback;
}
//# sourceMappingURL=dm-reply-collector.d.ts.map