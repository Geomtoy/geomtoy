import Vector from "./Vector";
import Size from "./Size";
import Segment from "./Segment";
import Line from "./Line";
import { Coordinate } from "./types";
import Circle from "./Circle";
import { GraphicImplType } from "./types";
import Matrix from "./transformation/Matrix";
import GeomObjectD0 from "./base/GeomObjectD0";
declare class Point extends GeomObjectD0 {
    x: number;
    y: number;
    transformation: Matrix;
    constructor(x: number, y: number);
    constructor(coordinate: Coordinate);
    constructor(point: Point);
    constructor(vector: Vector);
    constructor();
    static fromVector(vector: Vector): Point;
    static fromSize(size: Size): Point;
    static get zero(): Point;
    isSameAs(point: Point): boolean;
    done(): void;
    /**
     * 按照给出的角和距离进行移动
     * @param {Number} angle 移动方向，与x轴正方向逆时针/顺时针旋转的角
     * @param {Number} distance 移动距离
     * @returns {Point}
     */
    goTo(angle: number, distance: number): Point;
    goToO(angle: number, distance: number): Point;
    /**
     * 求出`点this`到`点p`之间的距离
     * @param {Point} p
     * @returns {number}
     */
    getDistanceFromPoint(p: Point): number;
    /**
     * 求出`点this`到`点p`之间的距离的平方
     * @param {Point} point
     * @returns {number}
     */
    getDistanceSquareFromPoint(point: Point): number;
    /**
     * 求出`点this`到`直线l`之间的距离
     * @param {Line} l
     * @returns {number}
     */
    getDistanceToLine(l: Line): number;
    /**
     * 求出`点this`到`直线l`之间的带符号距离
     * @param {Line} l
     * @returns {number}
     */
    getSignedDistanceToLine(l: Line): number;
    /**
     * 判断`点this`是否在由`点p1`和`点p2`为对角线的假想矩形内，`点this`的坐标不会大于`点p1`和`点p2`中的最大值，且也不会小于最小值
     * @param {Point} p1
     * @param {Point} p2
     * @param {boolean} allowedOn 是否允许在矩形的上
     * @returns {boolean}
     */
    isBetweenPoints(p1: Point, p2: Point, allowedOn?: boolean): boolean;
    /**
     * `点this`是否在`直线l`上
     * @param {Line} l
     * @returns {boolean}
     */
    isOnLine(l: Line): boolean;
    /**
     * `点this`是否在`线段s`上
     * @param {Segment} s
     * @returns {boolean}
     */
    isOnSegment(s: Segment): boolean;
    isAnEndpointOfSegment(s: Segment): boolean;
    isOnCircle(circle: Circle): boolean;
    isInsideCircle(circle: Circle): boolean;
    isOutsideCircle(circle: Circle): boolean;
    getGraphic(type: GraphicImplType): object[];
    clone(): Point;
    toArray(): number[];
    toObject(): {
        x: number;
        y: number;
    };
    toString(): string;
}
export default Point;
