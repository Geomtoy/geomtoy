import { Assert, Type } from "@geomtoy/util";

import ImageSourceManager from "./ImageSourceManager";
import Display from "./Display";
import Interface from "./Interface";
import type View from "../frontend/View";
import type { ContainerElement, StrokeLineCapType, StrokeLineJoinType, PathLike, Style, PaintOrderType } from "../types";
import type { Shape } from "@geomtoy/core";

const DATA_KEY_RENDERER_INITIALIZED = "data-renderer-initialized";

export default abstract class Renderer {
    protected style_: Partial<Style> = {};

    constantImage = false;

    view?: View;

    abstract get container(): ContainerElement;
    abstract get interface(): Interface;
    abstract get display(): Display;
    abstract get imageSourceManager(): ImageSourceManager;

    protected manageRendererInitialized_() {
        if (this.container.getAttribute(DATA_KEY_RENDERER_INITIALIZED) !== null) {
            throw new Error("[G]A renderer has been initialized on this element.");
        }
        this.container.setAttribute(DATA_KEY_RENDERER_INITIALIZED, "");
    }
    //todo
    // abstract clear()
    // abstract autoRedraw()
    // abstract autoRedrawBatch()
    abstract draw(shape: Shape, onTop: boolean): PathLike;
    abstract drawBatch(shapes: Shape[], onTop: boolean): PathLike[];

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
        const scale = this.display.density * this.display.zoom;
        this.style_.strokeWidth = strokeWidth / scale;
    }
    strokeDash(strokeDash: number[]) {
        Assert.condition(
            strokeDash.every(n => Type.isRealNumber(n)),
            "[G]The `strokeDash` should be an array of real numbers."
        );
        const scale = this.display.density * this.display.zoom;
        this.style_.strokeDash = strokeDash.map(n => n / scale);
    }
    strokeDashOffset(strokeDashOffset: number) {
        Assert.isRealNumber(strokeDashOffset, "strokeDashOffset");
        const scale = this.display.density * this.display.zoom;
        this.style_.strokeDashOffset = strokeDashOffset / scale;
    }
    strokeLineJoin(strokeLineJoin: StrokeLineJoinType) {
        this.style_.strokeLineJoin = strokeLineJoin;
    }
    strokeLineCap(strokeLineCap: StrokeLineCapType) {
        this.style_.strokeLineCap = strokeLineCap;
    }
    strokeMiterLimit(strokeMiterLimit: number) {
        this.style_.strokeMiterLimit = strokeMiterLimit;
    }
}
