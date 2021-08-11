import GeomObject from "../base/GeomObject";
import Transformation from "../transformation";
import { GraphicImplType, CanvasDirective, SvgDirective } from "../types";
export interface AreaMeasurable {
    getPerimeter(): number;
    getArea(): number;
}
export interface Visible {
    apply(transformation: Transformation): GeomObject;
    getGraphic(type: GraphicImplType): Array<SvgDirective | CanvasDirective>;
}
