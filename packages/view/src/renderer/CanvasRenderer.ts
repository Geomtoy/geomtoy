import { GeometryGraphic, ImageGraphic, Anchor, TextGraphic, type FillRule, type GeometryGraphicCommand, type ImageGraphicCommand, type Shape, type TextGraphicCommand } from "@geomtoy/core";
import { Box, TransformationMatrix, Utility } from "@geomtoy/util";
import TextMeasurer from "../helper/TextMeasurer";
import type { DisplaySettings, InterfaceSettings, PathInfo } from "../types";
import CanvasImageSourceManager from "./CanvasImageSourceManager";
import CanvasInterface from "./CanvasInterface";
import Display from "./Display";
import Renderer from "./Renderer";

export default class CanvasRenderer extends Renderer {
    private _id = Utility.id("CanvasRenderer");
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

    get id() {
        return this._id;
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
        const { source, x, y, width, height, sourceX, sourceY, sourceWidth, sourceHeight, consistent, anchor } = cmd;
        const [tx, ty] = TransformationMatrix.transformCoordinates(this.display.globalTransformation, [x, y]);
        const scale = this.display.scale;

        let [tImageWidth, tImageHeight] = [NaN, NaN];
        let [atImageWidth, atImageHeight] = [NaN, NaN];

        if (consistent) {
            [tImageWidth, tImageHeight] = [width, height];
            [atImageWidth, atImageHeight] = [width / scale, height / scale];
        } else {
            [tImageWidth, tImageHeight] = [width * scale, height * scale];
            [atImageWidth, atImageHeight] = [width, height];
        }

        const obtained = this.imageSourceManager.successful(source);
        const image = obtained ? this.imageSourceManager.take(source)! : this.imageSourceManager.placeholder(tImageWidth, tImageHeight);

        let [tAdjX, tAdjY] = [NaN, NaN];
        let [atAdjX, atAdjY] = [NaN, NaN];

        if (anchor === Anchor.LeftTop || anchor === Anchor.LeftCenter || anchor === Anchor.LeftBottom) {
            tAdjX = tx;
            atAdjX = this.display.xAxisPositiveOnRight ? x : x - atImageWidth;
        }
        if (anchor === Anchor.CenterTop || anchor === Anchor.CenterCenter || anchor === Anchor.CenterBottom) {
            tAdjX = tx - tImageWidth / 2;
            atAdjX = x - atImageWidth / 2;
        }
        if (anchor === Anchor.RightTop || anchor === Anchor.RightCenter || anchor === Anchor.RightBottom) {
            tAdjX = tx - tImageWidth;
            atAdjX = this.display.xAxisPositiveOnRight ? x - atImageWidth : x;
        }
        //
        if (anchor === Anchor.LeftTop || anchor === Anchor.CenterTop || anchor === Anchor.RightTop) {
            tAdjY = ty;
            atAdjY = this.display.yAxisPositiveOnBottom ? y : y - atImageHeight;
        }
        if (anchor === Anchor.LeftCenter || anchor === Anchor.CenterCenter || anchor === Anchor.RightCenter) {
            tAdjY = ty - tImageHeight / 2;
            atAdjY = y - atImageHeight / 2;
        }
        if (anchor === Anchor.LeftBottom || anchor === Anchor.CenterBottom || anchor === Anchor.RightBottom) {
            tAdjY = ty - tImageHeight;
            atAdjY = this.display.yAxisPositiveOnBottom ? y - atImageHeight : y;
        }

        const b: [number, number, number, number] = [atAdjX, atAdjY, atImageWidth, atImageHeight];
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
            if (obtained && !Number.isNaN(sourceX) && !Number.isNaN(sourceY) && !Number.isNaN(sourceWidth) && !Number.isNaN(sourceHeight)) {
                this._buffer.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, tAdjX, tAdjY, tImageWidth, tImageHeight);
            } else {
                this._buffer.drawImage(image, tAdjX, tAdjY, tImageWidth, tImageHeight);
            }
            this._buffer.setTransform(...this.display.globalTransformation);
            this.style_.noFill || this._buffer.fill(path);
            this.style_.noStroke || this._buffer.stroke(path);
        } else {
            this._buffer.globalCompositeOperation = "destination-over";
            this.style_.noFill || this._buffer.fill(path);
            this.style_.noStroke || this._buffer.stroke(path);
            this._buffer.resetTransform();
            if (obtained && !Number.isNaN(sourceX) && !Number.isNaN(sourceY) && !Number.isNaN(sourceWidth) && !Number.isNaN(sourceHeight)) {
                this._buffer.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, tAdjX, tAdjY, tImageWidth, tImageHeight);
            } else {
                this._buffer.drawImage(image, tAdjX, tAdjY, tImageWidth, tImageHeight);
            }
        }
        this._buffer.restore();
    }
    private _drawText(cmd: TextGraphicCommand, path: Path2D, onTop: boolean) {
        const { x, y, offsetX, offsetY, text, fontSize, fontFamily, fontBold, fontItalic, anchor } = cmd;

        const [tx, ty] = TransformationMatrix.transformCoordinates(this.display.globalTransformation, [x, y]);
        const scale = this.display.scale;
        const [textWidth, textHeight] = TextMeasurer.measure({ fontSize, fontFamily, fontBold, fontItalic }, "hanging", text);
        const [atTextWidth, atTextHeight] = [textWidth / scale, textHeight / scale];
        const [atOffsetX, atOffsetY] = [offsetX / scale, offsetY / scale];

        let [tAdjX, tAdjY] = [NaN, NaN];
        let [atAdjX, atAdjY] = [NaN, NaN];

        if (anchor === Anchor.LeftTop || anchor === Anchor.LeftCenter || anchor === Anchor.LeftBottom) {
            tAdjX = tx;
            atAdjX = this.display.xAxisPositiveOnRight ? x : x - 2 * atOffsetX - atTextWidth;
        }
        if (anchor === Anchor.CenterTop || anchor === Anchor.CenterCenter || anchor === Anchor.CenterBottom) {
            tAdjX = tx - textWidth / 2;
            atAdjX = this.display.xAxisPositiveOnRight ? x - atTextWidth / 2 : x - 2 * atOffsetX - atTextWidth / 2;
        }
        if (anchor === Anchor.RightTop || anchor === Anchor.RightCenter || anchor === Anchor.RightBottom) {
            tAdjX = tx - textWidth;
            atAdjX = this.display.xAxisPositiveOnRight ? x - atTextWidth : x - 2 * atOffsetX;
        }
        //
        if (anchor === Anchor.LeftTop || anchor === Anchor.CenterTop || anchor === Anchor.RightTop) {
            tAdjY = ty;
            atAdjY = this.display.yAxisPositiveOnBottom ? y : y - 2 * atOffsetY - atTextHeight;
        }
        if (anchor === Anchor.LeftCenter || anchor === Anchor.CenterCenter || anchor === Anchor.RightCenter) {
            tAdjY = ty - textHeight / 2;
            atAdjY = this.display.yAxisPositiveOnBottom ? y - atTextHeight / 2 : y - 2 * atOffsetY - atTextHeight / 2;
        }
        if (anchor === Anchor.LeftBottom || anchor === Anchor.CenterBottom || anchor === Anchor.RightBottom) {
            tAdjY = ty - textHeight;
            atAdjY = this.display.yAxisPositiveOnBottom ? y - atTextHeight : y - 2 * atOffsetY;
        }

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
        this.style_.noFill || this._buffer.fillText(text, tAdjX + offsetX, tAdjY + offsetY);
        this.style_.noStroke || this._buffer.strokeText(text, tAdjX + offsetX, tAdjY + offsetY);
        this._buffer.restore();

        // implicit bounding box
        const b: [number, number, number, number] = [atAdjX + atOffsetX, atAdjY + atOffsetY, atTextWidth, atTextHeight];
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

    clear() {
        this._initBuffer();
        this._flushBuffer();
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
