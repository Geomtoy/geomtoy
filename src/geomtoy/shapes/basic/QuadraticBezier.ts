import { validAndWithSameOwner } from "../../decorator";
import assert from "../../utility/assertion";
import util from "../../utility";
import coord from "../../utility/coordinate";

import Shape from "../../base/Shape";
import Point from "./Point";
import Graphics from "../../graphics";
import EventObject from "../../event/EventObject";

import type Geomtoy from "../..";
import type Transformation from "../../transformation";
import type { FiniteOpenShape, TransformableShape } from "../../types";

class QuadraticBezier extends Shape implements FiniteOpenShape, TransformableShape {
    private _point1X = NaN;
    private _point1Y = NaN;
    private _point2X = NaN;
    private _point2Y = NaN;
    private _controlPointX = NaN;
    private _controlPointY = NaN;

    constructor(owner: Geomtoy, point1X: number, point1Y: number, point2X: number, point2Y: number, controlPointX: number, controlPointY: number);
    constructor(owner: Geomtoy, point1Coordinate: [number, number], point2Coordinate: [number, number], controlPointCoordinate: [number, number]);
    constructor(owner: Geomtoy, point1: Point, point2: Point, controlPoint: Point);
    constructor(owner: Geomtoy);
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any, a6?: any) {
        super(o);
        if (util.isNumber(a1)) {
            Object.assign(this, { point1X: a1, point1Y: a2, point2X: a3, point2Y: a4, controlPointX: a5, controlPointY: a6 });
        }
        if (util.isArray(a1)) {
            Object.assign(this, { point1Coordinate: a1, point2Coordinate: a2, controlPointCoordinate: a3 });
        }
        if (a1 instanceof Point) {
            Object.assign(this, { point1: a1, point2: a2, controlPoint: a3 });
        }
        return Object.seal(this);
    }

    static readonly events = Object.freeze({
        point1XChanged: "point1X" as const,
        point1YChanged: "point1Y" as const,
        point2XChanged: "point2X" as const,
        point2YChanged: "point2Y" as const,
        controlPointXChanged: "controlPointX" as const,
        controlPointYChanged: "controlPointY" as const
    });

    private _setPoint1X(value: number) {
        if (!util.isEqualTo(this._point1X, value)) this.trigger_(EventObject.simple(this, QuadraticBezier.events.point1XChanged));
        this._point1X = value;
    }
    private _setPoint1Y(value: number) {
        if (!util.isEqualTo(this._point1Y, value)) this.trigger_(EventObject.simple(this, QuadraticBezier.events.point1YChanged));
        this._point1Y = value;
    }
    private _setPoint2X(value: number) {
        if (!util.isEqualTo(this._point2X, value)) this.trigger_(EventObject.simple(this, QuadraticBezier.events.point2XChanged));
        this._point2X = value;
    }
    private _setPoint2Y(value: number) {
        if (!util.isEqualTo(this._point2Y, value)) this.trigger_(EventObject.simple(this, QuadraticBezier.events.point2YChanged));
        this._point2Y = value;
    }
    private _setControlPointX(value: number) {
        if (!util.isEqualTo(this._controlPointX, value)) this.trigger_(EventObject.simple(this, QuadraticBezier.events.controlPointXChanged));
        this._controlPointX = value;
    }
    private _setControlPointY(value: number) {
        if (!util.isEqualTo(this._controlPointY, value)) this.trigger_(EventObject.simple(this, QuadraticBezier.events.controlPointYChanged));
        this._controlPointY = value;
    }

    get point1X() {
        return this._point1X;
    }
    set point1X(value) {
        assert.isRealNumber(value, "point1X");
        this._setPoint1X(value);
    }
    get point1Y() {
        return this._point1Y;
    }
    set point1Y(value) {
        assert.isRealNumber(value, "point1Y");
        this._setPoint1Y(value);
    }
    get point1Coordinate() {
        return [this._point1X, this._point1Y] as [number, number];
    }
    set point1Coordinate(value) {
        assert.isCoordinate(value, "point1Coordinate");
        this._setPoint1X(coord.x(value));
        this._setPoint1Y(coord.y(value));
    }
    get point1() {
        return new Point(this.owner, this._point1X, this._point1Y);
    }
    set point1(value) {
        assert.isPoint(value, "point1");
        this._setPoint1X(value.x);
        this._setPoint1Y(value.y);
    }
    get point2X() {
        return this._point2X;
    }
    set point2X(value) {
        assert.isRealNumber(value, "point2X");
        this._setPoint2X(value);
    }
    get point2Y() {
        return this._point2Y;
    }
    set point2Y(value) {
        assert.isRealNumber(value, "point2Y");
        this._setPoint2Y(value);
    }
    get point2Coordinate() {
        return [this._point2X, this._point2Y] as [number, number];
    }
    set point2Coordinate(value) {
        assert.isCoordinate(value, "point2Coordinate");
        this._setPoint2X(coord.x(value));
        this._setPoint2Y(coord.y(value));
    }
    get point2() {
        return new Point(this.owner, this._point2X, this._point2Y);
    }
    set point2(value) {
        assert.isPoint(value, "point2");
        this._setPoint2X(value.x);
        this._setPoint2Y(value.y);
    }
    get controlPointX() {
        return this._controlPointX;
    }
    set controlPointX(value) {
        assert.isRealNumber(value, "controlPointX");
        this._setControlPointX(value);
    }
    get controlPointY() {
        return this._controlPointY;
    }
    set controlPointY(value) {
        assert.isRealNumber(value, "controlPointY");
        this._setControlPointY(value);
    }
    get controlPointCoordinate() {
        return [this._controlPointX, this._controlPointY] as [number, number];
    }
    set controlPointCoordinate(value) {
        assert.isCoordinate(value, "controlPointCoordinate");
        this._setControlPointX(coord.x(value));
        this._setControlPointY(coord.y(value));
    }
    get controlPoint() {
        return new Point(this.owner, this._controlPointX, this._controlPointY);
    }
    set controlPoint(value) {
        assert.isPoint(value, "controlPoint");
        this._setControlPointX(value.x);
        this._setControlPointY(value.y);
    }

    isValid() {
        const { point1Coordinate: c1, point2Coordinate: c2, controlPointCoordinate: cpc } = this;
        const epsilon = this.options_.epsilon;
        if (!coord.isValid(c1)) return false;
        if (!coord.isValid(c2)) return false;
        if (!coord.isValid(cpc)) return false;
        if (coord.isSameAs(c1, c2, epsilon)) return false;
        return true;
    }
    /**
     * Whether the three vertices of triangle `this` is the same as triangle `triangle` ignoring the order of the vertices.
     * @param triangle
     */
    isSameAs(quadraticBezier: QuadraticBezier) {
        const epsilon = this.options_.epsilon;
        return true;
    }
    /**
     * Whether the three vertices of triangle `this` is the same as triangle `triangle` considering the order of vertices.
     * @param triangle
     */
    isSameAs2(quadraticBezier: QuadraticBezier) {
        const epsilon = this.options_.epsilon;
        return (
            coord.isSameAs(this.point1Coordinate, quadraticBezier.point1Coordinate, epsilon) &&
            coord.isSameAs(this.point2Coordinate, quadraticBezier.point2Coordinate, epsilon) &&
            coord.isSameAs(this.controlPointCoordinate, quadraticBezier.controlPointCoordinate, epsilon)
        );
    }
    /**
     * Move triangle `this` by `offsetX` and `offsetY` to get new triangle.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY);
    }
    /**
     * Move triangle `this` itself by `offsetX` and `offsetY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.point1Coordinate = coord.move(this.point1Coordinate, deltaX, deltaY);
        this.point2Coordinate = coord.move(this.point2Coordinate, deltaX, deltaY);
        this.controlPointCoordinate = coord.move(this.controlPointCoordinate, deltaX, deltaY);
        return this;
    }
    /**
     * Move triangle `this` with `distance` along `angle` to get new triangle.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance);
    }
    /**
     * Move triangle `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        this.point1Coordinate = coord.moveAlongAngle(this.point1Coordinate, angle, distance);
        this.point2Coordinate = coord.moveAlongAngle(this.point2Coordinate, angle, distance);
        this.controlPointCoordinate = coord.moveAlongAngle(this.controlPointCoordinate, angle, distance);
        return this;
    }

    /**
     * Get perimeter of triangle `this`.
     */
    getLength() {
        return 0;
        // return this.side1Length + this.side2Length + this.side3Length
    }

    isPointOn(point: Point): boolean {
        return true;
    }
    apply(transformation: Transformation): Shape {
        throw new Error("Method not implemented.");
    }
    getGraphics() {
        const g = new Graphics();
        if (!this.isValid()) return g;

        const { point1Coordinate: c1, point2Coordinate: c2, controlPointCoordinate: cpc } = this;
        g.moveTo(...c1);
        g.quadraticBezierCurveTo(...cpc, ...c2);
        return g;
    }
    clone() {
        return new QuadraticBezier(this.owner, this.point1X, this.point1Y, this.point2X, this.point2Y, this.controlPointX, this.controlPointY);
    }
    copyFrom(shape: QuadraticBezier | null) {
        if (shape === null) shape = new QuadraticBezier(this.owner);
        this._setPoint1X(shape._point1X);
        this._setPoint1Y(shape._point1Y);
        this._setPoint2X(shape._point2X);
        this._setPoint2Y(shape._point2Y);
        this._setControlPointX(shape._controlPointX);
        this._setControlPointY(shape._controlPointY);
        return this;
    }
    toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\tpoint1X: ${this.point1X}`,
            `\tpoint1Y: ${this.point1Y}`,
            `\tpoint2X: ${this.point2X}`,
            `\tpoint2Y: ${this.point2Y}`,
            `\tcontrolPointX: ${this.controlPointX}`,
            `\tcontrolPointY: ${this.controlPointY}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n");
    }
    toArray() {
        return [this.point1X, this.point1Y, this.point2X, this.point2Y, this.controlPointX, this.controlPointY];
    }
    toObject() {
        return {
            point1X: this.point1X,
            point1Y: this.point1Y,
            point2X: this.point2X,
            point2Y: this.point2Y,
            controlPointX: this.controlPointX,
            controlPointY: this.controlPointY
        };
    }
}

validAndWithSameOwner(QuadraticBezier);
/**
 *
 * @category Shape
 */
export default QuadraticBezier;
