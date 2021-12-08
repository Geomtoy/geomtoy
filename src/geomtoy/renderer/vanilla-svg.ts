import util from "../utility";
import bbox from "../utility/boundingBox";

import type Geomtoy from "..";
import type Shape from "../base/Shape";

import { RendererConfig, LineCapType, LineJoinType, Renderer, GraphicsTextCommand, GraphicsImageCommand } from "../types";
import { colors } from "../../../examples/src/assets/assets";

export const defaultVanillaSvgConfig: RendererConfig = {
    stroke: "transparent",
    strokeDash: [],
    strokeDashOffset: 0,
    strokeWidth: 1,
    fill: "transparent",
    lineJoin: "miter",
    lineCap: "butt",
    miterLimit: 10
};

/**
 * @category Renderer
 */
export default class VanillaSvg implements Renderer {
    container: SVGSVGElement;
    geomtoy: Geomtoy;
    gEl: SVGGElement;

    private _config: RendererConfig = util.cloneDeep(defaultVanillaSvgConfig);
    private _uuidCache: string[] = [];

    constructor(container: SVGSVGElement, geomtoy: Geomtoy) {
        if (container instanceof SVGSVGElement) {
            this.container = container;
            this.geomtoy = geomtoy;

            this.gEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.gEl.setAttribute("id", "geomtoy");
            this.container.append(this.gEl);

            return this;
        }
        throw new Error(`[G]Unable to initialize.`);
    }

    setup() {
        const gt = this.geomtoy.globalTransformation.get();
        this.gEl.setAttribute("transform", `matrix(${gt.join(" ")})`);
    }

    private _drawImage(cmd: GraphicsImageCommand, pathEl: SVGPathElement, behind = false) {
        const { imageSource, x, y, width, height, sourceX, sourceY, sourceWidth, sourceHeight } = cmd;
        const uuid = pathEl.getAttribute("data-id")!;

        const imageWrapperEl = (this.gEl.querySelector(`svg[data-id='${uuid}']`) as SVGPathElement) || document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const imageInnerEl = (this.gEl.querySelector(`image[data-id='${uuid}']`) as SVGImageElement) || document.createElementNS("http://www.w3.org/2000/svg", "image");

        imageWrapperEl.setAttribute("data-id", uuid);
        imageInnerEl.setAttribute("data-id", uuid);

        imageWrapperEl.append(imageInnerEl);
        imageWrapperEl.setAttribute("transform", `matrix(${this.geomtoy.globalTransformation.invert().get().join(" ")})`);

        const [tx, ty] = this.geomtoy.globalTransformation.transformCoordinate([x, y]);
        const [tw, th] = [width / this.geomtoy.scale, height / this.geomtoy.scale];
        const tBox: [number, number, number, number] = [tx, ty, tw, th];

        imageInnerEl.setAttribute("href", `${imageSource}`);
        imageWrapperEl.setAttribute("x", `${tx}`);
        imageWrapperEl.setAttribute("y", `${ty}`);
        imageWrapperEl.setAttribute("width", `${tw}`);
        imageWrapperEl.setAttribute("height", `${th}`);

        if (!util.isNaN(sourceX) && !util.isNaN(sourceY) && !util.isNaN(sourceWidth) && !util.isNaN(sourceHeight)) {
            imageWrapperEl.setAttribute("viewBox", `${sourceX} ${sourceY} ${sourceWidth} ${sourceHeight}`);
        }

        pathEl.setAttribute("d", `M${bbox.nn(tBox).join(",")}L${bbox.mn(tBox).join(",")}L${bbox.mm(tBox).join(",")}L${bbox.nm(tBox).join(",")}Z`);
        pathEl.setAttribute("stroke", "transparent");
        pathEl.setAttribute("fill", "transparent");

        if (behind) {
            this.gEl.prepend(imageWrapperEl);
            this.gEl.prepend(pathEl);
        } else {
            this.gEl.append(imageWrapperEl);
            this.gEl.prepend(pathEl);
        }
    }
    private _drawText(cmd: GraphicsTextCommand, pathEl: SVGPathElement, behind = false) {
        const { x, y, text, fontSize, fontFamily, fontBold, fontItalic } = cmd;
        const uuid = pathEl.getAttribute("data-id")!;

        const textEl = (this.gEl.querySelector(`text[data-id='${uuid}']`) as SVGTextElement) || document.createElementNS("http://www.w3.org/2000/svg", "text");

        textEl.setAttribute("data-id", uuid);

        // text baseline
        textEl.setAttribute("dominant-baseline", "hanging");
        // text font style
        textEl.setAttribute("font-size", `${fontSize}`);
        textEl.setAttribute("font-family", `${fontFamily}`);
        fontBold && textEl.setAttribute("font-weight", "bold");
        fontItalic && textEl.setAttribute("font-style", "italic");
        // text orientation
        textEl.setAttribute("transform", `matrix(${this.geomtoy.globalTransformation.invert().get().join(" ")})`);
        // text content
        textEl.textContent = text;
        // text has no stroke
        textEl.setAttribute("fill", this._config.fill);
        textEl.setAttribute("stroke", "transparent");
        textEl.setAttribute("style", "user-select: none; pointer-events: none;");

        // ????
        const [tx, ty] = this.geomtoy.globalTransformation.transformCoordinate([cmd.x, cmd.y]);
        textEl.setAttribute("x", `${tx}`);
        textEl.setAttribute("y", `${ty}`);
        // draw transparent bounding box

        // If we do not append textEl into `DOM`, we can not call `getBBox`
        if (behind) {
            this.gEl.prepend(textEl);
            this.gEl.prepend(pathEl);
        } else {
            this.gEl.append(textEl);
            this.gEl.append(pathEl);
        }

        const oBox = textEl.getBBox();
        const width = oBox.width / this.geomtoy.scale;
        const height = oBox.height / this.geomtoy.scale;
        const offsetX = this.geomtoy.xAxisPositiveOnRight ? 0 : width;
        const offsetY = this.geomtoy.yAxisPositiveOnBottom ? 0 : height;
        const tBox: [number, number, number, number] = [x - offsetX, y - offsetY, oBox.width / this.geomtoy.scale, oBox.height / this.geomtoy.scale];

        // bounding box
        pathEl.setAttribute("d", `M${bbox.nn(tBox).join(",")}L${bbox.mn(tBox).join(",")}L${bbox.mm(tBox).join(",")}L${bbox.nm(tBox).join(",")}Z`);
        pathEl.setAttribute("stroke", "transparent");
        pathEl.setAttribute("fill", colors.red + "20");
    }

