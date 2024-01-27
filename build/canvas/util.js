"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withDropShadow = exports.applyMask = exports.toCircle = exports.fillBackground = exports.joinCanvasesVertical = exports.joinCanvasesHorizontal = exports.resize = void 0;
const canvas_1 = require("canvas");
/**
 * Resizes the provided canvas/image to the specified dimensions.
 * If only one dimension is specified, the aspect ratio will be locked and the other dimension will be inferred.
 * If no action is required, the provided image/canvas will be returned as-is, else a new canvas will be returned.
 * @param image The source canvas/image
 * @param options The specified width and/or height
 * @returns The provided image resized as a new canvas (or the original canvas/image if not resized)
 */
function resize(image, options) {
    var _a, _b;
    if (!(options === null || options === void 0 ? void 0 : options.width) && !(options === null || options === void 0 ? void 0 : options.height)) {
        throw new Error('Width and/or height must be specified when resizing');
    }
    // We know that if one of these is undefined, the other must be defined
    const WIDTH = (_a = options === null || options === void 0 ? void 0 : options.width) !== null && _a !== void 0 ? _a : ((options === null || options === void 0 ? void 0 : options.height) * image.width / image.height);
    const HEIGHT = (_b = options === null || options === void 0 ? void 0 : options.height) !== null && _b !== void 0 ? _b : ((options === null || options === void 0 ? void 0 : options.width) * image.height / image.width);
    // Optimization just in case no work needs to be done
    if (WIDTH === image.width && HEIGHT === image.height) {
        return image;
    }
    const canvas = (0, canvas_1.createCanvas)(WIDTH, HEIGHT);
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, WIDTH, HEIGHT);
    return canvas;
}
exports.resize = resize;
/**
 * Joins a list of canvases together horizontally.
 */
function joinCanvasesHorizontal(canvases, options) {
    var _a, _b;
    const ALIGN = (_a = options === null || options === void 0 ? void 0 : options.align) !== null && _a !== void 0 ? _a : 'top';
    const SPACING = (_b = options === null || options === void 0 ? void 0 : options.spacing) !== null && _b !== void 0 ? _b : 0;
    if (!canvases || canvases.length === 0) {
        throw new Error('Cannot join an empty list of canvases');
    }
    // First, find the target height if needed
    let targetHeight = undefined;
    if (ALIGN === 'resize-to-first') {
        targetHeight = canvases[0].height;
    }
    else if (ALIGN === 'resize-to-shortest') {
        targetHeight = Math.min(...canvases.map(c => c.height));
    }
    else if (ALIGN === 'resize-to-tallest') {
        targetHeight = Math.max(...canvases.map(c => c.height));
    }
    // Resize all canvases as needed
    const resizedCanvases = canvases.map(c => resize(c, { height: targetHeight !== null && targetHeight !== void 0 ? targetHeight : c.height }));
    // Prepare the composite canvas as per the resized canvas dimensions
    const WIDTH = resizedCanvases.map(c => c.width).reduce((a, b) => a + b) + SPACING * (resizedCanvases.length - 1);
    const HEIGHT = Math.max(...resizedCanvases.map(c => c.height));
    const compositeCanvas = (0, canvas_1.createCanvas)(WIDTH, HEIGHT);
    const compositeContext = compositeCanvas.getContext('2d');
    let baseX = 0;
    for (const resizedCanvas of resizedCanvases) {
        // Draw the resized canvas at the proper vertical alignment
        let y;
        if (ALIGN === 'bottom') {
            y = HEIGHT - resizedCanvas.height;
        }
        else if (ALIGN === 'center') {
            y = (HEIGHT - resizedCanvas.height) / 2;
        }
        else {
            // Top or resize-aligned
            y = 0;
        }
        compositeContext.drawImage(resizedCanvas, baseX, y);
        // Advance the horizontal offset
        baseX += resizedCanvas.width + SPACING;
    }
    return compositeCanvas;
}
exports.joinCanvasesHorizontal = joinCanvasesHorizontal;
/**
 * Joins a list of canvases together vertically.
 */
