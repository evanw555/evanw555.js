"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTextLabel = void 0;
const canvas_1 = require("canvas");
/**
 * Generates a canvas containing the specified text with the specified width and height.
 * The size of the text will be automatically determined unless specified otherwise.
 * The background of the label will be transparent.
 * @param text The text used to generate the label
 * @param width Desired width of the resulting label image
 * @param height Desired height of the resulting label image
 * @param options.align How to align the text horizontally
 * @param options.font Font to for the text (defaults to an auto-sized sans-serif)
 * @param options.style Style to use for the text (defaults to white)
 * @param options.alpha Alpha to use for the text (defaults to opaque)
 * @param options.margin Optional horizontal margin (defaults to none)
 * @returns New canvas containing the specified text
 */
function getTextLabel(text, width, height, options) {
    var _a, _b, _c, _d, _e;
    const ALIGN = (_a = options === null || options === void 0 ? void 0 : options.align) !== null && _a !== void 0 ? _a : 'center';
    const canvas = (0, canvas_1.createCanvas)(width, height);
    const context = canvas.getContext('2d');
    context.font = (_b = options === null || options === void 0 ? void 0 : options.font) !== null && _b !== void 0 ? _b : `${height * 0.6}px sans-serif`;
    context.fillStyle = (_c = options === null || options === void 0 ? void 0 : options.style) !== null && _c !== void 0 ? _c : 'white';
    context.globalAlpha = (_d = options === null || options === void 0 ? void 0 : options.alpha) !== null && _d !== void 0 ? _d : 1;
    const ascent = context.measureText(text).actualBoundingBoxAscent;
    const verticalMargin = (height - ascent) / 2;
    if (ALIGN === 'center') {
        const textWidth = context.measureText(text).width;
        const margin = (_e = options === null || options === void 0 ? void 0 : options.margin) !== null && _e !== void 0 ? _e : 0;
        const usableWidth = width - (2 * margin);
        if (textWidth > usableWidth) {
            // If the text is too wide for the label, compress it
            context.fillText(text, Math.floor(margin), verticalMargin + ascent, usableWidth);
        }
        else {
            // If the text is smaller than the label, center it
            context.fillText(text, Math.floor(margin + (usableWidth - textWidth) / 2), verticalMargin + ascent);
        }
    }
    else if (ALIGN === 'right') {
        context.fillText(text, Math.floor(width - context.measureText(text).width), verticalMargin + ascent, width);
    }
    else {
        context.fillText(text, 0, verticalMargin + ascent, width);
    }
    context.restore();
    return canvas;
}
exports.getTextLabel = getTextLabel;
//# sourceMappingURL=text.js.map