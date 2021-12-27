import { validAndWithSameOwner } from "../../decorator";
import assert from "../../utility/assertion";
import util from "../../utility";
import coord from "../../utility/coord";

import Shape from "../../base/Shape";
import Point from "./Point";
import Graphics from "../../graphics";
import EventObject from "../../event/EventObject";

import type Geomtoy from "../..";
import type Transformation from "../../transformation";
import type { FiniteOpenShape, TransformableShape } from "../../types";

class Bezier extends Shape implements FiniteOpenShape, TransformableShape {
    private _point1X = NaN;
    private _point1Y = NaN;
    private _point2X = NaN;
    private _point2Y = NaN;
    private _controlPoint1X = NaN;
    private _controlPoint1Y = NaN;
    private _controlPoint2X = NaN;
    private _controlPoint2Y = NaN;

    constructor(owner: Geomtoy, point1X: number, point1Y: number, point2X: number, point2Y: number, controlPoint1X: number, controlPoint1Y: number, controlPoint2X: number, controlPoint2Y: number);
    constructor(owner: Geomtoy, point1Coordinates: [number, number], point2Coordinates: [number, number], controlPoint1Coordinates: [number, number], controlPoint2Coordinates: [number, number]);
    constructor(owner: Geomtoy, point1: Point, point2: Point, controlPoint1: Point, controlPoint2: Point);
    constructor(owner: Geomtoy);
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any, a6?: any, a7?: any, a8?: any) {
        super(o);
        if (util.isNumber(a1)) {
            Object.assign(this, { point1X: a1, point1Y: a2, point2X: a3, point2Y: a4, controlPoint1X: a5, controlPoint1Y: a6, controlPoint2X: a7, controlPoint2Y: a8 });
        }
        if (util.isArray(a1)) {
            Object.assign(this, { point1Coordinates: a1, point2Coordinates: a2, controlPoint1Coordinates: a3, controlPoint2Coordinates: a4 });
        }
        if (a1 instanceof Point) {
            Object.assign(this, { point1: a1, point2: a2, controlPoint1: a3, controlPoint2: a4 });
        }

        return Object.seal(this);
    }

    static readonly events = Object.freeze({
        point1XChanged: "point1X" as const,
        point1YChanged: "point1Y" as const,
        point2XChanged: "point2X" as const,
        point2YChanged: "point2Y" as const,
        controlPoint1XChanged: "controlPoint1X" as const,
        controlPoint1YChanged: "controlPoint1Y" as const,
        controlPoint2XChanged: "controlPoint2X" as const,
        controlPoint2YChanged: "controlPoint2Y" as const
    });

    private _setPoint1X(value: number) {
        if (!util.isEqualTo(this._point1X, value)) this.trigger_(EventObject.simple(this, Bezier.events.point1XChanged));
        this._point1X = value;
    }
    private _setPoint1Y(value: number) {
        if (!util.isEqualTo(this._point1Y, value)) this.trigger_(EventObject.simple(this, Bezier.events.point1YChanged));
        this._point1Y = value;
    }
    private _setPoint2X(value: number) {
        if (!util.isEqualTo(this._point2X, value)) this.trigger_(EventObject.simple(this, Bezier.events.point2XChanged));
        this._point2X = value;
    }
    private _setPoint2Y(value: number) {
        if (!util.isEqualTo(this._point2Y, value)) this.trigger_(EventObject.simple(this, Bezier.events.point2YChanged));
        this._point2Y = value;
    }
    private _setControlPoint1X(value: number) {
        if (!util.isEqualTo(this._controlPoint1X, value)) this.trigger_(EventObject.simple(this, Bezier.events.controlPoint1XChanged));
        this._controlPoint1X = value;
    }
    private _setControlPoint1Y(value: number) {
        if (!util.isEqualTo(this._controlPoint1Y, value)) this.trigger_(EventObject.simple(this, Bezier.events.controlPoint1YChanged));
        this._controlPoint1Y = value;
    }
    private _setControlPoint2X(value: number) {
        if (!util.isEqualTo(this._controlPoint2X, value)) this.trigger_(EventObject.simple(this, Bezier.events.controlPoint2XChanged));
        this._controlPoint2X = value;
    }
    private _setControlPoint2Y(value: number) {
        if (!util.isEqualTo(this._controlPoint2Y, value)) this.trigger_(EventObject.simple(this, Bezier.events.controlPoint2YChanged));
        this._controlPoint2Y = value;
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
    get point1Coordinates() {
        return [this._point1X, this._point1Y] as [number, number];
    }
    set point1Coordinates(value) {
        assert.isCoordinates(value, "point1Coordinates");
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
    get point2Coordinates() {
        return [this._point2X, this._point2Y] as [number, number];
    }
    set point2Coordinates(value) {
        assert.isCoordinates(value, "point2Coordinates");
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
    get controlPoint1X() {
        return this._controlPoint1X;
    }
    set controlPoint1X(value) {
        assert.isRealNumber(value, "controlPoint1X");
        this._setControlPoint1X(value);
    }
    get controlPoint1Y() {
        return this._controlPoint1Y;
    }
    set controlPoint1Y(value) {
        assert.isRealNumber(value, "controlPoint1Y");
        this._setControlPoint1Y(value);
    }
    get controlPoint1Coordinates() {
        return [this._controlPoint1X, this._controlPoint1Y] as [number, number];
    }
    set controlPoint1Coordinates(value) {
        assert.isCoordinates(value, "controlPoint1Coordinates");
        this._setControlPoint1X(coord.x(value));
        this._setControlPoint1Y(coord.y(value));
    }
    get controlPoint1() {
        return new Point(this.owner, this._controlPoint1X, this._controlPoint1Y);
    }
    set controlPoint1(value) {
        assert.isPoint(value, "controlPoint1");
        this._setControlPoint1X(value.x);
        this._setControlPoint1Y(value.y);
    }
    get controlPoint2X() {
        return this._controlPoint2X;
    }
    set controlPoint2X(value) {
        assert.isRealNumber(value, "controlPoint2X");
        this._setControlPoint2X(value);
    }
    get controlPoint2Y() {
        return this._controlPoint2Y;
    }
    set controlPoint2Y(value) {
        assert.isRealNumber(value, "controlPoint2Y");
        this._setControlPoint2Y(value);
    }
    get controlPoint2Coordinates() {
        return [this._controlPoint2X, this._controlPoint2Y] as [number, number];
    }
    set controlPoint2Coordinates(value) {
        assert.isCoordinates(value, "controlPoint2Coordinates");
        this._setControlPoint2X(coord.x(value));
        this._setControlPoint2Y(coord.y(value));
    }
    get controlPoint2() {
        return new Point(this.owner, this._controlPoint2X, this._controlPoint2Y);
    }
    set controlPoint2(value) {
        assert.isPoint(value, "controlPoint2");
        this._setControlPoint2X(value.x);
        this._setControlPoint2Y(value.y);
    }

    isValid() {
        const { point1Coordinates: c1, point2Coordinates: c2, controlPoint1Coordinates: cpc1, controlPoint2Coordinates: cpc2 } = this;
        const epsilon = this.options_.epsilon;
        if (!coord.isValid(c1)) return false;
        if (!coord.isValid(c2)) return false;
        if (!coord.isValid(cpc1)) return false;
        if (!coord.isValid(cpc2)) return false;
        if (coord.isSameAs(c1, c2, epsilon)) return false;
        return true;
    }
    /**
     * Whether the three vertices of triangle `this` is the same as triangle `triangle` ignoring the order of the vertices.
     * @param triangle
     */
    isSameAs(bezier: Bezier) {
        const epsilon = this.options_.epsilon;
        return true;
    }

    isSameAs2(bezier: Bezier) {
        const epsilon = this.options_.epsilon;
        return (
            coord.isSameAs(this.point1Coordinates, bezier.point1Coordinates, epsilon) &&
            coord.isSameAs(this.point2Coordinates, bezier.point2Coordinates, epsilon) &&
            coord.isSameAs(this.controlPoint1Coordinates, bezier.controlPoint1Coordinates, epsilon) &&
            coord.isSameAs(this.controlPoint2Coordinates, bezier.controlPoint2Coordinates, epsilon)
        );
    }

    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY);
    }
    moveSelf(deltaX: number, deltaY: number) {
        this.point1Coordinates = coord.move(this.point1Coordinates, deltaX, deltaY);
        this.point2Coordinates = coord.move(this.point2Coordinates, deltaX, deltaY);
        this.controlPoint1Coordinates = coord.move(this.controlPoint1Coordinates, deltaX, deltaY);
        this.controlPoint2Coordinates = coord.move(this.controlPoint2Coordinates, deltaX, deltaY);
        return this;
    }
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance);
    }
    moveAlongAngleSelf(angle: number, distance: number) {
        this.point1Coordinates = coord.moveAlongAngle(this.point1Coordinates, angle, distance);
        this.point2Coordinates = coord.moveAlongAngle(this.point2Coordinates, angle, distance);
        this.controlPoint1Coordinates = coord.moveAlongAngle(this.controlPoint1Coordinates, angle, distance);
        this.controlPoint2Coordinates = coord.moveAlongAngle(this.controlPoint2Coordinates, angle, distance);
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

        const { point1Coordinates: c1, point2Coordinates: c2, controlPoint1Coordinates: cpc1, controlPoint2Coordinates: cpc2 } = this;
        g.moveTo(...c1);
        g.bezierCurveTo(...cpc1, ...cpc2, ...c2);
        return g;
    }
    clone() {
        return new Bezier(this.owner, this.point1X, this.point1Y, this.point2X, this.point2Y, this.controlPoint1X, this.controlPoint1Y, this.controlPoint2X, this.controlPoint2Y);
    }
    copyFrom(shape: Bezier | null) {
        if (shape === null) shape = new Bezier(this.owner);
        this._setPoint1X(shape._point1X);
        this._setPoint1Y(shape._point1Y);
        this._setPoint2X(shape._point2X);
        this._setPoint2Y(shape._point2Y);
        this._setControlPoint1X(shape._controlPoint1X);
        this._setControlPoint1Y(shape._controlPoint1Y);
        this._setControlPoint2X(shape._controlPoint2X);
        this._setControlPoint2Y(shape._controlPoint2Y);
        return this;
    }
    toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\tpoint1X: ${this.point1X}`,
            `\tpoint1Y: ${this.point1Y}`,
            `\tpoint2X: ${this.point2X}`,
            `\tpoint2Y: ${this.point2Y}`,
            `\tcontrolPoint1X: ${this.controlPoint1X}`,
            `\tcontrolPoint1Y: ${this.controlPoint1Y}`,
            `\tcontrolPoint2X: ${this.controlPoint2X}`,
            `\tcontrolPoint2Y: ${this.controlPoint2Y}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n");
    }
    toArray() {
        return [this.point1X, this.point1Y, this.point2X, this.point2Y, this.controlPoint1X, this.controlPoint1Y, this.controlPoint2X, this.controlPoint2Y];
    }
    toObject() {
        return {
            point1X: this.point1X,
            point1Y: this.point1Y,
            point2X: this.point2X,
            point2Y: this.point2Y,
            controlPoint1X: this.controlPoint1X,
            controlPoint1Y: this.controlPoint1Y,
            controlPoint2X: this.controlPoint2X,
            controlPoint2Y: this.controlPoint2Y
        };
    }
}

validAndWithSameOwner(Bezier);
/**
 *
 * @category Shape
 */
export default Bezier;
