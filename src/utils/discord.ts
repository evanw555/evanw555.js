
import { Snowflake } from "discord.js";
import { naturalJoin } from "./misc";

 export function getJoinedMentions(userIds: Snowflake[], conjunction: string = 'and'): string {
    return naturalJoin(userIds.map(userId => `<@${userId}>`), conjunction);
}