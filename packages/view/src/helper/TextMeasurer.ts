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
        style: {
            fontSize: number;
            fontFamily: string;
            fontBold: boolean;
            fontItalic: boolean;
        },
        baseline: "alphabetic" | "bottom" | "hanging" | "ideographic" | "middle" | "top",
        text: string
    ) {
        this._context.font = `${style.fontBold ? "bold" : ""} ${style.fontItalic ? "italic" : ""} ${style.fontSize}px ${style.fontFamily}`;
        this._context.textBaseline = baseline;

        const metrics = this._context.measureText(text);
        return [metrics.width, metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent] as [number, number];
    }
}
