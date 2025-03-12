import { Message, Attachment, MessageCreateOptions, User } from "discord.js";
/**
 * Utility class for conveniently sending DM messages and collecting their replies.
 */
export declare class DmReplyCollector {
    private readonly messageReplyCallbacks;
    constructor();
    /**
     * This hook should be invoked for every message received by the bot client.
     * If the incoming message has a callback registered for it, it will be invoked.
     * @param message The message to process
     */
    onMessage(message: Message): Promise<void>;
    /**
     * Send a DM to the provided user, and invoke the provided callback when the user replies to the DM.
     */
    solicitReply(user: User, messagePayload: string | MessageCreateOptions, callback: (message: Message) => Promise<void>): Promise<void>;
    /**
     * Simple wrapper around {@link solicitReply} that extracts an image attachment automatically and invokes the callback if found.
     */
    solicitImageReply(user: User, messagePayload: string | MessageCreateOptions, callback: (message: Message, imageAttachment: Attachment) => Promise<void>): Promise<void>;
    private deleteDmReplyCallback;
    private hasDmReplyCallbackForMessage;
    private invokeMessageReplyCallback;
}
//# sourceMappingURL=dm-reply-collector.d.ts.map