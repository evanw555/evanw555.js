"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJoinedMentions = void 0;
const misc_1 = require("./misc");
function getJoinedMentions(userIds, conjunction = 'and') {
    return (0, misc_1.naturalJoin)(userIds.map(userId => `<@${userId}>`), conjunction);
}
exports.getJoinedMentions = getJoinedMentions;
//# sourceMappingURL=discord.js.map