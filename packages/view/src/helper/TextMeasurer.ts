import { Maths } from "@geomtoy/util";

/**
 * Reference:
 * @see https://erikonarheim.com/posts/canvas-text-metrics/
 */
export default class TextMeasurer {
    private static _context = document.createElement("canvas").getContext("2d")!;

    /**
     * Measure the width and height of the text(in identity).
     * @param style
     * @param baseline
     * @param text
     * @returns
     */
    static measure(
        coordinates: [number, number],
        text: string,
        baseline: CanvasTextBaseline,
        style: {
            fontSize: number;
            fontFamily: string;
            fontBold: boolean;
            fontItalic: boolean;
        }
    ) {
        this._context.font = `${style.fontBold ? "bold" : ""} ${style.fontItalic ? "italic" : ""} ${style.fontSize}px ${style.fontFamily}`;
        this._context.textBaseline = baseline as CanvasTextBaseline;
        const [baseX, baseY] = coordinates;
        const metrics = this._context.measureText(text);
        // We use `fontBoundingBoxAscent/Descent` other than `actualBoundingBoxAscent/Descent`.
        // This makes `A` and `z` have the same height of their bounding box.
        return {
            left: baseX - metrics.actualBoundingBoxLeft,
            right: baseX + metrics.actualBoundingBoxRight,
            top: baseY - metrics.fontBoundingBoxAscent,
            bottom: baseY - metrics.fontBoundingBoxDescent,
            dx: metrics.actualBoundingBoxLeft, // how many pixel horizontal should we add to make `x` as the left.
            dy: metrics.fontBoundingBoxAscent, // how many pixel vertical should we add to make `y` as the top.
            width: Maths.abs(metrics.actualBoundingBoxLeft) + Maths.abs(metrics.actualBoundingBoxRight),
            height: Maths.abs(metrics.fontBoundingBoxAscent) + Maths.abs(metrics.fontBoundingBoxDescent)
        };
    }
}
