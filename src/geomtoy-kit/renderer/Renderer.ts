import ImageSourceManager from "../helper/ImageSourceManager";
import TextMeasurer from "../helper/TextMeasurer";
import Display from "./Display";

import type { ContainerElement, LineCapType, LineJoinType, PathLike, Style } from "../types";
import type Geomtoy from "../../geomtoy";
import type Shape from "../../geomtoy/base/Shape";


const dataKeyRendererInitialized = "data-renderer-initialized";

export default abstract class Renderer {
    abstract container: ContainerElement;
    
    private _geomtoy: Geomtoy;
    private _display: Display;

    protected imageSourceManager_ = new ImageSourceManager()
    protected textMeasurer_ = new TextMeasurer()
    protected style_: Partial<Style> = {};
    
    constructor(geomtoy: Geomtoy) {
        this._geomtoy = geomtoy;
        this._display = new Display(this);
    }

    get geomtoy() {
        return this._geomtoy;
    }
    get display() {
        return this._display;
    }

    protected manageRendererInitialized_() {
        if (this.container.getAttribute(dataKeyRendererInitialized) === "true"){
            throw new Error("[G]A renderer has been initialized on this element.");
        }
        this.container.setAttribute(dataKeyRendererInitialized, "true");
    }
    protected isShapeOwnerEqual(shape:Shape){
        if (shape.owner !== this.geomtoy) {
            throw new Error("[G]A `Shape` can only be drawn by a `Renderer` that has the same `geomtoy` as its `owner`.");
        }
    }

    abstract draw(shape: Shape, onTop: boolean): PathLike;
    abstract drawBatch(shapes: Shape[], onTop: boolean): PathLike[];

    fill(fill: string) {
        this.style_.fill = fill;
    }
    stroke(stroke: string) {
        this.style_.stroke = stroke;
    }
    strokeWidth(strokeWidth: number) {
        const scale = this.display.density * this.display.zoom;
        this.style_.strokeWidth = strokeWidth / scale;
    }
    strokeDash(strokeDash: number[]) {
        const scale = this.display.density * this.display.zoom;
        this.style_.strokeDash = strokeDash.map(n => n / scale);
    }
    strokeDashOffset(strokeDashOffset: number) {
        const scale = this.display.density * this.display.zoom;
        this.style_.strokeDashOffset = strokeDashOffset / scale;
    }
    lineJoin(lineJoin: LineJoinType) {
        this.style_.lineJoin = lineJoin;
    }
    lineCap(lineCap: LineCapType) {
        this.style_.lineCap = lineCap;
    }
    miterLimit(miterLimit: number) {
        this.style_.miterLimit = miterLimit;
    }
}
