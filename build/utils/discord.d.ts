import { Message, Snowflake, TextBasedChannel } from "discord.js";
export declare enum DiscordTimestampFormat {
    ShortTime = "t",
    LongTime = "T",
    ShortDate = "d",
    LongDate = "D",
    ShortDateTime = "f",
    LongDateTime = "F",
    Relative = "R"
}
/**
 * Given some date/time, returns a Discord timestamp string in some particular format.
 * @param date The provided date
 * @param format The format of the output timestamp
 * @returns Discord timestamp string
 */
export declare function toDiscordTimestamp(date: Date, format?: DiscordTimestampFormat): string;
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
 * For some text channel, count the messages since some specified date.
 * @param channel the text channel in which to count
 * @param date the specified date
 * @param options.batchSize how many messages to fetch per batch
 * @returns the number of messages in the channel since the specified date
 */
export declare function countMessagesSinceDate(channel: TextBasedChannel, date: Date, options?: {
    batchSize?: number;
}): Promise<number>;
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
/**
 * For a list of poll choice values, return an appropriate list of choice key emojis corresponding to the value list.
 * Note: the overrides option only applies to keys (or consecutive keys) at the beginning or end of the list.
 *
 * @param choices list of poll choice values
 * @param options.overrides a of poll choice keys that can be used if a particular choice value is encountered
 * @returns list of choice key emojis corresponding to the provided choice values
 */
export declare function getPollChoiceKeys(choices: string[], options?: {
    overrides: Record<string, string[]>;
}): string[];
/**
 * Adds the list of reacts in-order, taking a delay between each.
 * Handles failures gracefully by extending the delay between each react.
 *
 * @param message the message to which we are reacting
 * @param reacts the ordered list of emojis to react with
 * @param options.delay the base delay between each message (will grow on failure)
 * @param options.retries number of failed reacts to allow before aborting with an error
 */
export declare function addReactsSync(message: Message, reacts: string[], options?: {
    delay?: number;
    retries?: number;
}): Promise<void>;
//# sourceMappingURL=discord.d.ts.map