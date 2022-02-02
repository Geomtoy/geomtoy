import { Box } from "@geomtoy/util";
import Renderer from "./Renderer";
import CanvasInterface from "./CanvasInterface";

import type { InterfaceOptions } from "../types";
import type { GraphicsGeometryCommand, GraphicsImageCommand, GraphicsTextCommand } from "@geomtoy/core";
import type Geomtoy from "@geomtoy/core";
import type { Shape } from "@geomtoy/core";

/**
 * @category Renderer
 */
export default class CanvasRenderer extends Renderer {
    private _surface: CanvasRenderingContext2D;
    private _interfaceSurface: CanvasRenderingContext2D;

    private _container: HTMLCanvasElement;
    private _interface: CanvasInterface;
    private _buffer = document.createElement("canvas").getContext("2d")!;
    private _bufferFlushScheduled = false;

    constructor(container: HTMLCanvasElement, geomtoy: Geomtoy, interfaceOptions: Partial<InterfaceOptions> = {}) {
        super(geomtoy);
        if (container instanceof HTMLCanvasElement) {
            this._container = container;
            this.manageRendererInitialized_();
            this._interface = new CanvasInterface(this);
            this._interface.options(interfaceOptions);

            this.container.style["touch-action" as any] = "none";
            this.container.style["-webkit-tap-highlight-color" as any] = "transparent";
            this.container.style["-webkit-touch-callout" as any] = "none";

            this._surface = this.container.getContext("2d")!;
            this._interfaceSurface = this._surface;

            return this;
        }
        throw new Error("[G]Unable to initialize, the container` is not a `HTMLCanvasElement`.");
    }

