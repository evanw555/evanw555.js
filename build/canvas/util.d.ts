import { Canvas, Image } from "canvas";
import { GraphPalette } from "./types";
/**
 * Joins a list of canvases together horizontally.
 */
export declare function joinCanvasesHorizontal(canvases: Canvas[], options?: {
    align?: 'top' | 'bottom' | 'center';
}): Canvas;
/**
 * Joins a list of canvases together vertically.
 */
export declare function joinCanvasesVertically(canvases: Canvas[], options?: {
    align?: 'left' | 'right' | 'center';
}): Canvas;
/**
 * Given some canvas, fills the background using the given palette's background color.
 */
export declare function fillBackground(canvas: Canvas, palette: GraphPalette): Canvas;
/**
 * Given some image/canvas, return a canvas of that image/canvas trimmed to a circle.
 * @param image The source image/canvas
 * @param options.alpha Optional alpha value of the returned circle
 * @returns The source image/canvas as a circle
 */
export declare function toCircle(image: Image | Canvas, options?: {
    alpha?: number;
}): Canvas;
//# sourceMappingURL=util.d.ts.map