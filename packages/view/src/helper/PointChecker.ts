import { FillRule } from "@geomtoy/core";
import Display from "../renderer/Display";
import type { PathLike, Style } from "../types";

const EXTRA_STROKE_WIDTH = 2;
const EXTRA_STROKE_WIDTH_FOR_TOUCH = 5;

export default class PointChecker {
    private static _context = document.createElement("canvas").getContext("2d")!;

    /**
     * Check if point(`x`, `y`)(in identity) is in the path.
     * @param x
     * @param y
     * @param path
     * @param style
     */

    // paths  with fillRule

    static isPointIn(x: number, y: number, path: PathLike, fillRule: FillRule, style: Style, display: Display, hasTouchDevice: boolean) {
        if (path instanceof SVGPathElement) {
            path = new Path2D(path.getAttribute("d")!);
        }

        let pointInStroke;
        let pointInFill;

        if (style.noStroke) {
            pointInStroke = false;
        } else {
            const strokeWidth = (hasTouchDevice ? style.strokeWidth + EXTRA_STROKE_WIDTH_FOR_TOUCH : style.strokeWidth + EXTRA_STROKE_WIDTH) / display.scale;
            this._context.lineWidth = strokeWidth;
            pointInStroke = this._context.isPointInStroke(path, x, y);
        }

        if (style.noFill) {
            pointInFill = false;
        } else {
            pointInFill = this._context.isPointInPath(path, x, y, fillRule);
        }
        return pointInStroke || pointInFill;
    }
}