    draw(shape: Shape, behind = false) {
        this.setup();
        this._uuidCache.push(shape.uuid);

        const cmds = shape.getGraphics().commands;
        const pathEl = (this.gEl.querySelector(`path[data-id='${shape.uuid}']`) as SVGPathElement) || document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathEl.setAttribute("data-id", shape.uuid);

        if (cmds.length === 1) {
            const sCmd = util.head(cmds)!;
            if (sCmd.type === "text") this._drawText(sCmd, pathEl, behind);
            if (sCmd.type === "image") this._drawImage(sCmd, pathEl, behind);
        } else {
            pathEl.setAttribute("stroke", this._config.stroke);
            pathEl.setAttribute("fill", this._config.fill);
            if (this._config.strokeDash.length) {
                pathEl.setAttribute("stroke-dasharray", `${this._config.strokeDash}`);
                pathEl.setAttribute("stroke-dashoffset", `${this._config.strokeDashOffset}`);
            }
            pathEl.setAttribute("stroke-width", `${this._config.strokeWidth}`);
            pathEl.setAttribute("stroke-linejoin", `${this._config.lineJoin}`);
            pathEl.setAttribute("stroke-miterlimit", `${this._config.miterLimit}`);
            pathEl.setAttribute("stroke-linecap", `${this._config.lineCap}`);

            let attrD = "";
            cmds.forEach(cmd => {
                if (cmd.type === "moveTo") {
                    attrD += `M${cmd.x},${cmd.y}`;
                }
                if (cmd.type === "lineTo") {
                    attrD += `L${cmd.x},${cmd.y}`;
                }
                if (cmd.type === "bezierCurveTo") {
                    attrD += `C${cmd.controlPoint1X},${cmd.controlPoint1Y} ${cmd.controlPoint2X},${cmd.controlPoint2Y} ${cmd.x},${cmd.y}`;
                }
                if (cmd.type === "quadraticBezierCurveTo") {
                    attrD += `Q${cmd.controlPointX},${cmd.controlPointY} ${cmd.x},${cmd.y}`;
                }
                if (cmd.type === "arcTo") {
                    attrD += `A${cmd.radiusX} ${cmd.radiusY} ${cmd.xAxisRotation} ${cmd.largeArc ? 1 : 0} ${cmd.positive ? 1 : 0} ${cmd.x},${cmd.y}`;
                }
                if (cmd.type === "close") {
                    attrD += `Z`;
                }
            });
            pathEl.setAttribute("d", attrD);
        }

        if (behind) {
            this.gEl.prepend(pathEl);
        } else {
            this.gEl.append(pathEl);
        }
        return pathEl;
    }
    drawBatch(shapes: Shape[], behind = false) {
        return shapes.map(o => this.draw(o, behind));
    }
    clear() {
        Array.from(this.gEl.children).forEach(n => {
            if (!this._uuidCache.includes(n.getAttribute("data-id")!)) {
                n.remove();
            }
        });
        this._uuidCache = [];
    }

    stroke(stroke: string) {
        this._config.stroke = stroke;
    }
    strokeWidth(strokeWidth: number) {
        this._config.strokeWidth = strokeWidth / this.geomtoy.scale;
    }
    strokeDash(strokeDash: number[]) {
        this._config.strokeDash = strokeDash.map(n => n / this.geomtoy.scale);
    }
    strokeDashOffset(strokeDashOffset: number) {
        this._config.strokeDashOffset = strokeDashOffset / this.geomtoy.scale;
    }
    fill(fill: string) {
        this._config.fill = fill;
    }
    lineJoin(lineJoin: LineJoinType) {
        this._config.lineJoin = lineJoin;
    }
    lineCap(lineCap: LineCapType) {
        this._config.lineCap = lineCap;
    }
    miterLimit(miterLimit: number) {
        this._config.miterLimit = miterLimit;
    }

    isPointInFill(pathEl: SVGPathElement, x: number, y: number) {
        const point = this.container.createSVGPoint() || new DOMPoint();
        point.x = x;
        point.y = y;
        return pathEl.isPointInFill(point);
    }
    isPointInStroke(pathEl: SVGPathElement, strokeWidth = defaultVanillaSvgConfig.strokeWidth, x: number, y: number) {
        const point = this.container.createSVGPoint() || new DOMPoint();
        point.x = x;
        point.y = y;
        return pathEl.isPointInStroke(point);
    }
}
