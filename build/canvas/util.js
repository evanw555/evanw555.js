"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillBackground = exports.joinCanvasesVertically = exports.joinCanvasesHorizontal = void 0;
const canvas_1 = require("canvas");
/**
 * Joins a list of canvases together horizontally.
 */
function joinCanvasesHorizontal(canvases, options) {
    var _a;
    const ALIGN = (_a = options === null || options === void 0 ? void 0 : options.align) !== null && _a !== void 0 ? _a : 'top';
    const WIDTH = canvases.map(c => c.width).reduce((a, b) => a + b);
    const HEIGHT = Math.max(...canvases.map(c => c.height));
    const compositeCanvas = (0, canvas_1.createCanvas)(WIDTH, HEIGHT);
    const compositeContext = compositeCanvas.getContext('2d');
    let baseX = 0;
    for (const canvas of canvases) {
        let y;
        if (ALIGN === 'top') {
            y = 0;
        }
        else if (ALIGN === 'bottom') {
            y = HEIGHT - canvas.height;
        }
        else {
            y = (HEIGHT - canvas.height) / 2;
        }
        compositeContext.drawImage(canvas, baseX, y);
        // Advance the horizontal offset
        baseX += canvas.width;
    }
    return compositeCanvas;
}
exports.joinCanvasesHorizontal = joinCanvasesHorizontal;
/**
 * Joins a list of canvases together vertically.
 */
function joinCanvasesVertically(canvases, options) {
    var _a;
    const ALIGN = (_a = options === null || options === void 0 ? void 0 : options.align) !== null && _a !== void 0 ? _a : 'left';
    const WIDTH = Math.max(...canvases.map(c => c.width));
    const HEIGHT = canvases.map(c => c.height).reduce((a, b) => a + b);
    const compositeCanvas = (0, canvas_1.createCanvas)(WIDTH, HEIGHT);
    const compositeContext = compositeCanvas.getContext('2d');
    let baseY = 0;
    for (const canvas of canvases) {
        let x;
        if (ALIGN === 'left') {
            x = 0;
        }
        else if (ALIGN === 'right') {
            x = WIDTH - canvas.width;
        }
        else {
            x = (WIDTH - canvas.width) / 2;
        }
        compositeContext.drawImage(canvas, x, baseY);
        // Advance the vertical offset
        baseY += canvas.height;
    }
    return compositeCanvas;
}
exports.joinCanvasesVertically = joinCanvasesVertically;
/**
 * Given some canvas, fills the background using the given palette's background color.
 */
function fillBackground(canvas, palette) {
    const compositeCanvas = (0, canvas_1.createCanvas)(canvas.width, canvas.height);
    const compositeContext = compositeCanvas.getContext('2d');
    // Fill the background
    compositeContext.fillStyle = palette.background;
    compositeContext.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);
    // Draw the original image
    compositeContext.drawImage(canvas, 0, 0);
    return compositeCanvas;
}
exports.fillBackground = fillBackground;
//# sourceMappingURL=util.js.map