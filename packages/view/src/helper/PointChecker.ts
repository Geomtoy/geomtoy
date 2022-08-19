import type { PathLike, Style } from "../types";

const EXTRA_STROKE_WIDTH_FOR_TOUCH = 2;

export default class PointChecker {
    private static _context = document.createElement("canvas").getContext("2d")!;

    /**
     * Check if point(`x`, `y`)(in identity) is in the path.
     * @param x
     * @param y
     * @param path
     * @param style
     */
    static isPointIn(x: number, y: number, path: PathLike, style: Style, hasTouchDevice: boolean) {
        if (path instanceof SVGPathElement) {
            path = new Path2D(path.getAttribute("d")!);
        }

        let pointInStroke;
        let pointInFill;

        if (style.noStroke) {
            pointInStroke = false;
        } else {
            this._context.lineWidth = hasTouchDevice ? style.strokeWidth + EXTRA_STROKE_WIDTH_FOR_TOUCH : style.strokeWidth;
            pointInStroke = this._context.isPointInStroke(path, x, y);
        }

        if (style.noFill) {
            pointInFill = false;
        } else {
            pointInFill = this._context.isPointInPath(path, x, y);
        }
        return pointInStroke || pointInFill;
    }
}
