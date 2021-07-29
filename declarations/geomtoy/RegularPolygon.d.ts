import Point from "./Point";
import Line from "./Line";
import { Coordinate } from "./types";
declare class RegularPolygon {
    #private;
    constructor(radius: number, centerX: number, centerY: number, number: number, rotation: number);
    constructor(radius: number, centerPosition: Coordinate | Point, number: number, rotation: number);
    get radius(): number;
    set radius(value: number);
    get centerPoint(): Point;
    set centerPoint(value: Point);
    get number(): number;
    set number(value: number);
    get rotation(): number;
    set rotation(value: number);
    get points(): Point[];
    get lines(): Line[];
    getApothem(): number;
    getEdgeLength(): number;
}
export default RegularPolygon;
