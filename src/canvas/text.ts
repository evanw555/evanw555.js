import { Canvas, createCanvas } from "canvas";

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
export function getTextLabel(text: string, width: number, height: number, options?: { align?: 'center' | 'left' | 'right', font?: string, style?: string, alpha?: number, margin?: number }): Canvas {
    const ALIGN = options?.align ?? 'center';
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    context.font = options?.font ?? `${height * 0.6}px sans-serif`;
    context.fillStyle = options?.style ?? 'white';
    context.globalAlpha = options?.alpha ?? 1;

    const ascent = context.measureText(text).actualBoundingBoxAscent;
    const verticalMargin = (height - ascent) / 2;

    if (ALIGN === 'center') {
        const textWidth = context.measureText(text).width;
        const margin = options?.margin ?? 0;
        const usableWidth = width - (2 * margin);
        if (textWidth > usableWidth) {
            // If the text is too wide for the label, compress it
            context.fillText(text, Math.floor(margin), verticalMargin + ascent, usableWidth);
        } else {
            // If the text is smaller than the label, center it
            context.fillText(text, Math.floor(margin + (usableWidth - textWidth) / 2), verticalMargin + ascent);
        }
    } else if (ALIGN === 'right') {
        context.fillText(text, Math.floor(width - context.measureText(text).width), verticalMargin + ascent, width);
    } else {
        context.fillText(text, 0, verticalMargin + ascent, width);
    }

    context.restore();

    return canvas;
}