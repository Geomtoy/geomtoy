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
import type { OwnerCarrier, Direction, ClosedShape, TransformableShape, RotationFeaturedShape } from "../../types";

class Ellipse extends Shape implements ClosedShape, TransformableShape, RotationFeaturedShape {
    private _centerX = NaN;
    private _centerY = NaN;
    private _radiusX = NaN;
    private _radiusY = NaN;
    private _rotation = 0;
    private _windingDirection = "positive" as Direction;

    constructor(owner: Geomtoy, centerX: number, centerY: number, radiusX: number, radiusY: number, rotation?: number);
    constructor(owner: Geomtoy, centerCoordinates: [number, number], radiusX: number, radiusY: number, rotation?: number);
    constructor(owner: Geomtoy, centerPoint: Point, radiusX: number, radiusY: number, rotation?: number);
    constructor(owner: Geomtoy);
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any) {
        super(o);
        if (util.isNumber(a1)) {
            Object.assign(this, { centerX: a1, centerY: a2, radiusX: a3, radiusY: a4, rotation: a5 ?? 0 });
        }
        if (util.isArray(a1)) {
            Object.assign(this, { centerCoordinates: a1, radiusX: a2, radiusY: a3, rotation: a4 ?? 0 });
        }
        if (a1 instanceof Point) {
            Object.assign(this, { centerPoint: a1, radiusX: a2, radiusY: a3, rotation: a4 ?? 0 });
        }
        return Object.seal(this);
    }

    static readonly events = Object.freeze({
        centerXChanged: "centerX" as const,
        centerYChanged: "centerY" as const,
        radiusXChanged: "radiusX" as const,
        radiusYChanged: "radiusY" as const,
        rotationChanged: "rotation" as const
    });

    private _setCenterX(value: number) {
        if (!util.isEqualTo(this._centerX, value)) this.trigger_(EventObject.simple(this, Ellipse.events.centerXChanged));
        this._centerX = value;
    }
    private _setCenterY(value: number) {
        if (!util.isEqualTo(this._centerY, value)) this.trigger_(EventObject.simple(this, Ellipse.events.centerYChanged));
        this._centerY = value;
    }
    private _setRadiusX(value: number) {
        if (!util.isEqualTo(this._radiusX, value)) this.trigger_(EventObject.simple(this, Ellipse.events.radiusXChanged));
        this._radiusX = value;
    }
    private _setRadiusY(value: number) {
        if (!util.isEqualTo(this._radiusY, value)) this.trigger_(EventObject.simple(this, Ellipse.events.radiusYChanged));
        this._radiusY = value;
    }
    private _setRotation(value: number) {
        if (!util.isEqualTo(this._rotation, value)) this.trigger_(EventObject.simple(this, Ellipse.events.rotationChanged));
        this._rotation = value;
    }

    get centerX() {
        return this._centerX;
    }
    set centerX(value) {
        assert.isRealNumber(value, "centerX");
        this._setCenterX(value);
    }
    get centerY() {
        return this._centerY;
    }
    set centerY(value) {
        assert.isRealNumber(value, "centerY");
        this._setCenterY(value);
    }
    get centerCoordinates() {
        return [this._centerX, this._centerY] as [number, number];
    }
    set centerCoordinates(value) {
        assert.isCoordinates(value, "centerCoordinates");
        this._setCenterX(coord.x(value));
        this._setCenterY(coord.y(value));
    }
    get centerPoint() {
        return new Point(this.owner, this._centerX, this._centerY);
    }
    set centerPoint(value) {
        this._setCenterX(value.x);
        this._setCenterY(value.y);
    }
    get radiusX() {
        return this._radiusX;
    }
    set radiusX(value) {
        assert.isPositiveNumber(value, "radiusX");
        this._setRadiusX(value);
    }
    get radiusY() {
        return this._radiusY;
    }
    set radiusY(value) {
        assert.isPositiveNumber(value, "radiusY");
        this._setRadiusY(value);
    }
    get rotation() {
        return this._rotation;
    }
    set rotation(value) {
        assert.isRealNumber(value, "rotation");
        this._setRotation(value);
    }

    isValid() {
        const { centerCoordinates: cc, radiusX: rx, radiusY: ry } = this;
        if (!coord.isValid(cc)) return false;
        if (!util.isPositiveNumber(rx)) return false;
        if (!util.isPositiveNumber(ry)) return false;
        return true;
    }
    getLength(): number {
        throw new Error("Method not implemented.");
    }
    isPointOn(point: [number, number] | Point): boolean {
        throw new Error("Method not implemented.");
    }
    isPointOutside(point: [number, number] | Point): boolean {
        throw new Error("Method not implemented.");
    }
    isPointInside(point: [number, number] | Point): boolean {
        throw new Error("Method not implemented.");
    }
    /**
     * Move ellipse `this` by `offsetX` and `offsetY` to get new ellipse.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY);
    }
    /**
     * Move ellipse `this` itself by `offsetX` and `offsetY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.centerCoordinates = coord.move(this.centerCoordinates, deltaX, deltaY);
        return this;
    }
    /**
     * Move ellipse `this` with `distance` along `angle` to get new ellipse.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance);
    }
    /**
     * Move ellipse `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        this.centerCoordinates = coord.moveAlongAngle(this.centerCoordinates, angle, distance);
        return this;
    }

    getWindingDirection() {
        return this._windingDirection;
    }
    setWindingDirection(direction: Direction) {
        this._windingDirection = direction;
    }

    getEccentricity() {}
    //https://www.coder.work/article/1220553
    static findTangentLineOfTwoEllipse(ellipse1: Ellipse, ellipse2: Ellipse) {}

    //https://zhuanlan.zhihu.com/p/64550850
    static findTangentLineOfEllipseAndParabola() {}

    getPerimeter(): number {
        throw new Error("Method not implemented.");
    }
    getArea(): number {
        throw new Error("Method not implemented.");
    }
    apply(transformation: Transformation): Shape {
        throw new Error("Method not implemented.");
    }
    getGraphics() {
        const g = new Graphics();
        if (!this.isValid()) return g;

        const { centerX, centerY, radiusX, radiusY, rotation } = this;
        g.centerArcTo(centerX, centerY, radiusX, radiusY, rotation, 0, 2 * Math.PI);
        return g;
    }
    clone() {
        return new Ellipse(this.owner, this.centerX, this.centerY, this.radiusX, this.radiusY, this.rotation);
    }
    copyFrom(shape: Ellipse | null) {
        if (shape === null) shape = new Ellipse(this.owner);
        this._setCenterX(shape._centerX);
        this._setCenterY(shape._centerY);
        this._setRadiusX(shape._radiusX);
        this._setRadiusY(shape._radiusY);
        this._setRotation(shape._rotation);
        return this;
    }
    toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\tcenterX: ${this.centerX}`,
            `\tcenterY: ${this.centerY}`,
            `\tradiusX: ${this.radiusX}`,
            `\tradiusY: ${this.radiusY}`,
            `\trotation: ${this.rotation}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n");
    }
    toArray() {
        return [this.centerX, this.centerY, this.radiusX, this.radiusY, this.rotation];
    }
    toObject() {
        return {
            centerX: this.centerX,
            centerY: this.centerY,
            radiusX: this.radiusX,
            radiusY: this.radiusY,
            rotation: this.rotation
        };
    }
}

validAndWithSameOwner(Ellipse);
/**
 * @category Shape
 */
export default Ellipse;
