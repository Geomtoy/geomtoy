import type { Shape } from "@geomtoy/core";
import { Assert, Type } from "@geomtoy/util";
import type View from "../frontend/View";
import type { ContainerElement, PaintOrderType, PathInfo, StrokeLineCapType, StrokeLineJoinType, Style } from "../types";
import Display from "./Display";
import ImageSourceManager from "./ImageSourceManager";
import Interface from "./Interface";

export const RENDERER_VIEW_SYMBOL = Symbol("Renderer.view");
const DATA_RENDERER_INITIALIZED = "data-renderer-initialized";

export default abstract class Renderer {
    /** @internal  */
    [RENDERER_VIEW_SYMBOL]: null | View = null;

    protected style_: Partial<Style> = {};

    abstract get container(): ContainerElement;
    abstract get interface(): Interface;
    abstract get display(): Display;
    abstract get imageSourceManager(): ImageSourceManager;
    abstract get id(): string;

    protected manageRendererInitialized_() {
        if (this.container.getAttribute(DATA_RENDERER_INITIALIZED) !== null) {
            throw new Error("[G]A renderer has been initialized on this element.");
        }
        this.container.setAttribute(DATA_RENDERER_INITIALIZED, "");
    }

    abstract clear(): void;
    abstract draw(shape: Shape, onTop: boolean): PathInfo[];
    abstract drawBatch(shapes: Shape[], onTop: boolean): PathInfo[][];

    paintOrder(order: PaintOrderType) {
        this.style_.paintOrder = order;
    }
    noFill(noFill: boolean) {
        this.style_.noFill = noFill;
    }
    noStroke(noStroke: boolean) {
        this.style_.noStroke = noStroke;
    }
    fill(fill: string) {
        this.style_.fill = fill;
    }
    stroke(stroke: string) {
        this.style_.stroke = stroke;
    }
    strokeWidth(strokeWidth: number) {
        Assert.isPositiveNumber(strokeWidth, "strokeWidth");
        const scale = this.display.scale;
        this.style_.strokeWidth = strokeWidth / scale;
    }
    strokeDash(strokeDash: number[]) {
        Assert.condition(
            strokeDash.every(n => Type.isRealNumber(n)),
            "[G]The `strokeDash` should be an array of real numbers."
        );
        const scale = this.display.scale;
        this.style_.strokeDash = strokeDash.map(n => n / scale);
    }
    strokeDashOffset(strokeDashOffset: number) {
        Assert.isRealNumber(strokeDashOffset, "strokeDashOffset");
        const scale = this.display.scale;
        this.style_.strokeDashOffset = strokeDashOffset / scale;
    }
    strokeLineJoin(strokeLineJoin: StrokeLineJoinType) {
        this.style_.strokeLineJoin = strokeLineJoin;
    }
    strokeLineCap(strokeLineCap: StrokeLineCapType) {
        this.style_.strokeLineCap = strokeLineCap;
    }
    strokeMiterLimit(strokeMiterLimit: number) {
        Assert.isRealNumber(strokeMiterLimit, "strokeMiterLimit");
        this.style_.strokeMiterLimit = strokeMiterLimit;
    }
}
