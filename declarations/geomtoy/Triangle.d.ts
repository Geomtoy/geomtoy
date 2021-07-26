import Point from "./Point";
import Circle from "./Circle";
import GeomObject from "./base/GeomObject";
import { CanvasDirective, Coordinate, GraphicImplType, SvgDirective } from "./types";
import Transformation from "./transformation";
declare class Triangle extends GeomObject {
    #private;
    constructor(point1Position: Coordinate | Point, point2Position: Coordinate | Point, point3Position: Coordinate | Point);
    get point1(): Point;
    set point1(value: Point);
    get point2(): Point;
    set point2(value: Point);
    get point3(): Point;
    set point3(value: Point);
    getInscribedCircle(): Circle;
    getEscribedCircles(): void;
    getCircumscribedCircle(): void;
    getArea(signed?: boolean): number;
    getCentroidPoint(): Point;
    getCircumscribedCircleCenterPoint(): Point;
    getOrthoCenterPoint(): Point;
    apply(transformation: Transformation): GeomObject;
    clone(): GeomObject;
    toString(): string;
    toObject(): object;
    toArray(): any[];
    getGraphic(type: GraphicImplType): (SvgDirective | CanvasDirective)[];
}
export default Triangle;
