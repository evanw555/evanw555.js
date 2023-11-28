import { Canvas } from 'canvas';
import { GraphPalette } from './types';
export declare function createBarGraph(entries: {
    name: string;
    value: number;
    imageUrl: string;
}[], options?: {
    showNames?: boolean;
    title?: string;
    rowHeight?: number;
    palette?: GraphPalette;
}): Promise<Canvas>;
//# sourceMappingURL=graphs.d.ts.map