function joinCanvasesVertical(canvases, options) {
    var _a, _b;
    const ALIGN = (_a = options === null || options === void 0 ? void 0 : options.align) !== null && _a !== void 0 ? _a : 'left';
    const SPACING = (_b = options === null || options === void 0 ? void 0 : options.spacing) !== null && _b !== void 0 ? _b : 0;
    if (!canvases || canvases.length === 0) {
        throw new Error('Cannot join an empty list of canvases');
    }
    // First, find the target width if needed
    let targetWidth = undefined;
    if (ALIGN === 'resize-to-first') {
        targetWidth = canvases[0].width;
    }
    else if (ALIGN === 'resize-to-thinnest') {
        targetWidth = Math.min(...canvases.map(c => c.width));
    }
    else if (ALIGN === 'resize-to-widest') {
        targetWidth = Math.max(...canvases.map(c => c.width));
    }
    // Resize all canvases as needed
    const resizedCanvases = canvases.map(c => resize(c, { width: targetWidth !== null && targetWidth !== void 0 ? targetWidth : c.width }));
    // Prepare the composite canvas as per the resized canvas dimensions
    const WIDTH = Math.max(...resizedCanvases.map(c => c.width));
    const HEIGHT = resizedCanvases.map(c => c.height).reduce((a, b) => a + b) + SPACING * (resizedCanvases.length - 1);
    const compositeCanvas = (0, canvas_1.createCanvas)(WIDTH, HEIGHT);
    const compositeContext = compositeCanvas.getContext('2d');
    let baseY = 0;
    for (const resizedCanvas of resizedCanvases) {
        // Draw the resized canvas at the proper horizontal alignment
        let x;
        if (ALIGN === 'right') {
            x = WIDTH - resizedCanvas.width;
        }
        else if (ALIGN === 'center') {
            x = (WIDTH - resizedCanvas.width) / 2;
        }
        else {
            // Left or resize-aligned
            x = 0;
        }
        compositeContext.drawImage(resizedCanvas, x, baseY);
        // Advance the vertical offset
        baseY += resizedCanvas.height + SPACING;
    }
    return compositeCanvas;
}
exports.joinCanvasesVertical = joinCanvasesVertical;
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
/**
 * Given a source image and a mask image, return a new canvas including only the parts of the source image
 * that intersect with the provided mask. The mask will be stretched to the size of the source image, if needed.
 * @param image Source image (or canvas)
 * @param mask Mask image (or canvas)
 * @returns The source image with the mask applied
 */
function applyMask(image, mask) {
    // Create a canvas in the size of the image
    const canvas = (0, canvas_1.createCanvas)(image.width, image.height);
    const context = canvas.getContext('2d');
    // First, draw the image
    context.drawImage(image, 0, 0);
    // Then, apply the mask stretched to the image dimensions
    context.save();
    context.globalCompositeOperation = 'destination-in';
    context.drawImage(mask, 0, 0, image.width, image.height);
    context.restore();
    return canvas;
}
exports.applyMask = applyMask;
/**
 * Given a source image, return a new canvas with a drop shadow added to all visible parts of the source image.
 * @param image Source image
 * @param options.expandCanvas If true, a margin will be added on all sides to ensure the drop shadow fits. Else, the dimensions will remain the same.
 * @param options.alpha The opacity of the drop shadow (default 0.5)
 * @param options.angle The angle (in radians) of the drop shadow (default southeast)
 * @param options.distance the distance (in pixels) of the drop shadow (default 3)
 * @returns New canvas including the source image with an added drop shadow
 */
function withDropShadow(image, options) {
    var _a, _b, _c, _d;
    const expandCanvas = (_a = options === null || options === void 0 ? void 0 : options.expandCanvas) !== null && _a !== void 0 ? _a : false;
    const alpha = (_b = options === null || options === void 0 ? void 0 : options.alpha) !== null && _b !== void 0 ? _b : 0.5;
    const angle = (_c = options === null || options === void 0 ? void 0 : options.angle) !== null && _c !== void 0 ? _c : Math.PI * 1.75;
    const distance = (_d = options === null || options === void 0 ? void 0 : options.distance) !== null && _d !== void 0 ? _d : 3;
    const dx = distance * Math.cos(angle);
    const dy = distance * -Math.sin(angle);
    const expansion = expandCanvas ? distance : 0;
    const width = image.width + 2 * expansion;
    const height = image.height + 2 * expansion;
    const canvas = (0, canvas_1.createCanvas)(width, height);
    const context = canvas.getContext('2d');
    context.save();
    // First, draw the offset source image as a mask for where the shadow will appear
    const shadowX = dx + expansion;
    const shadowY = dy + expansion;
    context.drawImage(image, shadowX, shadowY);
    // Then, fill the shadow where it intersects with the mask
    context.globalCompositeOperation = 'source-in';
    context.globalAlpha = alpha;
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    // Draw the source image on top
    context.restore();
    context.drawImage(image, expansion, expansion);
    return canvas;
}
exports.withDropShadow = withDropShadow;
//# sourceMappingURL=util.js.map