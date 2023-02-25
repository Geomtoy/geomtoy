import { Assert, Coordinates, Maths, Type, Utility, Vector2 } from "@geomtoy/util";
import { validGeometry, validGeometryArguments } from "../../misc/decor-geometry";

import Geometry from "../../base/Geometry";
import EventSourceObject from "../../event/EventSourceObject";
import GeometryGraphic from "../../graphics/GeometryGraphic";
import Circle from "./Circle";
import LineSegment from "./LineSegment";
import Point from "./Point";

import { optioner } from "../../geomtoy";
import Graphics from "../../graphics";
import { statedWithBoolean } from "../../misc/decor-cache";
import { getCoordinates } from "../../misc/point-like";
import Transformation from "../../transformation";
import type { ClosedGeometry, ViewportDescriptor, WindingDirection } from "../../types";
import Path from "../general/Path";

const REGULAR_POLYGON_MIN_SIDE_COUNT = 3;

@validGeometry
export default class RegularPolygon extends Geometry implements ClosedGeometry {
    private _centerX = NaN;
    private _centerY = NaN;
    private _radius = NaN;
    private _sideCount = NaN;
    private _rotation = 0;
    private _windingDirection = 1 as WindingDirection;

    constructor(centerX: number, centerY: number, radius: number, sideCount: number, rotation?: number);
    constructor(centerCoordinates: [number, number], radius: number, sideCount: number, rotation?: number);
    constructor(centerPoint: Point, radius: number, sideCount: number, rotation?: number);
    constructor();
    constructor(a0?: any, a1?: any, a2?: any, a3?: any, a4?: any) {
        super();
        if (Type.isNumber(a0)) {
            Object.assign(this, { centerX: a0, centerY: a1, radius: a2, sideCount: a3, rotation: a4 ?? 0 });
        }
        if (Type.isArray(a0)) {
            Object.assign(this, { centerCoordinates: a0, radius: a1, sideCount: a2, rotation: a3 ?? 0 });
        }
        if (a0 instanceof Point) {
            Object.assign(this, { centerPoint: a0, radius: a1, sideCount: a2, rotation: a3 ?? 0 });
        }
    }

    static override events = {
        centerXChanged: "centerX" as const,
        centerYChanged: "centerY" as const,
        radiusChanged: "radius" as const,
        sideCountChanged: "sideCount" as const,
        rotationChanged: "rotation" as const
    };

    private _setCenterX(value: number) {
        if (!Utility.isEqualTo(this._centerX, value)) this.trigger_(new EventSourceObject(this, RegularPolygon.events.centerXChanged));
        this._centerX = value;
    }
    private _setCenterY(value: number) {
        if (!Utility.isEqualTo(this._centerY, value)) this.trigger_(new EventSourceObject(this, RegularPolygon.events.centerYChanged));
        this._centerY = value;
    }
    private _setRadius(value: number) {
        if (!Utility.isEqualTo(this._radius, value)) this.trigger_(new EventSourceObject(this, RegularPolygon.events.radiusChanged));
        this._radius = value;
    }
    private _setSideCount(value: number) {
        if (!Utility.isEqualTo(this._sideCount, value)) this.trigger_(new EventSourceObject(this, RegularPolygon.events.sideCountChanged));
        this._sideCount = value;
    }
    private _setRotation(value: number) {
        if (!Utility.isEqualTo(this._rotation, value)) this.trigger_(new EventSourceObject(this, RegularPolygon.events.rotationChanged));
        this._rotation = value;
    }

    get centerX() {
        return this._centerX;
    }
    set centerX(value) {
        Assert.isRealNumber(value, "centerX");
        this._setCenterX(value);
    }
    get centerY() {
        return this._centerY;
    }
    set centerY(value) {
        Assert.isRealNumber(value, "centerY");
        this._setCenterY(value);
    }
    get centerCoordinates() {
        return [this._centerX, this._centerY] as [number, number];
    }
    set centerCoordinates(value) {
        Assert.isCoordinates(value, "centerCoordinates");
        this._setCenterX(Coordinates.x(value));
        this._setCenterY(Coordinates.y(value));
    }
    get centerPoint() {
        return new Point(this._centerX, this._centerY);
    }
    set centerPoint(value) {
        this._setCenterX(value.x);
        this._setCenterY(value.y);
    }
    get radius() {
        return this._radius;
    }
    set radius(value) {
        Assert.isNonNegativeNumber(value, "radius");
        this._setRadius(value);
    }
    get sideCount() {
        return this._sideCount;
    }
    set sideCount(value) {
        Assert.isInteger(value, "sideCount");
        Assert.comparison(value, "sideCount", "ge", REGULAR_POLYGON_MIN_SIDE_COUNT);
        this._setSideCount(value);
    }
    get rotation() {
        return this._rotation;
    }
    set rotation(value) {
        Assert.isRealNumber(value, "rotation");
        this._setRotation(value);
    }

    get apothem() {
        return this.radius * Maths.cos(Maths.PI / this.sideCount);
    }
    get sideLength() {
        return 2 * this.radius * Maths.sin(Maths.PI / this.sideCount);
    }
    get centralAngle() {
        return (2 * Maths.PI) / this.sideCount;
    }
    get interiorAngle() {
        return Maths.PI - (2 * Maths.PI) / this.sideCount;
    }
    get sumOfInteriorAngle() {
        return Maths.PI * (this.sideCount - 2);
    }
    get exteriorAngle() {
        return (2 * Maths.PI) / this.sideCount;
    }
    get diagonalCount() {
        return (this.sideCount * (this.sideCount - 3)) / 2;
    }

