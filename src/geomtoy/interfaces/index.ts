import GeomObject from "../base/GeomObject"
import Transformation from "../transformation"
import { GraphicImplType, CanvasDirective, SvgDirective, Direction } from "../types"

export interface AreaMeasurable {
    //ClosedShape?
    getPerimeter(): number
    getArea(): number
    getWindingDirection(): Direction
    setWindingDirection?(direction: Direction): void
}

export interface LengthMeasurable {
    getLength(): number
}

export interface Visible {
    apply(transformation: Transformation): GeomObject
    getGraphic(type: GraphicImplType): Array<SvgDirective | CanvasDirective>
}
