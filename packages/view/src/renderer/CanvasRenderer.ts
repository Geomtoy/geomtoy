import type { FillRule, GeometryGraphicCommand, ImageGraphicCommand, Shape, TextGraphicCommand } from "@geomtoy/core";
import { GeometryGraphic, ImageGraphic, TextGraphic } from "@geomtoy/core";
import { Box, TransformationMatrix, Utility } from "@geomtoy/util";
import TextMeasurer from "../helper/TextMeasurer";
import type { DisplaySettings, InterfaceSettings, PathInfo } from "../types";
import CanvasImageSourceManager from "./CanvasImageSourceManager";
import CanvasInterface from "./CanvasInterface";
import Display from "./Display";
import Renderer from "./Renderer";

export default class CanvasRenderer extends Renderer {
    private _uuid = Utility.uuid();
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

    get uuid() {
        return this._uuid;
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
    private _drawImage(cmd: ImageGraphicCommand, path: Path2D, onTop: boolean) {
        const { imageSource, x, y, width, height, sourceX, sourceY, sourceWidth, sourceHeight } = cmd;
        const [tx, ty] = TransformationMatrix.transformCoordinates(this.display.globalTransformation, [x, y]);
        const scale = this.display.scale;
        const [imageWidth, imageHeight] = [width * scale, height * scale];
        const [atImageWidth, atImageHeight] = [width, height];
        const [adjustX, adjustY] = [this.display.xAxisPositiveOnRight ? 0 : imageWidth, this.display.yAxisPositiveOnBottom ? 0 : imageHeight];

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
                this._buffer.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, tx - adjustX, ty - adjustY, imageWidth, imageHeight);
            } else {
                this._buffer.drawImage(image, tx - adjustX, ty - adjustY, imageWidth, imageHeight);
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
                this._buffer.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, tx - adjustX, ty - adjustY, imageWidth, imageHeight);
            } else {
                this._buffer.drawImage(image, tx - adjustX, ty - adjustY, imageWidth, imageHeight);
            }
        }
        this._buffer.restore();
    }
    private _drawText(cmd: TextGraphicCommand, path: Path2D, onTop: boolean) {
        const { x, y, offsetX, offsetY, text, fontSize, fontFamily, fontBold, fontItalic } = cmd;

        const [tx, ty] = TransformationMatrix.transformCoordinates(this.display.globalTransformation, [x, y]);
        const scale = this.display.scale;
        const [textWidth, textHeight] = TextMeasurer.measure({ fontSize, fontFamily, fontBold, fontItalic }, "hanging", text);
        const [atTextWidth, atTextHeight] = [textWidth / scale, textHeight / scale];
        const [atTextOffsetX, atTextOffsetY] = [offsetX / scale, offsetY / scale];
        const [adjustX, adjustY] = [this.display.xAxisPositiveOnRight ? 0 : textWidth, this.display.yAxisPositiveOnBottom ? 0 : textHeight];
        const [textOffsetX, textOffsetY] = [this.display.xAxisPositiveOnRight ? offsetX : -offsetX, this.display.yAxisPositiveOnBottom ? offsetY : -offsetY];

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
        this.style_.noFill || this._buffer.fillText(text, tx - adjustX + textOffsetX, ty - adjustY + textOffsetY);
        this.style_.noStroke || this._buffer.strokeText(text, tx - adjustX + textOffsetX, ty - adjustY + textOffsetY);
        this._buffer.restore();

        // implicit bounding box
        const b: [number, number, number, number] = [x + atTextOffsetX, y + atTextOffsetY, atTextWidth, atTextHeight];
        path.moveTo(...Box.nn(b));
        path.lineTo(...Box.mn(b));
        path.lineTo(...Box.mm(b));
        path.lineTo(...Box.nm(b));
        path.closePath();
    }
    private _drawGeometry(cmds: GeometryGraphicCommand[], fillRule: FillRule, path: Path2D, onTop: boolean) {
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
        const graphics = shape.getGraphics(this.display).graphics;
        const ret: PathInfo[] = [];
        for (const g of graphics) {
            const path = new Path2D();

            if (g instanceof TextGraphic) {
                g.command && this._drawText(g.command, path, onTop);
                ret.push([path, "nonzero"]);
            }
            if (g instanceof ImageGraphic) {
                g.command && this._drawImage(g.command, path, onTop);
                ret.push([path, "nonzero"]);
            }
            if (g instanceof GeometryGraphic) {
                g.commands.length && this._drawGeometry(g.commands, g.fillRule, path, onTop);
                ret.push([path, g.fillRule]);
            }
        }

        this._flushBuffer();
        return ret;
    }
    drawBatch(shapes: Shape[], onTop = false) {
        return shapes.map(shape => this.draw(shape, onTop));
    }
}
