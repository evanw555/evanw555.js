import { Canvas, Image, createCanvas } from "canvas";
import { GraphPalette } from "./types";
import { create } from "domain";

/**
 * Joins a list of canvases together horizontally.
 */
export function joinCanvasesHorizontal(canvases: Canvas[], options?: { align?: 'top' | 'bottom' | 'center' }): Canvas {
    const ALIGN = options?.align ?? 'top';
    const WIDTH = canvases.map(c => c.width).reduce((a, b) => a + b);
    const HEIGHT = Math.max(...canvases.map(c => c.height));
    const compositeCanvas = createCanvas(WIDTH, HEIGHT);
    const compositeContext = compositeCanvas.getContext('2d');

    let baseX = 0;
    for (const canvas of canvases) {
        let y: number;
        if (ALIGN === 'top') {
            y = 0;
        } else if (ALIGN === 'bottom') {
            y = HEIGHT - canvas.height;
        } else {
            y = (HEIGHT - canvas.height) / 2;
        }
        compositeContext.drawImage(canvas, baseX, y);
        // Advance the horizontal offset
        baseX += canvas.width;
    }

    return compositeCanvas;
}

/**
 * Joins a list of canvases together vertically.
 */
export function joinCanvasesVertically(canvases: Canvas[], options?: { align?: 'left' | 'right' | 'center' }): Canvas {
    const ALIGN = options?.align ?? 'left';
    const WIDTH = Math.max(...canvases.map(c => c.width));
    const HEIGHT = canvases.map(c => c.height).reduce((a, b) => a + b);
    const compositeCanvas = createCanvas(WIDTH, HEIGHT);
    const compositeContext = compositeCanvas.getContext('2d');

    let baseY = 0;
    for (const canvas of canvases) {
        let x: number;
        if (ALIGN === 'left') {
            x = 0;
        } else if (ALIGN === 'right') {
            x = WIDTH - canvas.width;
        } else {
            x = (WIDTH - canvas.width) / 2;
        }
        compositeContext.drawImage(canvas, x, baseY);
        // Advance the vertical offset
        baseY += canvas.height;
    }

    return compositeCanvas;
}

/**
 * Given some canvas, fills the background using the given palette's background color.
 */
export function fillBackground(canvas: Canvas, palette: GraphPalette): Canvas {
    const compositeCanvas = createCanvas(canvas.width, canvas.height);
    const compositeContext = compositeCanvas.getContext('2d');

    // Fill the background
    compositeContext.fillStyle = palette.background;
    compositeContext.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);

    // Draw the original image
    compositeContext.drawImage(canvas, 0, 0);

    return compositeCanvas;
}

/**
 * Given some image/canvas, return a canvas of that image/canvas trimmed to a circle.
 * @param image The source image/canvas
 * @param options.alpha Optional alpha value of the returned circle
 * @returns The source image/canvas as a circle
 */
export function toCircle(image: Image | Canvas, options?: { alpha?: number }): Canvas {
    const canvas = createCanvas(image.width, image.height);
    const context = canvas.getContext('2d');

    // Set the global alpha
    context.globalAlpha = options?.alpha ?? 1;

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