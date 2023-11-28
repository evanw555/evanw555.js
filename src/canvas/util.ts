import { Canvas, createCanvas } from "canvas";
import { GraphPalette } from "./types";

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
