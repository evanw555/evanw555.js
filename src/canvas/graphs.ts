import canvas, { Canvas } from 'canvas';
import { GraphPalette } from './types';
import { DEFAULT_GRAPH_PALETTE } from './constants';

export async function createBarGraph(entries: { name: string, value: number, imageUrl: string }[], options?: { showNames?: boolean, title?: string, rowHeight?: number, width?: number, palette?: GraphPalette }): Promise<Canvas> {
    const ROW_HEIGHT = options?.rowHeight ?? 40;
    const WIDTH = options?.width ?? 480
    const SHOW_NAMES = options?.showNames ?? true;
    const PALETTE = options?.palette ?? DEFAULT_GRAPH_PALETTE;

    const MARGIN = 8;
    const PADDING = 4;

    const TOTAL_ROWS = entries.length + (options?.title ? 1 : 0);
    const HEIGHT = TOTAL_ROWS * ROW_HEIGHT + (TOTAL_ROWS + 1) * MARGIN;

    const c = canvas.createCanvas(WIDTH, HEIGHT);
    const context = c.getContext('2d');

    // Fill in the background
    context.fillStyle = PALETTE.background;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    // Draw the title
    let baseY = MARGIN;
    if (options?.title) {
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
        let image: canvas.Image | undefined = undefined;
        try {
            image = await canvas.loadImage(entry.imageUrl);
        } catch (err) {
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
        const MAX_BAR_WIDTH = WIDTH - baseX - MARGIN;
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
        } else {
            // Else, write it outside the bar
            context.fillText(valueText, baseX + barWidth + MARGIN, baseY + 0.75 * ROW_HEIGHT);
        }
        // Advance vertical offset
        baseY += ROW_HEIGHT + MARGIN;
    }

    return c;
}