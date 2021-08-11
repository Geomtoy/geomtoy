import Point from "../Point";
import Circle from "../Circle";
import Line from "../Line";
import GeomObject from "../base/GeomObject";
import Geomtoy from "..";
declare class Inversion extends GeomObject {
    #private;
    constructor(owner: Geomtoy, power: number, centerX: number, centerY: number);
    constructor(owner: Geomtoy, power: number, centerCoordinate: [number, number]);
    constructor(owner: Geomtoy, power: number, centerPoint: Point);
    get name(): string;
    get uuid(): string;
    get power(): number;
    set power(value: number);
    get centerX(): number;
    set centerX(value: number);
    get centerY(): number;
    set centerY(value: number);
    get centerCoordinate(): [number, number];
    set centerCoordinate(value: [number, number]);
    get centerPoint(): Point;
    set centerPoint(value: Point);
    /**
     * Find the inversion of point `point`
     * @param {Point} point
     * @returns {Point}
     */
    invertPoint(point: Point): Point;
    /**
     * Find the inversion of line `line`.
     * @description
     * If line `line` passes through the inversion center, return itself(cloned).
     * If line `line` does not pass through the inversion center, return the inverted circle.
     * @param {Line} line
     * @returns {Line | Circle}
     */
    invertLine(line: Line): Line | Circle;
    /**
     * 求`圆circle`的反形，若圆过反演中心，则返回反形直线，若圆不过反演中心，则返回反形圆
     * @param {Circle} circle
     * @returns {Line | Circle}
     */
    invertCircle(circle: Circle): Line | Circle;
    clone(): Inversion;
    toString(): string;
    toObject(): object;
    toArray(): any[];
}
export default Inversion;
