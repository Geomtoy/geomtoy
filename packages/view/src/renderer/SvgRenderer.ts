import { GeometryGraphic, ImageGraphic, Anchor, TextGraphic, type FillRule, type GeometryGraphicCommand, type ImageGraphicCommand, type Shape, type TextGraphicCommand } from "@geomtoy/core";
import { Angle, Box, TransformationMatrix, Utility } from "@geomtoy/util";
import TextMeasurer from "../helper/TextMeasurer";
import type { DisplaySettings, InterfaceSettings, PathInfo } from "../types";
import Display from "./Display";
import Renderer from "./Renderer";
import SvgImageSourceManager from "./SvgImageSourceManager";
import SvgInterface from "./SvgInterface";

/**
 * @category Renderer
 */
export default class SvgRenderer extends Renderer {
    private _id = Utility.id("SvgRenderer");
    private _surface: SVGGElement;
    private _interfaceSurface: SVGGElement;
    private _buffer = document.createDocumentFragment();
    private _bufferFlushScheduled = false;

    private _container: SVGSVGElement;
    private _interface: SvgInterface;
    private _display: Display;
    private _imageSourceManager: SvgImageSourceManager;

    constructor(container: SVGSVGElement, interfaceSettings: Partial<InterfaceSettings> = {}, displaySettings: Partial<DisplaySettings> = {}) {
        super();
        if (container instanceof SVGSVGElement) {
            this._container = container;
            this.manageRendererInitialized_();
            this._interface = new SvgInterface(this, interfaceSettings);
            this._display = new Display(this, displaySettings);
            this._imageSourceManager = new SvgImageSourceManager();

            this.container.style["touch-action" as any] = "none";
            this.container.style["user-select" as any] = "none";
            this.container.style["-webkit-tap-highlight-color" as any] = "transparent";
            this.container.style["-webkit-touch-callout" as any] = "none";

            this.container.innerHTML = `
                <style>
                    .geomtoy-svg-interface, .geomtoy-svg, .geomtoy-svg *{
                        pointer-events: none;
                    }
                    .geomtoy-svg text {
                        user-select: none;
                    }
                </style>
                <g class="geomtoy-svg-interface" id="svgInterface-${this.id}"></g>
                <g class="geomtoy-svg" id="svg-${this.id}"></g>
            `;
            this._surface = this.container.querySelector(`#svg-${this.id}`)!;
            this._interfaceSurface = this.container.querySelector(`#svgInterface-${this.id}`)!;

            return this;
        }
        throw new Error("[G]Unable to initialize, the container` is not a `SVGSVGElement`.");
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

    private _setStyle(path: SVGPathElement | SVGTextElement) {
        this.style_.fill && path.setAttribute("fill", this.style_.fill);
        this.style_.stroke && path.setAttribute("stroke", this.style_.stroke);
        this.style_.strokeWidth && path.setAttribute("stroke-width", `${this.style_.strokeWidth}`);
        this.style_.strokeDash?.length && path.setAttribute("stroke-dasharray", `${this.style_.strokeDash.join(",")}`);
        this.style_.strokeDashOffset && path.setAttribute("stroke-dashoffset", `${this.style_.strokeDashOffset}`);
        this.style_.strokeLineJoin && path.setAttribute("stroke-linejoin", this.style_.strokeLineJoin);
        this.style_.strokeMiterLimit && path.setAttribute("stroke-miterlimit", `${this.style_.strokeMiterLimit}`);
        this.style_.strokeLineCap && path.setAttribute("stroke-linecap", this.style_.strokeLineCap);
    }
    private _drawImage(cmd: ImageGraphicCommand, path: SVGPathElement, onTop: boolean) {
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
        const imageEl = obtained ? this.imageSourceManager.take(source)! : this.imageSourceManager.placeholder(tImageWidth, tImageHeight);

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
        path.setAttribute("d", `M${Box.nn(b).join(",")}L${Box.mn(b).join(",")}L${Box.mm(b).join(",")}L${Box.nm(b).join(",")}Z`);
        this._setStyle(path);
        this.style_.paintOrder && path.setAttribute("paint-order", this.style_.paintOrder);
        this.style_.noFill && path.setAttribute("fill", "none");
        this.style_.noStroke && path.setAttribute("stroke", "none");

        const imageWrapper = document.createElementNS("http://www.w3.org/2000/svg", "g");
        imageWrapper.setAttribute("transform", `matrix(${TransformationMatrix.invert(this.display.globalTransformation).join(" ")})`);

        if (obtained && !Number.isNaN(sourceX) && !Number.isNaN(sourceY) && !Number.isNaN(sourceWidth) && !Number.isNaN(sourceHeight)) {
            const imageClipper = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            imageClipper.append(imageEl);
            imageWrapper.append(imageClipper);
            imageClipper.setAttribute("x", `${tAdjX}`);
            imageClipper.setAttribute("y", `${tAdjY}`);
            imageClipper.setAttribute("width", `${tImageWidth}`);
            imageClipper.setAttribute("height", `${tImageHeight}`);
            imageClipper.setAttribute("preserveAspectRatio", "none");
            imageClipper.setAttribute("viewBox", `${sourceX} ${sourceY} ${sourceWidth} ${sourceHeight}`);
        } else {
            imageWrapper.append(imageEl);
            imageEl.setAttribute("x", `${tAdjX}`);
            imageEl.setAttribute("y", `${tAdjY}`);
            imageEl.setAttribute("width", `${tImageWidth}`);
            imageEl.setAttribute("height", `${tImageHeight}`);
            imageEl.setAttribute("preserveAspectRatio", "none");
        }

        if (onTop) {
            this._buffer.append(imageWrapper);
            this._buffer.append(path);
        } else {
            this._buffer.prepend(path);
            this._buffer.prepend(imageWrapper);
        }
    }
    private _drawText(cmd: TextGraphicCommand, path: SVGPathElement, onTop: boolean) {
        const { x, y, offsetX, offsetY, content, fontSize, fontFamily, fontBold, fontItalic, anchor } = cmd;
        const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");

        const [tx, ty] = TransformationMatrix.transformCoordinates(this.display.globalTransformation, [x, y]);
        const scale = this.display.scale;
        const [textWidth, textHeight] = TextMeasurer.measure({ fontSize, fontFamily, fontBold, fontItalic }, "hanging", content);
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

        textEl.setAttribute("dominant-baseline", "hanging");
        textEl.setAttribute("font-size", `${fontSize}`);
        textEl.setAttribute("font-family", `${fontFamily}`);
        fontBold && textEl.setAttribute("font-weight", "bold");
        fontItalic && textEl.setAttribute("font-style", "italic");
        textEl.setAttribute("transform", `matrix(${TransformationMatrix.invert(this.display.globalTransformation).join(" ")})`);
        textEl.setAttribute("x", `${tAdjX + offsetX}`);
        textEl.setAttribute("y", `${tAdjY + offsetY}`);
        this._setStyle(textEl);
        this.style_.paintOrder && textEl.setAttribute("paint-order", this.style_.paintOrder);
        this.style_.noFill && textEl.setAttribute("fill", "none");
        this.style_.noStroke && textEl.setAttribute("stroke", "none");

        textEl.textContent = content;
        onTop ? this._buffer.append(textEl) : this._buffer.prepend(textEl);

        // implicit bounding box
        const b: [number, number, number, number] = [atAdjX + atOffsetX, atAdjY + atOffsetY, atTextWidth, atTextHeight];
        path.setAttribute("d", `M${Box.nn(b).join(",")}L${Box.mn(b).join(",")}L${Box.mm(b).join(",")}L${Box.nm(b).join(",")}Z`);
    }
    private _drawGeometry(cmds: GeometryGraphicCommand[], fillRule: FillRule, path: SVGPathElement, onTop: boolean) {
        let d = "";
        cmds.forEach(cmd => {
            if (cmd.type === "moveTo") d += `M${cmd.x},${cmd.y}`;
            if (cmd.type === "lineTo") d += `L${cmd.x},${cmd.y}`;
            if (cmd.type === "bezierTo") d += `C${cmd.controlPoint1X},${cmd.controlPoint1Y} ${cmd.controlPoint2X},${cmd.controlPoint2Y} ${cmd.x},${cmd.y}`;
            if (cmd.type === "quadraticBezierTo") d += `Q${cmd.controlPointX},${cmd.controlPointY} ${cmd.x},${cmd.y}`;
            if (cmd.type === "arcTo") d += `A${cmd.radiusX} ${cmd.radiusY} ${Angle.radianToDegree(cmd.rotation)} ${cmd.largeArc ? 1 : 0} ${cmd.positive ? 1 : 0} ${cmd.x},${cmd.y}`;
            if (cmd.type === "close") d += `Z`;
        });
        path.setAttribute("d", d);
        this._setStyle(path);
        path.setAttribute("fill-rule", fillRule);
        this.style_.paintOrder && path.setAttribute("paint-order", this.style_.paintOrder);
        this.style_.noFill && path.setAttribute("fill", "none");
        this.style_.noStroke && path.setAttribute("stroke", "none");

        onTop ? this._buffer.append(path) : this._buffer.prepend(path);
    }
    private async _flushBuffer() {
        if (this._bufferFlushScheduled) return;
        this._bufferFlushScheduled = true;

        const createdInterface = await this._interface.create();

        Promise.resolve().then(() => {
            this._surface.setAttribute("transform", `matrix(${this.display.globalTransformation.join(" ")})`);
            this._interfaceSurface.replaceChildren(createdInterface);
            this._surface.replaceChildren(this._buffer);
            this._bufferFlushScheduled = false;
        });
    }
    private _initBuffer() {}

    clear() {
        this._initBuffer();
        this._flushBuffer();
    }
    draw(shape: Shape, onTop = false) {
        this._initBuffer();

        const graphics = shape.getGraphics(this.display).graphics;
        const ret: PathInfo[] = [];
        for (const g of graphics) {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

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
