import { Box, TransformationMatrix } from "@geomtoy/util";
import TextMeasurer from "../helper/TextMeasurer";
import Renderer from "./Renderer";
import CanvasInterface from "./CanvasInterface";
import Display from "./Display";
import CanvasImageSourceManager from "./CanvasImageSourceManager";

import type { DisplaySettings, InterfaceSettings } from "../types";
import { GeometryGraphics, GeometryGraphicsCommand, ImageGraphicsCommand, TextGraphicsCommand, ImageGraphics, TextGraphics, FillRule } from "@geomtoy/core";
import type { Shape } from "@geomtoy/core";

export default class CanvasRenderer extends Renderer {
    private _surface: CanvasRenderingContext2D;
    private _interfaceSurface: CanvasRenderingContext2D;
    private _buffer = document.createElement("canvas").getContext("2d")!;
    private _bufferFlushScheduled = false;

    private _container: HTMLCanvasElement;
    private _interface: CanvasInterface;
    private _display: Display;
    private _imageSourceManager: CanvasImageSourceManager;

    constructor(container: HTMLCanvasElement, interfaceSettings: Partial<InterfaceSettings> = {}, displaySettings: Partial<DisplaySettings> = {}) {
        super();
        if (container instanceof HTMLCanvasElement) {
            this._container = container;
            this.manageRendererInitialized_();
            this._interface = new CanvasInterface(this, interfaceSettings);
            this._display = new Display(this, displaySettings);
            this._imageSourceManager = new CanvasImageSourceManager();

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
    get interface() {
        return this._interface;
    }
    get display() {
        return this._display;
    }
    get imageSourceManager() {
        return this._imageSourceManager;
    }

    private _setStyle() {
        this.style_.fill && (this._buffer.fillStyle = this.style_.fill);
        this.style_.stroke && (this._buffer.strokeStyle = this.style_.stroke);
        this.style_.strokeWidth && (this._buffer.lineWidth = this.style_.strokeWidth);
        this.style_.strokeDash?.length && this._buffer.setLineDash(this.style_.strokeDash);
        this.style_.strokeDashOffset && (this._buffer.lineDashOffset = this.style_.strokeDashOffset);
        this.style_.strokeLineJoin && (this._buffer.lineJoin = this.style_.strokeLineJoin);
        this.style_.strokeMiterLimit && (this._buffer.miterLimit = this.style_.strokeMiterLimit);
        this.style_.strokeLineCap && (this._buffer.lineCap = this.style_.strokeLineCap);
    }
    private _drawImage(cmd: ImageGraphicsCommand, path: Path2D, onTop: boolean) {
        const { imageSource, x, y, width, height, sourceX, sourceY, sourceWidth, sourceHeight } = cmd;
        const [tx, ty] = TransformationMatrix.transformCoordinates(this.display.globalTransformation, [x, y]);
        const scale = this.display.density * this.display.zoom;
        const imageScale = this.constantImage ? this.display.density : this.display.density * this.display.zoom;
        const [imageWidth, imageHeight] = [width * imageScale, height * imageScale];
        const [atImageWidth, atImageHeight] = [imageWidth / scale, imageHeight / scale];
        const [offsetX, offsetY] = [this.display.xAxisPositiveOnRight ? 0 : imageWidth, this.display.yAxisPositiveOnBottom ? 0 : imageHeight];

        const obtained = this.imageSourceManager.successful(imageSource);
        const image = obtained ? this.imageSourceManager.take(imageSource)! : this.imageSourceManager.placeholder(imageWidth, imageHeight);

        const b: [number, number, number, number] = [x, y, atImageWidth, atImageHeight];
        path.moveTo(...Box.nn(b));
        path.lineTo(...Box.mn(b));
        path.lineTo(...Box.mm(b));
        path.lineTo(...Box.nm(b));
        path.closePath();

        this._buffer.save();
        this._setStyle();
        if (onTop) {
            this._buffer.globalCompositeOperation = "source-over";
            this._buffer.resetTransform();
            if (obtained && !isNaN(sourceX) && !isNaN(sourceY) && !isNaN(sourceWidth) && !isNaN(sourceHeight)) {
                this._buffer.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, tx - offsetX, ty - offsetY, imageWidth, imageHeight);
            } else {
                this._buffer.drawImage(image, tx - offsetX, ty - offsetY, imageWidth, imageHeight);
            }
            this._buffer.setTransform(...this.display.globalTransformation);
            this.style_.noFill || this._buffer.fill(path);
            this.style_.noStroke || this._buffer.stroke(path);
        } else {
            this._buffer.globalCompositeOperation = "destination-over";
            this.style_.noFill || this._buffer.fill(path);
            this.style_.noStroke || this._buffer.stroke(path);
            this._buffer.resetTransform();
            if (obtained && !isNaN(sourceX) && !isNaN(sourceY) && !isNaN(sourceWidth) && !isNaN(sourceHeight)) {
                this._buffer.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, tx - offsetX, ty - offsetY, imageWidth, imageHeight);
            } else {
                this._buffer.drawImage(image, tx - offsetX, ty - offsetY, imageWidth, imageHeight);
            }
        }
        this._buffer.restore();
    }
    private _drawText(cmd: TextGraphicsCommand, path: Path2D, onTop: boolean) {
        const { x, y, text, fontSize, fontFamily, fontBold, fontItalic } = cmd;

        const [tx, ty] = TransformationMatrix.transformCoordinates(this.display.globalTransformation, [x, y]);
        const scale = this.display.density * this.display.zoom;
        const [textWidth, textHeight] = TextMeasurer.measure({ fontSize, fontFamily, fontBold, fontItalic }, "hanging", text);
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
        this._setStyle();
        this.style_.noFill || this._buffer.fillText(text, tx - offsetX, ty - offsetY);
        this.style_.noStroke || this._buffer.strokeText(text, tx - offsetX, ty - offsetY);
        this._buffer.restore();

        // implicit bounding box
        const b: [number, number, number, number] = [x, y, atTextWidth, atTextHeight];
        path.moveTo(...Box.nn(b));
        path.lineTo(...Box.mn(b));
        path.lineTo(...Box.mm(b));
        path.lineTo(...Box.nm(b));
        path.closePath();
    }
    private _drawGeometry(cmds: GeometryGraphicsCommand[], fillRule: FillRule, path: Path2D, onTop: boolean) {
        cmds.forEach(cmd => {
            if (cmd.type === "moveTo") path.moveTo(cmd.x, cmd.y);
            if (cmd.type === "lineTo") path.lineTo(cmd.x, cmd.y);
            if (cmd.type === "bezierTo") path.bezierCurveTo(cmd.controlPoint1X, cmd.controlPoint1Y, cmd.controlPoint2X, cmd.controlPoint2Y, cmd.x, cmd.y);
            if (cmd.type === "quadraticBezierTo") path.quadraticCurveTo(cmd.controlPointX, cmd.controlPointY, cmd.x, cmd.y);
            if (cmd.type === "arcTo") path.ellipse(cmd.centerX, cmd.centerY, cmd.radiusX, cmd.radiusY, cmd.rotation, cmd.startAngle, cmd.endAngle, !cmd.positive);
            if (cmd.type === "close") path.closePath();
        });
        this._buffer.save();
        this._setStyle();
        this._buffer.globalCompositeOperation = onTop ? "source-over" : "destination-over";

        if ((this.style_.paintOrder === "fill") === onTop) {
            !this.style_.noFill && this._buffer.fill(path, fillRule);
            !this.style_.noStroke && this._buffer.stroke(path);
        } else {
            !this.style_.noStroke && this._buffer.stroke(path);
            !this.style_.noFill && this._buffer.fill(path, fillRule);
        }
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
            this._buffer.setTransform(...this.display.globalTransformation);
        }
    }

    draw(shape: Shape, onTop = false) {
        this._initBuffer();

        const path = new Path2D();
        const g = shape.getGraphics(this.display);
        if (g instanceof TextGraphics) {
            g.command && this._drawText(g.command, path, onTop);
        }
        if (g instanceof ImageGraphics) {
            g.command && this._drawImage(g.command, path, onTop);
        }
        if (g instanceof GeometryGraphics) {
            g.commands.length && this._drawGeometry(g.commands, g.fillRule, path, onTop);
        }
        this._flushBuffer();
        return path;
    }
    drawBatch(shapes: Shape[], onTop = false) {
        return shapes.map(shape => this.draw(shape, onTop));
    }
}
