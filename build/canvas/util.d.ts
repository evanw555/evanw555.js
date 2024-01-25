import { Canvas, Image } from "canvas";
import { GraphPalette } from "./types";
/**
 * Resizes the provided canvas/image to the specified dimensions.
 * If only one dimension is specified, the aspect ratio will be locked and the other dimension will be inferred.
 * If no action is required, the provided image/canvas will be returned as-is, else a new canvas will be returned.
 * @param image The source canvas/image
 * @param options The specified width and/or height
 * @returns The provided image resized as a new canvas (or the original canvas/image if not resized)
 */
export declare function resize(image: Canvas | Image, options?: {
    width?: number;
    height?: number;
}): Canvas | Image;
/**
 * Joins a list of canvases together horizontally.
 */
export declare function joinCanvasesHorizontal(canvases: Canvas[], options?: {
    align?: 'top' | 'bottom' | 'center' | 'resize-to-first' | 'resize-to-shortest' | 'resize-to-tallest';
}): Canvas;
/**
 * Joins a list of canvases together vertically.
 */
export declare function joinCanvasesVertical(canvases: Canvas[], options?: {
    align?: 'left' | 'right' | 'center' | 'resize-to-first' | 'resize-to-thinnest' | 'resize-to-widest';
}): Canvas;
/**
 * Given some canvas, fills the background using the given palette's background color.
 */
export declare function fillBackground(canvas: Canvas, palette: Pick<GraphPalette, 'background'>): Canvas;
/**
 * Given some image/canvas, return a canvas of that image/canvas trimmed to a circle.
 * @param image The source image/canvas
 * @param options.alpha Optional alpha value of the returned circle
 * @returns The source image/canvas as a circle
 */
export declare function toCircle(image: Image | Canvas, options?: {
    alpha?: number;
}): Canvas;
/**
 * Given a source image and a mask image, return a new canvas including only the parts of the source image
 * that intersect with the provided mask. The mask will be stretched to the size of the source image, if needed.
 * @param image Source image (or canvas)
 * @param mask Mask image (or canvas)
 * @returns The source image with the mask applied
 */
export declare function applyMask(image: Canvas | Image, mask: Canvas | Image): Canvas;
/**
 * Given a source image, return a new canvas with a drop shadow added to all visible parts of the source image.
 * @param image Source image
 * @param options.expandCanvas If true, a margin will be added on all sides to ensure the drop shadow fits. Else, the dimensions will remain the same.
 * @param options.alpha The opacity of the drop shadow (default 0.5)
 * @param options.angle The angle (in radians) of the drop shadow (default southeast)
 * @param options.distance the distance (in pixels) of the drop shadow (default 3)
 * @returns New canvas including the source image with an added drop shadow
 */
export declare function withDropShadow(image: Canvas | Image, options?: {
    expandCanvas?: boolean;
    alpha?: number;
    angle?: number;
    distance?: number;
}): Canvas;
//# sourceMappingURL=util.d.ts.map