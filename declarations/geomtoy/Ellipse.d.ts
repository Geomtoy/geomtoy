import Point from "./Point";
import Vector from "./Vector";
import { GraphicImplType, Coordinate } from "./types";
import GeomObject from "./base/GeomObject";
import Transformation from "./transformation";
declare class Ellipse extends GeomObject {
    #private;
    constructor(centerPosition: Coordinate | Point | Vector, radiusX: number, radiusY: number, rotation: number);
    get centerPoint(): Point;
    set centerPoint(value: Point);
    get radiusX(): number;
    set radiusX(value: number);
    get radiusY(): number;
    set radiusY(value: number);
    get rotation(): number;
    set rotation(value: number);
    getEccentricity(): void;
    clone(): GeomObject;
    toString(): string;
    toObject(): object;
    toArray(): any[];
    getGraphic(type: GraphicImplType): (import("./types").SvgDirective | import("./types").CanvasDirective)[];
    static findTangentLineOfTwoEllipse(ellipse1: Ellipse, ellipse2: Ellipse): void;
    static findTangentLineOfEllipseAndParabola(): void;
    apply(transformation: Transformation): GeomObject;
    getGraphicAlt(type: GraphicImplType): (import("./types").SvgDirective | import("./types").CanvasDirective)[];
}
export default Ellipse;
