import util from "../../utility";
import coord from "../../utility/coord";
import assert from "../../utility/assertion";

import Shape from "../../base/Shape";
import Point from "./Point";
import Graphics from "../../graphics";
import EventObject from "../../event/EventObject";

import type Geomtoy from "../../geomtoy";
import type Transformation from "../../transformation";
import type { ClosedShape, Direction, RotationFeaturedShape, TransformableShape } from "../../types";

class Square extends Shape implements ClosedShape, TransformableShape, RotationFeaturedShape {
    private _originX = NaN;
    private _originY = NaN;
    private _sideLength = NaN;
    private _rotation = 0;

    constructor(owner: Geomtoy, originX: number, originY: number, sideLength: number, rotation?: number);
    constructor(owner: Geomtoy, originCoordinates: [number, number], sideLength: number, rotation?: number);
    constructor(owner: Geomtoy, originPoint: Point, sideLength: number, rotation?: number);
    constructor(owner: Geomtoy);
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any) {
        super(o);
        if (util.isNumber(a1)) {
            Object.assign(this, { originX: a1, originY: a2, sideLength: a3, rotation: a4 ?? 0 });
        }
        if (util.isArray(a1)) {
            Object.assign(this, { originCoordinates: a1, sideLength: a2, rotation: a3 ?? 0 });
        }
        if (a1 instanceof Point) {
            Object.assign(this, { originPoint: a1, sideLength: a2, rotation: a3 ?? 0 });
        }
        return Object.seal(this);
    }

    static readonly events = Object.freeze({
        originXChanged: "originX" as const,
        originYChanged: "originY" as const,
        sideLengthChanged: "sideLength" as const,
        rotation: "rotation" as const
    });

    private _setOriginX(value: number) {
        if (util.isEqualTo(this._originX, value)) this.trigger_(EventObject.simple(this, Square.events.originXChanged));
        this._originX = value;
    }
    private _setOriginY(value: number) {
        if (util.isEqualTo(this._originY, value)) this.trigger_(EventObject.simple(this, Square.events.originYChanged));
        this._originY = value;
    }
    private _setSideLength(value: number) {
        if (util.isEqualTo(this._sideLength, value)) this.trigger_(EventObject.simple(this, Square.events.sideLengthChanged));
        this._sideLength = value;
    }
    private _setRotation(value: number) {
        if (util.isEqualTo(this._rotation, value)) this.trigger_(EventObject.simple(this, Square.events.rotation));
        this._rotation = value;
    }

    get originX() {
        return this._originX;
    }
    set originX(value) {
        assert.isRealNumber(value, "originX");
        this._setOriginX(value);
    }
    get originY() {
        return this._originY;
    }
    set originY(value) {
        assert.isRealNumber(value, "originY");
        this._setOriginY(value);
    }
    get originCoordinates() {
        return [this._originX, this._originY] as [number, number];
    }
    set originCoordinates(value) {
        assert.isCoordinates(value, "originCoordinates");
        this._setOriginX(coord.x(value));
        this._setOriginY(coord.y(value));
    }
    get originPoint() {
        return new Point(this.owner, this._originX, this._originY);
    }
    set originPoint(value) {
        this._setOriginX(value.x);
        this._setOriginY(value.y);
    }
    get sideLength() {
        return this._sideLength;
    }
    set sideLength(value) {
        assert.isPositiveNumber(value, "sideLength");
        this._setSideLength(value);
    }
    get rotation() {
        return this._rotation;
    }
    set rotation(value) {
        assert.isRealNumber(value, "rotation");
        this._setRotation(value);
    }

    isValid(): boolean {
        throw new Error("Method not implemented.");
    }
    move(deltaX: number, deltaY: number): Shape {
        throw new Error("Method not implemented.");
    }
    moveSelf(deltaX: number, deltaY: number): this {
        throw new Error("Method not implemented.");
    }
    moveAlongAngle(angle: number, distance: number): Shape {
        throw new Error("Method not implemented.");
    }
    moveAlongAngleSelf(angle: number, distance: number): this {
        throw new Error("Method not implemented.");
    }

    getLength(): number {
        throw new Error("Method not implemented.");
    }
    getArea(): number {
        throw new Error("Method not implemented.");
    }
    getWindingDirection(): Direction {
        throw new Error("Method not implemented.");
    }
    isPointOn(point: Point | [number, number]): boolean {
        throw new Error("Method not implemented.");
    }
    isPointOutside(point: Point | [number, number]): boolean {
        throw new Error("Method not implemented.");
    }
    isPointInside(point: Point | [number, number]): boolean {
        throw new Error("Method not implemented.");
    }

    apply(transformation: Transformation): Shape {
        throw new Error("Method not implemented.");
    }
    getGraphics() {
        const g = new Graphics();
        if (!this.isValid()) return g;
        throw new Error("Method not implemented.");
    }
    clone() {
        return new Square(this.owner, this.originX, this.originY, this.sideLength, this.rotation);
    }
    copyFrom(shape: Square | null) {
        if (shape === null) shape = new Square(this.owner);
        this._setOriginX(shape._originX);
        this._setOriginY(shape._originY);
        this._setSideLength(shape._sideLength);
        this._setRotation(shape._rotation);
        return this;
    }
    toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\toriginX: ${this.originX}`,
            `\toriginY: ${this.originY}`,
            `\tsideLength: ${this.sideLength}`,
            `\trotation: ${this.rotation}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n");
    }
    toArray() {
        return [this.originX, this.originY, this.sideLength, this.rotation];
    }
    toObject() {
        return {
            originX: this.originX,
            originY: this.originY,
            sideLength: this.sideLength,
            rotation: this.rotation
        };
    }
}

export default Square;
