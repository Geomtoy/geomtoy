import { Assert, Coordinates, Float, Maths, Type, Utility, Vector2 } from "@geomtoy/util";
import Geometry from "../../base/Geometry";
import EventSourceObject from "../../event/EventSourceObject";
import { eps } from "../../geomtoy";
import Graphics from "../../graphics";
import GeometryGraphic from "../../graphics/GeometryGraphic";
import { validGeometry, validGeometryArguments } from "../../misc/decor-geometry";
import { stated, statedWithBoolean } from "../../misc/decor-stated";
import { getCoordinates } from "../../misc/point-like";
import { simplePointPosition } from "../../misc/simple-point-position";
import Transformation from "../../transformation";
import type { ClosedGeometry, PathCommand, ViewportDescriptor, WindingDirection } from "../../types";
import Path from "../general/Path";
import Polygon from "../general/Polygon";
import Circle from "./Circle";
import LineSegment from "./LineSegment";
import Point from "./Point";

const REGULAR_POLYGON_MIN_SIDE_COUNT = 3;

@validGeometry
export default class RegularPolygon extends Geometry implements ClosedGeometry {
    private _centerX = NaN;
    private _centerY = NaN;
    private _radius = NaN;
    private _sideCount = NaN;
    private _rotation = 0;

    constructor(centerX: number, centerY: number, radius: number, sideCount: number, rotation?: number);
    constructor(centerCoordinates: [number, number], radius: number, sideCount: number, rotation?: number);
    constructor(center: Point, radius: number, sideCount: number, rotation?: number);
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
            Object.assign(this, { center: a0, radius: a1, sideCount: a2, rotation: a3 ?? 0 });
        }
        this.initState_();
    }

    static override events = {
        centerXChanged: "centerX" as const,
        centerYChanged: "centerY" as const,
        radiusChanged: "radius" as const,
        sideCountChanged: "sideCount" as const,
        rotationChanged: "rotation" as const
    };

    private _setCenterX(value: number) {
        if (Utility.is(this._centerX, value)) return;
        this._centerX = value;
        this.trigger_(new EventSourceObject(this, RegularPolygon.events.centerXChanged));
    }
    private _setCenterY(value: number) {
        if (Utility.is(this._centerY, value)) return;
        this._centerY = value;
        this.trigger_(new EventSourceObject(this, RegularPolygon.events.centerYChanged));
    }
    private _setRadius(value: number) {
        if (Utility.is(this._radius, value)) return;
        this._radius = value;
        this.trigger_(new EventSourceObject(this, RegularPolygon.events.radiusChanged));
    }
    private _setSideCount(value: number) {
        if (Utility.is(this._sideCount, value)) return;
        this._sideCount = value;
        this.trigger_(new EventSourceObject(this, RegularPolygon.events.sideCountChanged));
    }
    private _setRotation(value: number) {
        if (Utility.is(this._rotation, value)) return;
        this._rotation = value;
        this.trigger_(new EventSourceObject(this, RegularPolygon.events.rotationChanged));
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
    get center() {
        return new Point(this._centerX, this._centerY);
    }
    set center(value) {
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
        const r0 = Float.equalTo(this._radius, 0, Float.MACHINE_EPSILON);
        if (check) return r0;

        if (r0) return new Point(this._centerX, this._centerY);
        return this;
    }

    getWindingDirection() {
        return 1 as WindingDirection;
    }
    @stated
    getArea(): number {
        const p = this.getLength();
        return (p * this.apothem) / 2;
    }
    @stated
    getLength() {
        return this.sideCount * this.sideLength;
    }
    @validGeometryArguments
    isPointOn(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        const vertices = this.getVertices().map(p => p.coordinates);
        return simplePointPosition(vertices, c, eps.vectorEpsilon) === 0;
    }
    @validGeometryArguments
    isPointOutside(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        const vertices = this.getVertices().map(p => p.coordinates);
        return simplePointPosition(vertices, c, eps.vectorEpsilon) === 1;
    }
    @validGeometryArguments
    isPointInside(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        const vertices = this.getVertices().map(p => p.coordinates);
        return simplePointPosition(vertices, c, eps.vectorEpsilon) === -1;
    }
    move(deltaX: number, deltaY: number) {
        this.centerCoordinates = Vector2.add(this.centerCoordinates, [deltaX, deltaY]);
        return this;
    }
    @validGeometryArguments
    static fromApothemEtc(apothem: number, center: [number, number] | Point, sideCount: number, rotation: number = 0) {
        Assert.isNonNegativeNumber(apothem, "apothem");
        Assert.isInteger(sideCount, "sideCount");
        Assert.comparison(sideCount, "sideCount", "ge", 3);
        Assert.isRealNumber(rotation, "rotation");
        const cc = getCoordinates(center, "center");
        const r = apothem / Maths.cos(Maths.PI / sideCount);
        return new RegularPolygon(cc, r, sideCount, rotation);
    }
    @validGeometryArguments
    static fromSideLengthEtc(sideLength: number, center: [number, number] | Point, sideCount: number, rotation: number = 0) {
        Assert.isNonNegativeNumber(sideLength, "sideLength");
        Assert.isInteger(sideCount, "sideCount");
        Assert.comparison(sideCount, "sideCount", "ge", 3);
        Assert.isRealNumber(rotation, "rotation");
        const cc = getCoordinates(center, "center");
        const r = sideLength / Maths.sin(Maths.PI / sideCount) / 2;
        return new RegularPolygon(cc, r, sideCount, rotation);
    }
    @stated
    getVertices() {
        return Utility.range(0, this.sideCount).map(index => {
            return new Point(Vector2.add(this.centerCoordinates, Vector2.from2(((2 * Maths.PI) / this.sideCount) * index + this.rotation, this.radius)));
        });
    }
    @stated
    getSideLineSegments() {
        const ps = this.getVertices();
        return Utility.range(0, this.sideCount).map(index => {
            return new LineSegment(Utility.nth(ps, index - this.sideCount)!, Utility.nth(ps, index - this.sideCount + 1)!);
        });
    }
    @stated
    getCircumscribedCircle() {
        return new Circle(this.centerCoordinates, this.radius);
    }
    @stated
    getInscribedCircle() {
        return new Circle(this.centerCoordinates, this.apothem);
    }
    @stated
    getBoundingBox() {
        return this.toPolygon().getBoundingBox();
    }

    toPolygon() {
        const vertices = this.getVertices();
        return new Polygon(
            vertices.map(vtx => Polygon.vertex(vtx)),
            true
        );
    }

    toPath() {
        const [head, ...tail] = this.getVertices();
        const commands: PathCommand[] = [];
        commands.push(Path.moveTo(head.coordinates));
        tail.forEach(p => {
            commands.push(Path.lineTo(p.coordinates));
        });
        return new Path(commands, true);
    }
    apply(transformation: Transformation) {
        const { centerCoordinates: cc, radius: r } = this;

        const {
            skew: [kx, ky],
            scale: [sx, sy],
            rotate
        } = transformation.decomposeQr();
        if (Float.equalTo(kx, 0, eps.epsilon) && Float.equalTo(ky, 0, eps.epsilon) && Float.equalTo(sx, sy, eps.epsilon)) {
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
        const ret = new RegularPolygon();
        ret._centerX = this._centerX;
        ret._centerY = this._centerY;
        ret._radius = this._radius;
        ret._sideCount = this._sideCount;
        ret._rotation = this._rotation;
        return ret;
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
    override toJSON() {
        return {
            name: this.name,
            id: this.id,
            centerX: this._centerX,
            centerY: this._centerY,
            radius: this._radius,
            sideCount: this._sideCount,
            rotation: this._rotation
        };
    }
}
