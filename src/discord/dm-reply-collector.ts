import { Snowflake, Message, Attachment, MessageCreateOptions, Client, User } from "discord.js";

/**
 * Utility class for conveniently sending DM messages and collecting their replies.
 */
export class DmReplyCollector {
    private readonly messageReplyCallbacks: Record<Snowflake, (message: Message) => Promise<void>>;

    // TODO: Add an optional error handler callback
    constructor(client: Client) {
        this.messageReplyCallbacks = {};
        // Intercept message create events on this client to handle registered DM replies
        client.on('messageCreate', async (msg) => {
            // If there's a message reply callback registered for this DM, process it as such
            const referenceMessageId = msg.reference?.messageId;
            if (referenceMessageId && this.hasDmReplyCallbackForMessage(referenceMessageId)) {
                await this.invokeMessageReplyCallback(referenceMessageId, msg);
            }
        });
    }

    async registerDmReplyCallback(user: User, messagePayload: string | MessageCreateOptions, callback: (message: Message) => Promise<void>) {
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
     * Simple wrapper around {@link registerDmReplyCallback} that extracts an image attachment automatically and invokes the callback if found.
     */
    async registerDmReplyImageCallback(user: User, messagePayload: string | MessageCreateOptions, callback: (message: Message, imageAttachment: Attachment) => Promise<void>) {
        // Just a simple wrapper around the primary method that extracts the image attachment automatically
        await this.registerDmReplyCallback(user, messagePayload, async (replyMessage) => {
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