import { Maths } from "@geomtoy/util";
import ImageSourceManager from "./ImageSourceManager";

export default class CanvasImageSourceManager extends ImageSourceManager {
    private _placeholderContainer = document.createElement("canvas");

    placeholder(width: number, height: number, backgroundColor: string = "rgba(0, 0, 0, 0.3)", color: string = "rgba(0, 0, 0, 0.5)") {
        this._placeholderContainer.width = width;
        this._placeholderContainer.height = height;
        const context = this._placeholderContainer.getContext("2d")!;
        const size = (width < height ? width : height) / 3;
        const boxSize = size / 5;

        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, width, height);

        context.fillStyle = color;
        context.transform(Maths.SQRT1_2, Maths.SQRT1_2, -Maths.SQRT1_2, Maths.SQRT1_2, width / 2, (height - size * Maths.SQRT2) / 2);

        const path = new Path2D(`
            M0,0V${boxSize * 5}H${boxSize * 5}V${boxSize * 2}H${boxSize * 4}V${boxSize * 4}H${boxSize}V${boxSize}H${boxSize * 5}V0Z
            M${boxSize * 2},${boxSize * 2}V${boxSize * 3}H${boxSize * 3}V${boxSize * 2}Z
        `);
        context.fill(path);
        return this._placeholderContainer;
    }
}
