import Point from "../Point";
import Circle from "../Circle";
import Line from "../Line";
import { Coordinate } from "../types";
declare class Inversion {
    #private;
    constructor(power: number, centerX: number, centerY: number);
    constructor(power: number, centerPosition: Coordinate | Point);
    get power(): number;
    set power(value: number);
    get centerPoint(): Point;
    set centerPoint(value: Point);
    get ix(): number;
    set ix(value: number);
    get iy(): number;
    set iy(value: number);
    /**
     * 求`点point`的反形
     * @param {Point} point
     * @returns {Point}
     */
    invertPoint(point: Point): Point;
    /**
     * 求`直线line`的反形，若直线过反演中心，则返回本身，若直线不过反演中心，则返回反形圆
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
}
export default Inversion;
