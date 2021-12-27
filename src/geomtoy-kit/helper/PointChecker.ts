import type { PathLike } from "../types";

class PointChecker {
    private _canvas = document.createElement("canvas");
    private _context = this._canvas.getContext("2d")!;

    /**
     * Check if point(`x`, `y`)(in identity) is in the path.
     * @param x
     * @param y
     * @param path
     * @param strokeWidth
     * @param closed
     * @returns
     */
    isPointIn(x: number, y: number, path: PathLike, strokeWidth: number, closed: boolean) {
        if (path instanceof SVGPathElement) {
            path = new Path2D(path.getAttribute("d")!);
        }

        if (closed) {
            this._context.lineWidth = strokeWidth;
            const pointInStroke = this._context.isPointInStroke(path, x, y);
            const pointInFill = this._context.isPointInPath(path, x, y);
            return pointInStroke || pointInFill;
        } else {
            this._context.lineWidth = strokeWidth;
            const pointInStroke = this._context.isPointInStroke(path, x, y);
            return pointInStroke;
        }
    }
}

export default PointChecker;
