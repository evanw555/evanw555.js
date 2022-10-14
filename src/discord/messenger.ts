import { DMChannel, GuildMember, Message, Snowflake, TextBasedChannel } from "discord.js";
import { randInt } from "../utils/random";
import { sleep } from "../utils/time";

interface MessengerBacklogEntry {
    channel: TextBasedChannel,
    message?: Message,
    text: string,
    options?: MessengerOptions
    resolve?: () => void
}
interface MessengerOptions {
    /**
     * Whether to skip the typing delay and send immediately.
     */
    immediate?: boolean
}

export class Messenger {
    // The Discord API will automatically stop typing events after 10 seconds
    private static MAX_TYPING_DURATION: number = 10000;

    private _busy: boolean;
    private readonly _backlog: MessengerBacklogEntry[];
    private logger?: (message: string) => void;
    private memberResolver?: (id: Snowflake) => Promise<GuildMember>;

    constructor() {
        this._busy = false;
        this._backlog = [];
    }

    setLogger(logger: (message: string) => void): void {
        this.logger = logger;
    }

    setMemberResolver(memberResolver: (id: Snowflake) => Promise<GuildMember>): void {
        this.memberResolver = memberResolver;
    }

    async send(channel: TextBasedChannel, text: string, options?: MessengerOptions): Promise<void> {
        await this._send({ channel, text, options });
    }

    async reply(message: Message, text: string, options?: MessengerOptions): Promise<void> {
        await this._send({ channel: message.channel, message, text, options });
    }

    private async _resolveMember(member: GuildMember | Snowflake): Promise<GuildMember> {
        if (member instanceof GuildMember) {
            return member;
        } else if (typeof member === 'string') {
            if (this.memberResolver) {
                try {
                    return await this.memberResolver(member);
                } catch (err) {
                    throw new Error(`Unable to resolve member with ID ${member}: ${err}`);
                }
            } else {
                throw new Error('No memberResolver set');
            }
        } else {
            throw new Error(`Expected member argument to be GuildMember or Snowflake but found ${member}`);
        }
    }

    async dm(member: GuildMember | Snowflake, text: string, options?: MessengerOptions): Promise<void> {
        try {
            const resolvedMember: GuildMember = await this._resolveMember(member);
            const dmChannel: DMChannel = await resolvedMember.createDM();
            await this._send({ channel: dmChannel, text, options });
        } catch (err) {
            this.log(`Unable to send DM via \`Messenger.dm\`: \`${err}\``);
        }
    }

    private async _send(entry: MessengerBacklogEntry): Promise<void> {
        return new Promise(async (resolve) => {
            entry.resolve = resolve;
            await this._processEntry(entry);
        });
    }

    private async _processEntry(entry: MessengerBacklogEntry): Promise<void> {
        if (!this._busy) {
            // If the messenger isn't typing/waiting/sending, then go ahead and process the message now
            this._busy = true;
            this._backlog.push(entry);
            while (this._backlog.length > 0) {
                const { channel, message, text, resolve } = this._backlog.shift() as MessengerBacklogEntry;
                try {
                    // Unless the options specify to send immediately, add an artificial delay
                    if (!entry.options?.immediate) {
                        // Take a brief pause
                        await sleep(randInt(100, 1500));
                        // Send the typing event and wait a bit
                        try {
                            await channel.sendTyping();
                            // Calculate the typing duration using the length of the message, but cap it at Discord's max typing duration
                            const typingDuration: number = Math.min(randInt(45, 55) * text.length, Messenger.MAX_TYPING_DURATION);
                            await sleep(typingDuration);
                        } catch (err) {
                            // Typing events are non-critical, so allow them to fail silently...
                        }
                    }
                    // Now actually reply/send the message
                    if (message) {
                        await message.reply(text);
                    } else {
                        await channel.send(text);
                    }
                } catch (err) {
                    this.log(`Failed to send message: \`${err}\``);
                }
                // Resolve the promise for this message
                if (resolve) {
                    resolve();
                } else {
                    this.log(`No resolve function found for messenger backlog entry to ${channel}`);
                }
            }
            this._busy = false;
        } else {
            // If the messenger is busy, just add the info to the backlog and let the active thread send it when it's done
            this._backlog.push(entry);
        }
    }

    /**
     * TODO: do this better. De-dup logic.
     */
    async sendAndGet(channel: TextBasedChannel, text: string): Promise<Message> {
        // Take a brief pause
        await sleep(randInt(100, 1500));
        // Send the typing event and wait a bit
        try {
            await channel.sendTyping();
            // Calculate the typing duration using the length of the message, but cap it at Discord's max typing duration
            const typingDuration: number = Math.min(randInt(45, 55) * text.length, Messenger.MAX_TYPING_DURATION);
            await sleep(typingDuration);
        } catch (err) {
            // Typing events are non-critical, so allow them to fail silently...
        }
        // Now actually reply/send the message
        return channel.send(text);
    }

    /**
     * Send the provided text as a series of boxed (monospaced) messages limited to no more than 2000 characters each.
     * @param channel the target channel
     * @param text the text to send
     */
    async sendLargeMonospaced(channel: TextBasedChannel, text: string): Promise<void> {
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

    private log(text: string): void {
        if (this.logger) {
            this.logger(text);
        }
    }
}
