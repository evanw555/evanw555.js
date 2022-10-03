
import { ChannelLogsQueryOptions, Message, Snowflake, TextBasedChannel } from "discord.js";
import { naturalJoin } from "./misc";
import { randChoice, shuffle } from "./random";
import { sleep } from "./time";

export function getJoinedMentions(userIds: Snowflake[], conjunction: string = 'and'): string {
    return naturalJoin(userIds.map(userId => `<@${userId}>`), conjunction);
}

/**
 * Send the provided text as a series of boxed (monospaced) messages limited to no more than 2000 characters each.
 * @param channel the target channel
 * @param text the text to send
 */
export async function sendLargeMonospaced (channel: TextBasedChannel, text: string): Promise<void> {
    const lines: string[] = text.split('\n');
    let buffer: string = '';
    let segmentIndex: number = 0;
    while (lines.length !== 0) {
        const prefix: string = buffer ? '\n' : '';
        buffer += prefix + lines.shift();
        if (lines.length === 0 || buffer.length + lines[0].length > 1990) {
            try {
                await channel.send(`\`\`\`${buffer}\`\`\``);
            } catch (err) {
                await channel.send(`Failed sending segment **${segmentIndex}**`);
            }
            buffer = '';
            segmentIndex++;
        }
    }
}

/**
 * For some text channel, fetch the most recent message before some specified date.
 * @param channel the text channel in which to search
 * @param date the specified date
 * @param options.batchSize how many messages to fetch per batch
 * @returns the message fitting this criteria, or undefined if none exist
 */
export async function findLatestMessageBeforeDate(channel: TextBasedChannel, date: Date, options?: { batchSize?: number }): Promise<Message | undefined> {
    const batchSize: number = options?.batchSize ?? 25;

    let beforeMessageId: Snowflake | undefined = undefined;
    while (true) {
        const options: ChannelLogsQueryOptions = { limit: batchSize };
        if (beforeMessageId) {
            options.before = beforeMessageId;
        }
        const messages = await channel.messages.fetch(options);
        console.log(`Fetched ${messages.size} messages`);
        messages.sort((x, y) => x.createdTimestamp - y.createdTimestamp);
        if (messages.size === 0) {
            return undefined;
        }
        const earliestMessage: Message = messages.first() as Message;
        // If the earliest message if still after the specified date, query messages before this
        if (earliestMessage.createdAt.getTime() >= date.getTime()) {
            beforeMessageId = earliestMessage.id;
            console.log(`Earliest message sent by ${earliestMessage.author.username} on ${earliestMessage.createdAt.toLocaleString()} is still after the target date, querying more...`);
            continue;
        }
        console.log(`Earliest message sent by ${earliestMessage.author.username} on ${earliestMessage.createdAt.toLocaleString()} is before the target date, navigating...`);
        // Find the first message after the specified date and return the one before that
        for (let i = 1; i < messages.size; i++) {
            const message: Message = messages.at(i) as Message;
            if (message.createdAt.getTime() >= date.getTime()) {
                return messages.at(i - 1) as Message;
            }
            console.log(`Navigating: ${message.createdAt.toLocaleString()} by ${message.author.username}`);
        }
        // If none are after the specified date, just return the last one (which is the one right before the earliest of the previous query)
        return messages.last() as Message;
    }
}

/**
 * For some text channel, delete all messages predating some particular message specified by a provided ID.
 * @param channel the channel in which to delete messages
 * @param messageId the ID of the message before which all messages should be deleted
 * @param options.batchSize how many messages to fetch per batch
 * @param options.delay how many milliseconds to delay between each message deletion operation
 * @returns how many messages were deleted by this operation
 */
