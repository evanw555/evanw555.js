import { Canvas } from "canvas";
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
//# sourceMappingURL=util.d.ts.map