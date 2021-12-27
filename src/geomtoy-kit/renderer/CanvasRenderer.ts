import Renderer from "./Renderer";
import CanvasInterface from "./CanvasInterface";

import type { GraphicsGeometryCommand, GraphicsImageCommand, GraphicsTextCommand } from "../../geomtoy/types";
import type Geomtoy from "../../geomtoy";
import type Shape from "../../geomtoy/base/Shape";

/**
 * @category Renderer
 */
export default class CanvasRenderer extends Renderer {
    context: CanvasRenderingContext2D;

    private _container: HTMLCanvasElement;
    private _interface: CanvasInterface;

    private _bufferCanvas = document.createElement("canvas");
    private _buffer = this._bufferCanvas.getContext("2d")!;
    private _bufferFlushScheduled: boolean = false;

    constructor(container: HTMLCanvasElement, geomtoy: Geomtoy) {
        super(geomtoy);
        if (container instanceof HTMLCanvasElement) {
            this._container = container;
            this._interface = new CanvasInterface(this);

            this.context = this.container.getContext("2d")!;

            this.container.style["touch-action" as any] = "none";
            this.container.style["-webkit-tap-highlight-color" as any] = "transparent";
            this.container.style["-webkit-touch-callout" as any] = "none";

            return this;
        }
        throw new Error("[G]Unable to initialize, the container` is not a `HTMLCanvasElement`.");
    }

    get container() {
        return this._container;
    }

    private _getBoundingBox(x: number, y: number, w: number, h: number) {
        return [
            [x, y],
            [x + w, y],
            [x + w, y + h],
            [x, y + h]
        ] as const;
    }

    private _setStyle([noFill = false, noStroke = false] = []) {
        if (noFill) {
            this._buffer.fillStyle = "transparent";
        } else {
            this.style_.fill && (this._buffer.fillStyle = this.style_.fill);
        }
        if (noStroke) {
            this._buffer.strokeStyle = "transparent";
        } else {
            this.style_.stroke && (this._buffer.strokeStyle = this.style_.stroke);

            //see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineWidth#options
            this.style_.strokeWidth ? (this._buffer.lineWidth = this.style_.strokeWidth) : (this._buffer.strokeStyle = "transparent");
            if (this.style_.strokeDash?.length) {
                this._buffer.setLineDash(this.style_.strokeDash);
                this.style_.strokeDashOffset && (this._buffer.lineDashOffset = this.style_.strokeDashOffset);
            }
            this.style_.lineJoin && (this._buffer.lineJoin = this.style_.lineJoin);
            this.style_.miterLimit && (this._buffer.miterLimit = this.style_.miterLimit);
            this.style_.lineCap && (this._buffer.lineCap = this.style_.lineCap);
        }
    }

    private _drawImage(cmd: GraphicsImageCommand, path2D: Path2D, onTop = false) {
        const { imageSource, x, y, width, height, sourceX, sourceY, sourceWidth, sourceHeight } = cmd;

        const obtained = this.imageSourceManager_.successful(imageSource);
        const image = obtained ? this.imageSourceManager_.take(imageSource)! : this.imageSourceManager_.placeholderForCanvas(width, height);

        if (onTop) {
            this._buffer.globalCompositeOperation = "source-over";
        } else {
            this._buffer.globalCompositeOperation = "destination-over";
        }

        this._buffer.save();
        // image orientation
        this._buffer.resetTransform();

        const [tx, ty] = this.display.globalTransformation.transformCoordinates([x, y]);
        const scale = this.display.density * this.display.zoom;
        const [atW, atH] = [width / scale, height / scale];
        const offsetX = this.display.xAxisPositiveOnRight ? 0 : atW;
        const offsetY = this.display.yAxisPositiveOnBottom ? 0 : atH;

        if (!obtained || isNaN(sourceX) || isNaN(sourceY) || isNaN(sourceWidth) || isNaN(sourceHeight)) {
            this._buffer.drawImage(image, tx, ty, width, height);
        } else {
            this._buffer.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, tx, ty, width, height);
        }
        this._buffer.restore();