    get container() {
        return this._container;
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
            this.style_.strokeLineJoin && (this._buffer.lineJoin = this.style_.strokeLineJoin);
            this.style_.strokeMiterLimit && (this._buffer.miterLimit = this.style_.strokeMiterLimit);
            this.style_.strokeLineCap && (this._buffer.lineCap = this.style_.strokeLineCap);
        }
    }
    private _drawImage(cmd: GraphicsImageCommand, path: Path2D, onTop: boolean) {
        const { imageSource, x, y, width, height, sourceX, sourceY, sourceWidth, sourceHeight } = cmd;
        const [tx, ty] = this.display.globalTransformation.transformCoordinates([x, y]);
        const scale = this.display.density * this.display.zoom;
        const imageScale = this.constantImage ? this.display.density : this.display.density * this.display.zoom;
        const [imageWidth, imageHeight] = [width * imageScale, height * imageScale];
        const [atImageWidth, atImageHeight] = [imageWidth / scale, imageHeight / scale];
        const [offsetX, offsetY] = [this.display.xAxisPositiveOnRight ? 0 : imageWidth, this.display.yAxisPositiveOnBottom ? 0 : imageHeight];

        const obtained = this.imageSourceManager.successful(imageSource);
        const image = obtained ? this.imageSourceManager.take(imageSource)! : this.imageSourceManager.placeholderForCanvas(imageWidth, imageHeight);

        const b: [number, number, number, number] = [x, y, atImageWidth, atImageHeight];
        path.moveTo(...Box.nn(b));
        path.lineTo(...Box.mn(b));
        path.lineTo(...Box.mm(b));
        path.lineTo(...Box.nm(b));
        path.closePath();

        this._buffer.save();
        this._setStyle([, true]);
        if (onTop) {
            this._buffer.globalCompositeOperation = "source-over";
            this._buffer.resetTransform();
            if (obtained && !isNaN(sourceX) && !isNaN(sourceY) && !isNaN(sourceWidth) && !isNaN(sourceHeight)) {
                this._buffer.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, tx - offsetX, ty - offsetY, imageWidth, imageHeight);
            } else {
                this._buffer.drawImage(image, tx - offsetX, ty - offsetY, imageWidth, imageHeight);
            }
            this._buffer.setTransform(...this.display.globalTransformation.toArray());
            this._buffer.fill(path);
            this._buffer.stroke(path);
        } else {
            this._buffer.globalCompositeOperation = "destination-over";
            this._buffer.fill(path);
            this._buffer.stroke(path);
            this._buffer.resetTransform();
            if (obtained && !isNaN(sourceX) && !isNaN(sourceY) && !isNaN(sourceWidth) && !isNaN(sourceHeight)) {
                this._buffer.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, tx - offsetX, ty - offsetY, imageWidth, imageHeight);
            } else {
                this._buffer.drawImage(image, tx - offsetX, ty - offsetY, imageWidth, imageHeight);
            }
        }
        this._buffer.restore();
    }
    private _drawText(cmd: GraphicsTextCommand, path: Path2D, onTop: boolean) {
        const { x, y, text, fontSize, fontFamily, fontBold, fontItalic } = cmd;

        const [tx, ty] = this.display.globalTransformation.transformCoordinates([x, y]);
        const scale = this.display.density * this.display.zoom;
        const [textWidth, textHeight] = this.textMeasurer.measure({ fontSize, fontFamily, fontBold, fontItalic }, "hanging", text);
        const [atTextWidth, atTextHeight] = [textWidth / scale, textHeight / scale];
        const [offsetX, offsetY] = [this.display.xAxisPositiveOnRight ? 0 : textWidth, this.display.yAxisPositiveOnBottom ? 0 : textHeight];

        this._buffer.save();
        this._buffer.textBaseline = "hanging";
        let fontStyle = "";
        fontBold && (fontStyle += "bold ");
        fontItalic && (fontStyle += "italic ");
        fontStyle += `${fontSize}px `;
        fontStyle += fontFamily;
        this._buffer.font = fontStyle;
        this._buffer.globalCompositeOperation = onTop ? "source-over" : "destination-over";
        this._buffer.resetTransform();
        this._setStyle([, true]);
        this._buffer.fillText(text, tx - offsetX, ty - offsetY);
        this._buffer.restore();

        // implicit bounding box
        const b: [number, number, number, number] = [x, y, atTextWidth, atTextHeight];
        path.moveTo(...Box.nn(b));
        path.lineTo(...Box.mn(b));
        path.lineTo(...Box.mm(b));
        path.lineTo(...Box.nm(b));
        path.closePath();
    }
    private _drawGeometry(cmds: GraphicsGeometryCommand[], path: Path2D, onTop: boolean) {
        cmds.forEach(cmd => {
            if (cmd.type === "moveTo") path.moveTo(cmd.x, cmd.y);
            if (cmd.type === "lineTo") path.lineTo(cmd.x, cmd.y);
            if (cmd.type === "bezierCurveTo") path.bezierCurveTo(cmd.controlPoint1X, cmd.controlPoint1Y, cmd.controlPoint2X, cmd.controlPoint2Y, cmd.x, cmd.y);
            if (cmd.type === "quadraticBezierCurveTo") path.quadraticCurveTo(cmd.controlPointX, cmd.controlPointY, cmd.x, cmd.y);
            if (cmd.type === "arcTo") path.ellipse(cmd.centerX, cmd.centerY, cmd.radiusX, cmd.radiusY, cmd.xAxisRotation, cmd.startAngle, cmd.endAngle, !cmd.positive);
            if (cmd.type === "close") path.closePath();
        });
        this._buffer.save();
        this._setStyle();
        this._buffer.globalCompositeOperation = onTop ? "source-over" : "destination-over";
        this._buffer.fill(path);
        this._buffer.stroke(path);
        this._buffer.restore();
    }
    private async _flushBuffer() {
        if (this._bufferFlushScheduled) return;
        this._bufferFlushScheduled = true;

        const createdInterface = await this._interface.create();

        Promise.resolve().then(() => {
            this._surface.clearRect(0, 0, this.container.width, this.container.height);
            this._interfaceSurface.drawImage(createdInterface, 0, 0);
            this._surface.drawImage(this._buffer.canvas, 0, 0);
            this._bufferFlushScheduled = false;
        });
    }
    private _initBuffer() {
        if (!this._bufferFlushScheduled) {
            // Setting canvas's width/height will clear the canvas and reset its transform which we exactly want.
            this._buffer.canvas.width = this.container.width;
            this._buffer.canvas.height = this.container.height;
            this._buffer.setTransform(...this.display.globalTransformation.toArray());
        }
    }

    draw(shape: Shape, onTop = false) {
        this.isShapeOwnerEqual_(shape);
        this._initBuffer();

        const cmds = shape.getGraphics(this.display).commands;
        const path = new Path2D();
        const onlyOneCommand = cmds.length === 1 && cmds[0];
        if (onlyOneCommand && onlyOneCommand.type === "text") {
            this._drawText(onlyOneCommand, path, onTop);
        } else if (onlyOneCommand && onlyOneCommand.type === "image") {
            this._drawImage(onlyOneCommand, path, onTop);
        } else {
            this._drawGeometry(cmds as GraphicsGeometryCommand[], path, onTop);
        }

        this._flushBuffer();
        return path;
    }
    drawBatch(shapes: Shape[], onTop = false) {
        return shapes.map(shape => this.draw(shape, onTop));
    }
}
