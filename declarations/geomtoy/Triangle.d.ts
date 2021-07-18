export default Triangle;
declare class Triangle {
    constructor(p1: any, p2: any, p3: any);
    p1: any;
    p2: any;
    p3: any;
    getInscribedCircle(): Circle;
    getEscribedCircles(): void;
    getCircumscribedCircle(): void;
    getGravityCenterPoint(): Point;
    getCircumscribedCircleCenterPoint(): any;
    getOrthoCenterPoint(): any;
}
import Circle from "./Circle";
import Point from "./Point";
