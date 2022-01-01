import box from "../../geomtoy/utility/box";

import Renderer from "./Renderer";
import SvgInterface from "./SvgInterface";

import type { GraphicsGeometryCommand, GraphicsImageCommand, GraphicsTextCommand } from "../../geomtoy/types";
import type { InterfaceOptions } from "../types";

//@internal
import type Geomtoy from "../../geomtoy/geomtoy";
//@internal
import type Shape from "../../geomtoy/base/Shape";

/**
 * @category Renderer
 */
export default class SvgRenderer extends Renderer {
    private _surface: SVGGElement;
    private _interfaceSurface: SVGGElement;

    private _container: SVGSVGElement;
    private _interface: SvgInterface;
    private _buffer = document.createDocumentFragment();
    private _bufferFlushScheduled = false;

    constructor(container: SVGSVGElement, geomtoy: Geomtoy, interfaceOptions: Partial<InterfaceOptions> = {}) {
        super(geomtoy);

        if (container instanceof SVGSVGElement) {
            this._container = container;
            this.manageRendererInitialized_();
            this._interface = new SvgInterface(this);
            this._interface.options(interfaceOptions);

            this.container.style["touch-action" as any] = "none";
            this.container.style["user-select" as any] = "none";
            this.container.style["-webkit-tap-highlight-color" as any] = "transparent";
            this.container.style["-webkit-touch-callout" as any] = "none";

            this.container.innerHTML = `
                <style>
                    #geomtoyInterface, #geomtoy, #geomtoy *{
                        pointer-events: none;
                    }
                    #geomtoy text {
                        user-select: none;
                    }
                </style>
                <g id="geomtoyInterface"></g>
                <g id="geomtoy"></g>
            `;
            this._surface = this.container.querySelector("#geomtoy")!;
            this._interfaceSurface = this.container.querySelector("#geomtoyInterface")!;

            return this;
        }
        throw new Error("[G]Unable to initialize, the container` is not a `SVGSVGElement`.");
    }

    get container() {
        return this._container;
    }

