class TextMeasurer {
    private _canvas = document.createElement("canvas");
    private _context = this._canvas.getContext("2d")!;

    /**
     * Measure the width and height of the text(in identity).
     * @param style 
     * @param baseline 
     * @param text 
     * @returns 
     */
    measure(
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
        return {
            width: metrics.width,
            height: metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
        };
    }
}

export default TextMeasurer;
