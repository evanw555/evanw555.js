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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBarGraph = void 0;
const canvas_1 = __importDefault(require("canvas"));
const constants_1 = require("./constants");
function createBarGraph(entries, options) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const ROW_HEIGHT = (_a = options === null || options === void 0 ? void 0 : options.rowHeight) !== null && _a !== void 0 ? _a : 40;
        const SHOW_NAMES = (_b = options === null || options === void 0 ? void 0 : options.showNames) !== null && _b !== void 0 ? _b : true;
        const PALETTE = (_c = options === null || options === void 0 ? void 0 : options.palette) !== null && _c !== void 0 ? _c : constants_1.DEFAULT_GRAPH_PALETTE;
        const MARGIN = 8;
        const PADDING = 4;
        const MAX_BAR_WIDTH = ROW_HEIGHT * 9;
        const TOTAL_ROWS = entries.length + ((options === null || options === void 0 ? void 0 : options.title) ? 1 : 0);
        const HEIGHT = TOTAL_ROWS * ROW_HEIGHT + (TOTAL_ROWS + 1) * MARGIN;
        const META_COLUMNS = 1 + (SHOW_NAMES ? 2 : 0);
        const WIDTH = META_COLUMNS * ROW_HEIGHT + MAX_BAR_WIDTH + (SHOW_NAMES ? 4 : 3) * MARGIN;
        const c = canvas_1.default.createCanvas(WIDTH, HEIGHT);
        const context = c.getContext('2d');
        // Fill in the background
        context.fillStyle = PALETTE.background;
        context.fillRect(0, 0, WIDTH, HEIGHT);
        // Draw the title
        let baseY = MARGIN;
        if (options === null || options === void 0 ? void 0 : options.title) {
            context.font = `${Math.floor(ROW_HEIGHT * 0.6)}px sans-serif`;
            context.fillStyle = PALETTE.text;
            const titleWidth = context.measureText(options.title).width;
            const titleX = (WIDTH - titleWidth) / 2;
            context.fillText(options.title, titleX, baseY + 0.75 * ROW_HEIGHT);
            baseY += ROW_HEIGHT + MARGIN;
        }
        // Determine the largest entry value
        const maxEntryValue = Math.max(...entries.map(e => e.value));
        // Draw each row
        for (const entry of entries) {
            // TODO: Use image loader with cache
            let image = undefined;
            try {
                image = yield canvas_1.default.loadImage(entry.imageUrl);
            }
            catch (err) {
                // TODO: Use broken image
            }
            let baseX = MARGIN;
            // Write the name to the left of the image
            if (SHOW_NAMES) {
                context.fillStyle = PALETTE.padding;
                context.fillRect(baseX, baseY, ROW_HEIGHT * 2, ROW_HEIGHT);
                context.font = `${Math.floor(ROW_HEIGHT * 0.6)}px sans-serif`;
                context.fillStyle = PALETTE.text;
                context.fillText(entry.name, baseX + PADDING, baseY + 0.75 * ROW_HEIGHT, (ROW_HEIGHT - PADDING) * 2);
                baseX += ROW_HEIGHT * 2 + MARGIN;
            }
            // Draw the image
            context.fillStyle = PALETTE.padding;
            context.fillRect(baseX, baseY, ROW_HEIGHT, ROW_HEIGHT);
            // TODO: Once using image loader, image should always be defined
            if (image) {
                context.drawImage(image, baseX + PADDING, baseY + PADDING, ROW_HEIGHT - 2 * PADDING, ROW_HEIGHT - 2 * PADDING);
            }
            baseX += ROW_HEIGHT + MARGIN;
            // Draw the bar
            const barWidth = Math.floor(MAX_BAR_WIDTH * entry.value / maxEntryValue);
            context.fillStyle = PALETTE.padding;
            context.fillRect(baseX, baseY, barWidth, ROW_HEIGHT);
            if (barWidth > PADDING * 2) {
                context.fillStyle = PALETTE.highlight;
                context.fillRect(baseX + PADDING, baseY + PADDING, barWidth - 2 * PADDING, ROW_HEIGHT - 2 * PADDING);
            }
            // Write the number value
            const valueText = `${entry.value}`;
            const valueTextWidth = context.measureText(valueText).width;
            context.fillStyle = PALETTE.text;
            if (valueTextWidth + 4 * PADDING < barWidth) {
                // If it's small enough, write it inside the bar
                context.fillText(valueText, baseX + barWidth - valueTextWidth - 2 * PADDING, baseY + 0.75 * ROW_HEIGHT);
            }
            else {
                // Else, write it outside the bar
                context.fillText(valueText, baseX + barWidth + MARGIN, baseY + 0.75 * ROW_HEIGHT);
            }
            // Advance vertical offset
            baseY += ROW_HEIGHT + MARGIN;
        }
        return c;
    });
}
exports.createBarGraph = createBarGraph;
//# sourceMappingURL=graphs.js.map