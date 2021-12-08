import { validAndWithSameOwner } from "../../decorator";
import assert from "../../utility/assertion";
import util from "../../utility";
import coord from "../../utility/coordinate";
import math from "../../utility/math";
import vec2 from "../../utility/vec2";
import angle from "../../utility/angle";

import Shape from "../../base/Shape";
import Point from "./Point";
import Line from "./Line";
import Graphics from "../../graphics";
import EventObject from "../../event/EventObject";

import type Geomtoy from "../..";
import type Transformation from "../../transformation";
import type { InfiniteOpenShape, TransformableShape } from "../../types";
class Ray extends Shape implements InfiniteOpenShape, TransformableShape {
    private _x = NaN;
    private _y = NaN;
    private _angle = NaN;

    constructor(owner: Geomtoy, x: number, y: number, angle: number);
    constructor(owner: Geomtoy, coordinate: [number, number], angle: number);
    constructor(owner: Geomtoy, point: Point, angle: number);
    constructor(owner: Geomtoy);
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any) {
        super(o);
        if (util.isNumber(a1)) {
            Object.assign(this, { x: a1, y: a2, angle: a3 });
        }
        if (util.isArray(a1)) {
            Object.assign(this, { coordinate: a1, angle: a2 });
        }
        if (a1 instanceof Point) {
            Object.assign(this, { point: a1, angle: a2 });
        }
        return Object.seal(this);
    }

    static readonly events = Object.freeze({
        xChanged: "x" as const,
        yChanged: "y" as const,
        angleChanged: "angle" as const
    });

    private _setX(value: number) {
        if (!util.isEqualTo(this._x, value)) this.trigger_(EventObject.simple(this, Ray.events.xChanged));
        this._x = value;
    }
    private _setY(value: number) {
        if (!util.isEqualTo(this._y, value)) this.trigger_(EventObject.simple(this, Ray.events.yChanged));
        this._y = value;
    }
    private _setAngle(value: number) {
        if (!util.isEqualTo(this._angle, value)) this.trigger_(EventObject.simple(this, Ray.events.angleChanged));
        this._angle = value;
    }

    get x() {
        return this._x;
    }
    set x(value) {
        assert.isRealNumber(value, "x");
        this._setX(value);
    }
    get y() {
        return this._y;
    }
    set y(value) {
        assert.isRealNumber(value, "y");
        this._setY(value);
    }
    get coordinate() {
        return [this._x, this._y] as [number, number];
    }
    set coordinate(value) {
        assert.isCoordinate(value, "coordinate");
        this._setX(coord.x(value));
        this._setY(coord.y(value));
    }
    get point() {
        return new Point(this.owner, this._x, this._y);
    }
    set point(value) {
        assert.isPoint(value, "point");
        this._setX(value.x);
        this._setY(value.y);
    }
    get angle() {
        return this._angle;
    }
    set angle(value) {
        assert.isRealNumber(value, "angle");
        this._setAngle(value);
    }

    isValid(): boolean {
        const { coordinate: c, angle: a } = this;
        if (!coord.isValid(c)) return false;
        if (!util.isRealNumber(a)) return false;
        return true;
    }
    isPointOn(point: [number, number] | Point) {
        const epsilon = this.options_.epsilon;
        const c0 = this.coordinate;
        const c1 = point instanceof Point ? point.coordinate : point;
        if (coord.isSameAs(c0, c1, epsilon)) return true;
        return math.equalTo(vec2.angle(vec2.from(c0, c1)), this.angle, epsilon);
    }
    /**
     * Get the `n` section(equal) rays of the angle which is formed by rays `ray1` and `ray2`.
     * @description
     * If `n` is not integer, return `null`.
     * If `ray1` and `ray2` have different endpoint, return `null`.
     * @param n
     * @param ray1
     * @param ray2
     */
    static getAngleNSectionRaysFromTwoRays(owner: Geomtoy, n: number, ray1: Ray, ray2: Ray): Ray[] | null {
        if (!util.isInteger(n) || n < 2) return null;
        if (!ray1.isEndpointSameAs(ray2)) return null;
        let a1 = ray1.angle,
            a2 = ray2.angle,
            c = ray1.coordinate,
            d = (a2 - a1) / n,
            ret: Ray[] = [];
        util.range(1, n).forEach(index => {
            ret.push(new Ray(owner, c, a1 + d * index));
        });
        return ret;
    }

    isSameAs(ray: Ray) {
        const epsilon = this.options_.epsilon;
        return coord.isSameAs(this.coordinate, ray.coordinate, epsilon) && math.equalTo(this.angle, ray.angle, epsilon), epsilon;
    }
    isEndpointSameAs(ray: Ray) {
        const epsilon = this.options_.epsilon;
        return coord.isSameAs(this.coordinate, ray.coordinate, epsilon);
    }

    /**
     * Move ray `this` by `offsetX` and `offsetY` to get new ray.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY);
    }
    /**
     * Move ray `this` itself by `offsetX` and `offsetY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.coordinate = coord.move(this.coordinate, deltaX, deltaY);
        return this;
    }
    /**
     * Move ray `this` with `distance` along `angle` to get new ray.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance);
    }
    /**
     * Move ray `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        this.coordinate = coord.moveAlongAngle(this.coordinate, angle, distance);
        return this;
    }

    getAngleToRay(ray: Ray) {
        return angle.simplify2(this.angle - ray.angle);
    }

    getUnderlyingLine() {
        return Line.fromPointAndAngle(this.owner, this.point, this.angle);
    }

    apply(transformation: Transformation): Shape {
        throw new Error("Method not implemented.");
    }
    getGraphics() {
        const g = new Graphics();
        if (!this.isValid) return g;
        throw new Error("Method not implemented.");
    }

    clone() {
        return new Ray(this.owner, this.x, this.y, this.angle);
    }
    copyFrom(shape: Ray | null) {
        if (shape === null) shape = new Ray(this.owner);
        this._setX(shape._x);
        this._setY(shape._y);
        this._setAngle(shape._angle);
        return this;
    }
    toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\tx: ${this.x}`,
            `\ty: ${this.y}`,
            `\tangle: ${this.angle}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n")
    }
    toArray() {
        return [this.x, this.y, this.angle];
    }
    toObject() {
        return { x: this.x, y: this.y, angle: this.angle };
    }
}

validAndWithSameOwner(Ray);
/**
 * @category Shape
 */
export default Ray;