export async function deleteMessagesBeforeMessage(channel: TextBasedChannel, messageId: Snowflake, options?: { batchSize?: number, delay?: number}): Promise<number> {
    const batchSize: number = options?.batchSize ?? 50;
    const delay: number = options?.delay ?? 1000;

    let numMessagesDeleted: number = 0;
    while (true) {
        const messages = await channel.messages.fetch({ limit: batchSize, before: messageId });
        if (messages.size === 0) {
            console.log('Found no more messages to delete.');
            return numMessagesDeleted;
        }
        console.log(`Found ${messages.size} messages, deleting all...`);
        for (let message of messages.values()) {
            await message.delete();
            numMessagesDeleted++;
            process.stdout.write('.');
            await sleep(delay);
        }
        process.stdout.write('✔️\n');
    }
}

/**
 * For a list of poll choice values, return an appropriate list of choice key emojis corresponding to the value list.
 * Note: the overrides option only applies to keys (or consecutive keys) at the beginning or end of the list.
 *
 * @param choices list of poll choice values
 * @param options.overrides a of poll choice keys that can be used if a particular choice value is encountered
 * @returns list of choice key emojis corresponding to the provided choice values
 */
export function getPollChoiceKeys(choices: string[], options?: { overrides: Record<string, string[]> }): string[] {
    const n: number = choices.length;

    // Recursively handle overrides
    // TODO: Can we handle overrides for a key that's not first or last?
    if (options?.overrides) {
        // Override the first choice key
        const firstKey: string = choices[0];
        if (firstKey in options.overrides) {
            return [randChoice(...options.overrides[firstKey]), ...getPollChoiceKeys(choices.slice(1), options)];
        }
        // Override the last choice key
        const lastKey: string = choices[n - 1];
        if (lastKey in options.overrides) {
            return [...getPollChoiceKeys(choices.slice(0, -1), options), randChoice(...options.overrides[lastKey])];
        }
    }

    // Specially handle 2-choice polls
    if (n === 2) {
        if (choices[0].toLowerCase() === 'yes' && choices[1].toLowerCase() === 'no') {
            return randChoice(['✅', '❌'], ['👍', '👎']);
        } else {
            return randChoice(['🅰️', '🅱️'], shuffle(['🏳️', '🏴']));
        }
    }
    // For all other cases, just shuffle some array of symbols and slice it
    if (n === 3) {
        return shuffle(randChoice(['🔴', '⚫', '⚪'], ['🏴', '🏳️', '🏁']));
    } else if (n === 4) {
        return shuffle(['♠️', '♥️', '♦️', '♣️']);
    } else if (n <= 6) {
        // Keep colors in order
        return ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'].slice(0, n);
    } else if (n <= 20) {
        // Slice to the right size
        return shuffle(['🍒', '🍉', '🍌', '🍎', '🥕', '🏐', '🏀', '🏈', '🌲', '🎱', '🎲', '💎', '💰', '🪐', '☘️', '🌻', '🍄', '🌎', '🌙', '🔥']).slice(0, n);
    } else {
        throw new Error('Cannot have more than 20 poll choices!');
    }
}


    /**
     * Adds the list of reacts in-order, taking a delay between each.
     * Handles failures gracefully by extending the delay between each react.
     *
     * @param message the message to which we are reacting
     * @param reacts the ordered list of emojis to react with
     * @param options.delay the base delay between each message (will grow on failure)
     * @param options.retries number of failed reacts to allow before aborting with an error
     */
export async function addReactsSync(message: Message, reacts: string[], options?: { delay?: number, retries?: number }): Promise<void> {
    let delay: number = options?.delay ?? 1000;
    let retriesLeft: number = options?.retries ?? 3;
    // Add all emojis to the queue
    const queue: string[] = [];
    queue.push(...reacts);
    // For each emoji in the queue, attempt to react to the message with it
    while (queue.length > 0) {
        const react: string = queue[0];
        await sleep(delay);
        try {
            await message.react(react);
        } catch (err) {
            // If the react failed, increase the delay, consume one retry, and try again
            delay = Math.floor(delay * 1.5);
            retriesLeft--;
            if (retriesLeft === 0) {
                throw new Error(`Ran out of retries while adding reacts to message, aborting: \`${err}\``);
            }
            continue;
        }
        queue.shift();
    }
}