    initialized() {
        // prettier-ignore
        return (
            !Number.isNaN(this._centerX) &&
            !Number.isNaN(this._centerY) &&
            !Number.isNaN(this._radius) &&
            !Number.isNaN(this._sideCount)
        );
    }

    degenerate(check: false): Point | this | null;
    degenerate(check: true): boolean;
    @statedWithBoolean(undefined)
    degenerate(check: boolean) {
        if (!this.initialized()) return check ? true : null;
        const r0 = Maths.equalTo(this._radius, 0, optioner.options.epsilon);
        if (check) return r0;

        if (r0) return new Point(this._centerX, this._centerY);
        return this;
    }

    getWindingDirection() {
        return this._windingDirection;
    }
    setWindingDirection(direction: WindingDirection) {
        this._windingDirection = direction;
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
    move(deltaX: number, deltaY: number) {
        this.centerCoordinates = Vector2.add(this.centerCoordinates, [deltaX, deltaY]);
        return this;
    }
    @validGeometryArguments
    static fromApothemEtc(apothem: number, centerPoint: [number, number] | Point, sideCount: number, rotation: number = 0) {
        Assert.isNonNegativeNumber(apothem, "apothem");
        Assert.isInteger(sideCount, "sideCount");
        Assert.comparison(sideCount, "sideCount", "ge", 3);
        Assert.isRealNumber(rotation, "rotation");
        const cc = getCoordinates(centerPoint, "centerPoint");
        const r = apothem / Maths.cos(Maths.PI / sideCount);
        return new RegularPolygon(cc, r, sideCount, rotation);
    }
    @validGeometryArguments
    static fromSideLengthEtc(sideLength: number, centerPoint: [number, number] | Point, sideCount: number, rotation: number = 0) {
        Assert.isNonNegativeNumber(sideLength, "sideLength");
        Assert.isInteger(sideCount, "sideCount");
        Assert.comparison(sideCount, "sideCount", "ge", 3);
        Assert.isRealNumber(rotation, "rotation");
        const cc = getCoordinates(centerPoint, "centerPoint");
        const r = sideLength / Maths.sin(Maths.PI / sideCount) / 2;
        return new RegularPolygon(cc, r, sideCount, rotation);
    }

    getVertices() {
        return Utility.range(0, this.sideCount).map(index => {
            return new Point(Vector2.add(this.centerCoordinates, Vector2.from2(((2 * Maths.PI) / this.sideCount) * index + this.rotation, this.radius)));
        });
    }
    getSideLineSegments() {
        const ps = this.getVertices();
        return Utility.range(0, this.sideCount).forEach(index => {
            new LineSegment(Utility.nth(ps, index - this.sideCount)!, Utility.nth(ps, index - this.sideCount + 1)!);
        });
    }

    getCircumscribedCircle() {
        return new Circle(this.centerCoordinates, this.radius);
    }
    getInscribedCircle() {
        return new Circle(this.centerCoordinates, this.apothem);
    }

    getPerimeter(): number {
        return this.sideCount * this.sideLength;
    }
    getArea(): number {
        const p = this.getPerimeter();
        return (p * this.apothem) / 2;
    }

    toPath() {
        const [head, ...tail] = this.getVertices();
        const path = new Path();
        path.appendCommand(Path.moveTo(head.coordinates));
        tail.forEach(p => {
            path.appendCommand(Path.lineTo(p.coordinates));
        });
        path.closed = true;
        return path;
    }
    apply(transformation: Transformation) {
        const { centerCoordinates: cc, radius: r } = this;

        const {
            skew: [kx, ky],
            scale: [sx, sy],
            rotate
        } = transformation.decomposeQr();
        const epsilon = optioner.options.epsilon;
        if (Maths.equalTo(kx, 0, epsilon) && Maths.equalTo(ky, 0, epsilon) && Maths.equalTo(sx, sy, epsilon)) {
            const ncc = transformation.transformCoordinates(cc);
            const nr = r * sx;
            const nrt = rotate;
            return new RegularPolygon(ncc, nr, this.sideCount, nrt);
        }
        return this.toPath().apply(transformation);
    }

    getGraphics(viewport: ViewportDescriptor) {
        const dg = this.degenerate(false);
        if (dg === null) return new Graphics();
        if (dg !== this) return (dg as Exclude<typeof dg, this>).getGraphics(viewport);

        const g = new Graphics();
        const gg = new GeometryGraphic();
        g.append(gg);
        const [head, ...tail] = this.getVertices();
        gg.moveTo(...head.coordinates);
        tail.forEach(p => {
            gg.lineTo(...p.coordinates);
        });
        gg.close();
        return g;
    }
    clone() {
        return new RegularPolygon(this.centerX, this.centerY, this.radius, this.sideCount, this.rotation);
    }
    copyFrom(shape: RegularPolygon | null) {
        if (shape === null) shape = new RegularPolygon();
        this._setCenterX(shape._centerX);
        this._setCenterY(shape._centerY);
        this._setRadius(shape._radius);
        this._setSideCount(shape._sideCount);
        this._setRotation(shape._rotation);
        return this;
    }
    override toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\tcenterX: ${this.centerX}`,
            `\tcenterY: ${this.centerY}`,
            `\tradius: ${this.radius}`,
            `\tsideCount: ${this.sideCount}`,
            `\trotation: ${this.rotation}`,
            `}`
        ].join("\n");
    }
}
