import { DMChannel, GuildMember, Message, TextBasedChannel } from "discord.js";
import { randInt } from "../utils/random";
import { sleep } from "../utils/time";

interface MessengerBacklogEntry {
    channel: TextBasedChannel,
    message?: Message,
    text: string,
    resolve?: () => void
}

export class Messenger {
    private _busy: boolean;
    private readonly _backlog: MessengerBacklogEntry[];
    private logger?: (message: string) => void;

    constructor() {
        this._busy = false;
        this._backlog = [];
    }

    setLogger(logger: (message: string) => void): void {
        this.logger = logger;
    }

    async send(channel: TextBasedChannel, text: string): Promise<void> {
        await this._send({ channel, text });
    }

    async reply(message: Message, text: string): Promise<void> {
        await this._send({ channel: message.channel, message, text });
    }

    async dm(member: GuildMember, text: string): Promise<void> {
        try {
            const dmChannel: DMChannel = await member.createDM();
            await this._send({ channel: dmChannel, text });
        } catch (err) {
            if (this.logger) {
                this.logger(`Unable to create DM channel for user \`${member.id}\`: \`${err}\``);
            }
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
                    // Take a brief pause
                    await sleep(randInt(100, 1500));
                    // Send the typing event and wait based on the length of the message
                    try {
                        await channel.sendTyping();
                        await sleep(randInt(45, 55) * text.length);
                    } catch (err) {
                        // Typing events are non-critical, so allow them to fail silently...
                    }
                    // Now actually reply/send the message
                    if (message) {
                        await message.reply(text);
                    } else {
                        await channel.send(text);
                    }
                } catch (err) {
                    if (this.logger) {
                        this.logger(`Failed to send message: \`${err}\``);
                    }
                }
                // Resolve the promise for this message
                if (resolve) {
                    resolve();
                } else if (this.logger) {
                    this.logger(`No resolve function found for messenger backlog entry to ${channel}`);
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
        // Send the typing event and wait based on the length of the message
        try {
            await channel.sendTyping();
            await sleep(randInt(45, 55) * text.length);
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
}
