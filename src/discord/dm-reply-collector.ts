import { Snowflake, Message, Attachment, MessageCreateOptions, Client, User } from "discord.js";

/**
 * Utility class for conveniently sending DM messages and collecting their replies.
 */
export class DmReplyCollector {
    private readonly messageReplyCallbacks: Record<Snowflake, (message: Message) => Promise<void>>;

    // TODO: Add an optional error handler callback
    constructor() {
        this.messageReplyCallbacks = {};
    }

    /**
     * This hook should be invoked for every message received by the bot client.
     * If the incoming message has a callback registered for it, it will be invoked.
     * @param message The message to process
     */
    async onMessage(message: Message) {
        // If there's a message reply callback registered for this DM, process it as such
        const referenceMessageId = message.reference?.messageId;
        if (referenceMessageId && this.hasDmReplyCallbackForMessage(referenceMessageId)) {
            await this.invokeMessageReplyCallback(referenceMessageId, message);
        }
    }

    /**
     * Send a DM to the provided user, and invoke the provided callback when the user replies to the DM.
     */
    async solicitReply(user: User, messagePayload: string | MessageCreateOptions, callback: (message: Message) => Promise<void>) {
        try {
            // First, attempt to send the message
            const dmChannel = await user.createDM();
            const message = await dmChannel.send(messagePayload);
            // Then, add the callback to the map
            this.messageReplyCallbacks[message.id] = callback;
            // Delete this message and its associated callback relatively soon
            // TODO: Make this configurable per use case
            // TODO: Should we be using a timeout manager for this?
            setTimeout(() => {
                // Delete DM message
                message.delete().catch((err) => {
                    // LOG HERE
                });
                // Delete the associated callback for this message
                this.deleteDmReplyCallback(message.id);
            }, 5 * 60_000);
        } catch (err) {
            // LOG HERE
        }
    }

    /**
     * Simple wrapper around {@link solicitReply} that extracts an image attachment automatically and invokes the callback if found.
     */
    async solicitImageReply(user: User, messagePayload: string | MessageCreateOptions, callback: (message: Message, imageAttachment: Attachment) => Promise<void>) {
        // Just a simple wrapper around the primary method that extracts the image attachment automatically
        await this.solicitReply(user, messagePayload, async (replyMessage) => {
            // Extract the images from the reply message...
            const firstImageAttachment = replyMessage.attachments.filter(a => a.contentType?.startsWith('image/')).first();
            if (firstImageAttachment) {
                await callback(replyMessage, firstImageAttachment);
            } else {
                await replyMessage.reply('Hmmmmmm weren\'t you supposed to attach an image?');
            }
        });
    }

    private deleteDmReplyCallback(targetMessageId: Snowflake) {
        delete this.messageReplyCallbacks[targetMessageId];
    }

    private hasDmReplyCallbackForMessage(targetMessageId: Snowflake): boolean {
        return targetMessageId in this.messageReplyCallbacks;
    }

    private async invokeMessageReplyCallback(targetMessageId: Snowflake, replyMessage: Message) {
        await this.messageReplyCallbacks[targetMessageId](replyMessage);
    }
}