    private _setStyle(path: SVGPathElement | SVGTextElement, [noFill = false, noStroke = false] = []) {
        if (noFill) {
            path.setAttribute("fill", "none");
        } else {
            this.style_.fill && path.setAttribute("fill", this.style_.fill);
        }

        if (noStroke) {
            path.setAttribute("stroke", "none");
        } else {
            this.style_.stroke && path.setAttribute("stroke", this.style_.stroke);
            this.style_.strokeWidth && path.setAttribute("stroke-width", `${this.style_.strokeWidth}`);
            if (this.style_.strokeDash?.length) {
                path.setAttribute("stroke-dasharray", `${this.style_.strokeDash.join(",")}`);
                this.style_.strokeDashOffset && path.setAttribute("stroke-dashoffset", `${this.style_.strokeDashOffset}`);
            }
            this.style_.strokeLineJoin && path.setAttribute("stroke-linejoin", this.style_.strokeLineJoin);
            this.style_.strokeMiterLimit && path.setAttribute("stroke-miterlimit", `${this.style_.strokeMiterLimit}`);
            this.style_.strokeLineCap && path.setAttribute("stroke-linecap", this.style_.strokeLineCap);
        }
    }
    private _drawImage(cmd: GraphicsImageCommand, path: SVGPathElement, onTop: boolean) {
        const { imageSource, x, y, width, height, sourceX, sourceY, sourceWidth, sourceHeight } = cmd;
        const [tx, ty] = this.display.globalTransformation.transformCoordinates([x, y]);
        const scale = this.display.density * this.display.zoom;
        const imageScale = this.constantImage ? this.display.density : this.display.density * this.display.zoom;
        const [imageWidth, imageHeight] = [width * imageScale, height * imageScale];
        const [atImageWidth, atImageHeight] = [imageWidth / scale, imageHeight / scale];
        const [offsetX, offsetY] = [this.display.xAxisPositiveOnRight ? 0 : imageWidth, this.display.yAxisPositiveOnBottom ? 0 : imageHeight];

        const obtained = this.imageSourceManager.successful(imageSource);
        const imageEl = obtained ? this.imageSourceManager.take(imageSource)! : this.imageSourceManager.placeholderForSvg(imageWidth, imageHeight);

        const imageWrapper = document.createElementNS("http://www.w3.org/2000/svg", "g");
        imageWrapper.setAttribute("transform", `matrix(${this.display.globalTransformation.invert().toArray().join(" ")})`);

        const b: [number, number, number, number] = [x, y, atImageWidth, atImageHeight];
        path.setAttribute("d", `M${box.nn(b).join(",")}L${box.mn(b).join(",")}L${box.mm(b).join(",")}L${box.nm(b).join(",")}Z`);
        this._setStyle(path, [, true]);

        if (obtained && !isNaN(sourceX) && !isNaN(sourceY) && !isNaN(sourceWidth) && !isNaN(sourceHeight)) {
            const imageClipper = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            imageClipper.append(imageEl);
            imageWrapper.append(imageClipper);
            imageClipper.setAttribute("x", `${tx - offsetX}`);
            imageClipper.setAttribute("y", `${ty - offsetY}`);
            imageClipper.setAttribute("width", `${imageWidth}`);
            imageClipper.setAttribute("height", `${imageHeight}`);
            imageClipper.setAttribute("preserveAspectRatio", "none");
            imageClipper.setAttribute("viewBox", `${sourceX} ${sourceY} ${sourceWidth} ${sourceHeight}`);
        } else {
            imageWrapper.append(imageEl);
            imageEl.setAttribute("x", `${tx - offsetX}`);
            imageEl.setAttribute("y", `${ty - offsetY}`);
            imageEl.setAttribute("width", `${imageWidth}`);
            imageEl.setAttribute("height", `${imageHeight}`);
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
    private _drawText(cmd: GraphicsTextCommand, path: SVGPathElement, onTop: boolean) {
        const { x, y, text, fontSize, fontFamily, fontBold, fontItalic } = cmd;
        const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");

        const [tx, ty] = this.display.globalTransformation.transformCoordinates([x, y]);
        const scale = this.display.density * this.display.zoom;
        const [textWidth, textHeight] = this.textMeasurer.measure({ fontSize, fontFamily, fontBold, fontItalic }, "hanging", text);
        const [atTextWidth, atTextHeight] = [textWidth / scale, textHeight / scale];
        const [offsetX, offsetY] = [this.display.xAxisPositiveOnRight ? 0 : textWidth, this.display.yAxisPositiveOnBottom ? 0 : textHeight];

        textEl.setAttribute("dominant-baseline", "hanging");
        textEl.setAttribute("font-size", `${fontSize}`);
        textEl.setAttribute("font-family", `${fontFamily}`);
        fontBold && textEl.setAttribute("font-weight", "bold");
        fontItalic && textEl.setAttribute("font-style", "italic");
        textEl.setAttribute("transform", `matrix(${this.display.globalTransformation.invert().toArray().join(" ")})`);
        textEl.setAttribute("x", `${tx - offsetX}`);
        textEl.setAttribute("y", `${ty - offsetY}`);
        this._setStyle(textEl, [, true]);
        textEl.textContent = text;
        onTop ? this._buffer.append(textEl) : this._buffer.prepend(textEl);

        // implicit bounding box
        const b: [number, number, number, number] = [x, y, atTextWidth, atTextHeight];
        path.setAttribute("d", `M${box.nn(b).join(",")}L${box.mn(b).join(",")}L${box.mm(b).join(",")}L${box.nm(b).join(",")}Z`);
    }
    private _drawGeometry(cmds: GraphicsGeometryCommand[], path: SVGPathElement, onTop: boolean) {
        let d = "";
        cmds.forEach(cmd => {
            if (cmd.type === "moveTo") d += `M${cmd.x},${cmd.y}`;
            if (cmd.type === "lineTo") d += `L${cmd.x},${cmd.y}`;
            if (cmd.type === "bezierCurveTo") d += `C${cmd.controlPoint1X},${cmd.controlPoint1Y} ${cmd.controlPoint2X},${cmd.controlPoint2Y} ${cmd.x},${cmd.y}`;
            if (cmd.type === "quadraticBezierCurveTo") d += `Q${cmd.controlPointX},${cmd.controlPointY} ${cmd.x},${cmd.y}`;
            if (cmd.type === "arcTo") d += `A${cmd.radiusX} ${cmd.radiusY} ${cmd.xAxisRotation} ${cmd.largeArc ? 1 : 0} ${cmd.positive ? 1 : 0} ${cmd.x},${cmd.y}`;
            if (cmd.type === "close") d += `Z`;
        });
        path.setAttribute("d", d);
        this._setStyle(path);
        onTop ? this._buffer.append(path) : this._buffer.prepend(path);
    }
    private async _flushBuffer() {
        if (this._bufferFlushScheduled) return;
        this._bufferFlushScheduled = true;

        const createdInterface = await this._interface.create();

        Promise.resolve().then(() => {
            this._surface.setAttribute("transform", `matrix(${this.display.globalTransformation.toArray().join(" ")})`);
            this._interfaceSurface.replaceChildren(createdInterface);
            this._surface.replaceChildren(this._buffer);
            this._bufferFlushScheduled = false;
        });
    }
    private _initBuffer() {}

    draw(shape: Shape, onTop = false) {
        this.isShapeOwnerEqual_(shape);
        this._initBuffer();

        const cmds = shape.getGraphics(this.display).commands;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
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