        // draw bounding box
        const box = this._getBoundingBox(x - offsetX, y - offsetY, atW, atH);
        this._setStyle();
        path2D.moveTo(...box[0]);
        path2D.lineTo(...box[1]);
        path2D.lineTo(...box[2]);
        path2D.lineTo(...box[3]);
        path2D.closePath();
        this._buffer.fill(path2D);
        this._buffer.stroke(path2D);
    }
    private _drawText(cmd: GraphicsTextCommand, path2D: Path2D, onTop = false) {
        const { x, y, text, fontSize, fontFamily, fontBold, fontItalic } = cmd;
        // text baseline
        this._buffer.textBaseline = "hanging";
        // text font style
        let fontStyle = "";
        fontBold && (fontStyle += "bold ");
        fontItalic && (fontStyle += "italic ");
        fontStyle += `${fontSize}px `;
        fontStyle += fontFamily;
        this._buffer.font = fontStyle;

        const [tX, tY] = this.display.globalTransformation.transformCoordinates([x, y]);
        const textBox = this.textMeasurer_.measure({ fontSize, fontFamily, fontBold, fontItalic }, "hanging", text);
        const scale = this.display.density * this.display.zoom;
        const [atW, atH] = [textBox.width / scale, textBox.height / scale];
        const offsetX = this.display.xAxisPositiveOnRight ? 0 : atW;
        const offsetY = this.display.yAxisPositiveOnBottom ? 0 : atH;

        if (onTop) {
            this._buffer.globalCompositeOperation = "source-over";
        } else {
            this._buffer.globalCompositeOperation = "destination-over";
        }
        this._buffer.save();
        // text orientation
        this._buffer.resetTransform();
        // text style
        this._setStyle([false, true]);
        // text content
        this._buffer.fillText(text, tX, tY);
        this._buffer.restore();

        // draw bounding box
        const box = this._getBoundingBox(x - offsetX, y - offsetY, atW, atH);
        this._setStyle([true, true]);
        path2D.moveTo(...box[0]);
        path2D.lineTo(...box[1]);
        path2D.lineTo(...box[2]);
        path2D.lineTo(...box[3]);
        path2D.closePath();

        if (onTop) {
            this._buffer.globalCompositeOperation = "source-over";
        } else {
            this._buffer.globalCompositeOperation = "destination-over";
        }
        this._buffer.fill(path2D);
        this._buffer.stroke(path2D);
    }

    private _drawGeometry(cmds: GraphicsGeometryCommand[], path2D: Path2D, onTop = false) {
        cmds.forEach(cmd => {
            if (cmd.type === "moveTo") path2D.moveTo(cmd.x, cmd.y);
            if (cmd.type === "lineTo") path2D.lineTo(cmd.x, cmd.y);
            if (cmd.type === "bezierCurveTo") path2D.bezierCurveTo(cmd.controlPoint1X, cmd.controlPoint1Y, cmd.controlPoint2X, cmd.controlPoint2Y, cmd.x, cmd.y);
            if (cmd.type === "quadraticBezierCurveTo") path2D.quadraticCurveTo(cmd.controlPointX, cmd.controlPointY, cmd.x, cmd.y);
            if (cmd.type === "arcTo") path2D.ellipse(cmd.centerX, cmd.centerY, cmd.radiusX, cmd.radiusY, cmd.xAxisRotation, cmd.startAngle, cmd.endAngle, !cmd.positive);
            if (cmd.type === "close") path2D.closePath();
        });
        this._setStyle();
        if (onTop) {
            this._buffer.globalCompositeOperation = "source-over";
        } else {
            this._buffer.globalCompositeOperation = "destination-over";
        }
        this._buffer.fill(path2D);
        this._buffer.stroke(path2D);
    }

    private async _flushBuffer() {
        if (this._bufferFlushScheduled) return;
        this._bufferFlushScheduled = true;

        const createdInterface = await this._interface.create();

        Promise.resolve().then(() => {
            this.context.clearRect(0, 0, this.container.width, this.container.height);
            this.context.drawImage(createdInterface, 0, 0);
            this.context.drawImage(this._bufferCanvas, 0, 0);
            this._bufferFlushScheduled = false;
        });
    }

    draw(shape: Shape, onTop = false) {
        this.isShapeOwnerEqual(shape);
        if (!this._bufferFlushScheduled) {
            // Setting canvas's width/height will clear the canvas and reset its transform which we exactly want.
            this._bufferCanvas.width = this.container.width;
            this._bufferCanvas.height = this.container.height;
            this._buffer.setTransform(...this.display.globalTransformation.get());
        }

        const cmds = shape.getGraphics(this.display).commands;
        const path2D = new Path2D();

        const onlyOneCommand = cmds.length === 1 && cmds[0];

        if (onlyOneCommand && onlyOneCommand.type === "text") {
            this._drawText(onlyOneCommand, path2D, onTop);
        } else if (onlyOneCommand && onlyOneCommand.type === "image") {
            this._drawImage(onlyOneCommand, path2D, onTop);
        } else {
            this._drawGeometry(cmds as GraphicsGeometryCommand[], path2D, onTop);
        }
        this._flushBuffer();
        return path2D;
    }
    drawBatch(shapes: Shape[], onTop = false) {
        return shapes.map(o => this.draw(o, onTop));
    }
}
