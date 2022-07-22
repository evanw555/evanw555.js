import { Message, Snowflake, TextBasedChannel } from "discord.js";
export declare function getJoinedMentions(userIds: Snowflake[], conjunction?: string): string;
/**
 * Send the provided text as a series of boxed (monospaced) messages limited to no more than 2000 characters each.
 * @param channel the target channel
 * @param text the text to send
 */
export declare function sendLargeMonospaced(channel: TextBasedChannel, text: string): Promise<void>;
/**
 * For some text channel, fetch the most recent message before some specified date.
 * @param channel the text channel in which to search
 * @param date the specified date
 * @param options.batchSize how many messages to fetch per batch
 * @returns the message fitting this criteria, or undefined if none exist
 */
export declare function findLatestMessageBeforeDate(channel: TextBasedChannel, date: Date, options?: {
    batchSize?: number;
}): Promise<Message | undefined>;
/**
 * For some text channel, delete all messages predating some particular message specified by a provided ID.
 * @param channel the channel in which to delete messages
 * @param messageId the ID of the message before which all messages should be deleted
 * @param options.batchSize how many messages to fetch per batch
 * @param options.delay how many milliseconds to delay between each message deletion operation
 * @returns how many messages were deleted by this operation
 */
export declare function deleteMessagesBeforeMessage(channel: TextBasedChannel, messageId: Snowflake, options?: {
    batchSize?: number;
    delay?: number;
}): Promise<number>;
//# sourceMappingURL=discord.d.ts.map