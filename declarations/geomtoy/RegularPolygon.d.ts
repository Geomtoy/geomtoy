export default RegularPolygon;
declare class RegularPolygon {
    constructor(radius: any, cx: any, cy: any, number: any, angle: any);
    radius: any;
    cx: any;
    cy: any;
    number: any;
    angle: number;
    get points(): any[];
    get lines(): any[];
    set centerPoint(arg: Point);
    get centerPoint(): Point;
    set apothem(arg: number);
    get apothem(): number;
    set edgeLength(arg: number);
    get edgeLength(): number;
}
import Point from "./Point";
