"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DmReplyCollector = void 0;
/**
 * Utility class for conveniently sending DM messages and collecting their replies.
 */
class DmReplyCollector {
    // TODO: Add an optional error handler callback
    constructor(client) {
        this.messageReplyCallbacks = {};
        // Intercept message create events on this client to handle registered DM replies
        client.on('messageCreate', (msg) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            // If there's a message reply callback registered for this DM, process it as such
            const referenceMessageId = (_a = msg.reference) === null || _a === void 0 ? void 0 : _a.messageId;
            if (referenceMessageId && this.hasDmReplyCallbackForMessage(referenceMessageId)) {
                yield this.invokeMessageReplyCallback(referenceMessageId, msg);
            }
        }));
    }
    registerDmReplyCallback(user, messagePayload, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // First, attempt to send the message
                const dmChannel = yield user.createDM();
                const message = yield dmChannel.send(messagePayload);
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
                }, 5 * 60000);
            }
            catch (err) {
                // LOG HERE
            }
        });
    }
    /**
     * Simple wrapper around {@link registerDmReplyCallback} that extracts an image attachment automatically and invokes the callback if found.
     */
    registerDmReplyImageCallback(user, messagePayload, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            // Just a simple wrapper around the primary method that extracts the image attachment automatically
            yield this.registerDmReplyCallback(user, messagePayload, (replyMessage) => __awaiter(this, void 0, void 0, function* () {
                // Extract the images from the reply message...
                const firstImageAttachment = replyMessage.attachments.filter(a => { var _a; return (_a = a.contentType) === null || _a === void 0 ? void 0 : _a.startsWith('image/'); }).first();
                if (firstImageAttachment) {
                    yield callback(replyMessage, firstImageAttachment);
                }
                else {
                    yield replyMessage.reply('Hmmmmmm weren\'t you supposed to attach an image?');
                }
            }));
        });
    }
    deleteDmReplyCallback(targetMessageId) {
        delete this.messageReplyCallbacks[targetMessageId];
    }
    hasDmReplyCallbackForMessage(targetMessageId) {
        return targetMessageId in this.messageReplyCallbacks;
    }
    invokeMessageReplyCallback(targetMessageId, replyMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.messageReplyCallbacks[targetMessageId](replyMessage);
        });
    }
}
exports.DmReplyCollector = DmReplyCollector;
//# sourceMappingURL=dm-reply-collector.js.map