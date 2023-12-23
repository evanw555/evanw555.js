"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCircle = exports.fillBackground = exports.joinCanvasesVertically = exports.joinCanvasesHorizontal = void 0;
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
/**
 * Given some image/canvas, return a canvas of that image/canvas trimmed to a circle.
 * @param image The source image/canvas
 * @param options.alpha Optional alpha value of the returned circle
 * @returns The source image/canvas as a circle
 */
function toCircle(image, options) {
    var _a;
    const canvas = (0, canvas_1.createCanvas)(image.width, image.height);
    const context = canvas.getContext('2d');
    // Set the global alpha
    context.globalAlpha = (_a = options === null || options === void 0 ? void 0 : options.alpha) !== null && _a !== void 0 ? _a : 1;
    // Save the context so we can undo the clipping region at a later time
    context.save();
    // Define the clipping region as an 360 degrees arc at point x and y
    const centerX = image.width / 2;
    const centerY = image.height / 2;
    const radius = Math.min(centerX, centerY);
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
    // Clip!
    context.clip();
    // Draw the image at imageX, imageY
    context.drawImage(image, centerX - radius, centerY - radius, radius * 2, radius * 2);
    // Restore the context to undo the clipping
    context.restore();
    context.globalAlpha = 1;
    return canvas;
}
exports.toCircle = toCircle;
//# sourceMappingURL=util.js.map