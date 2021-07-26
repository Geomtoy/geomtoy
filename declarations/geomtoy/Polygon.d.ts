import Point from "./Point";
import { Coordinate } from "./types";
import Rectangle from "./Rectangle";
declare class Polygon {
    #private;
    constructor(points: Array<Point>);
    constructor(points: Array<Coordinate>);
    constructor(...points: Array<Point>);
    constructor(...points: Array<Coordinate>);
    get points(): Point[];
    set points(value: Point[]);
    get pointCount(): number;
    getPoint(index: number): Point | undefined;
    isPointsConcyclic(): void;
    getPerimeter(): number;
    getArea(signed?: boolean): number;
    getMeanPoint(): number[];
    getCentroidPoint(): Point;
    getBoundingRectangle(): Rectangle;
}
export default Polygon;
