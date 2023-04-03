import { Assert, Box, Coordinates, Maths, Matrix2, Type, Utility, Vector2 } from "@geomtoy/util";
import Geometry from "../../base/Geometry";
import EventSourceObject from "../../event/EventSourceObject";
import { eps, optioner } from "../../geomtoy";
import Graphics from "../../graphics";
import GeometryGraphic from "../../graphics/GeometryGraphic";
import ArrowGraphics from "../../helper/ArrowGraphics";
import { stated, statedWithBoolean } from "../../misc/decor-cache";
import { validGeometry } from "../../misc/decor-geometry";
import { getCoordinates } from "../../misc/point-like";
import type Transformation from "../../transformation";
import type { InfiniteOpenGeometry, ViewportDescriptor } from "../../types";
import Line from "./Line";
import Point from "./Point";

@validGeometry
export default class Ray extends Geometry implements InfiniteOpenGeometry {
    private _x = NaN;
    private _y = NaN;
    private _angle = NaN;

    constructor(x: number, y: number, angle: number);
    constructor(coordinates: [number, number], angle: number);
    constructor(point: Point, angle: number);
    constructor();
    constructor(a0?: any, a1?: any, a2?: any) {
        super();
        if (Type.isNumber(a0)) {
            Object.assign(this, { x: a0, y: a1, angle: a2 });
        }
        if (Type.isArray(a0)) {
            Object.assign(this, { coordinates: a0, angle: a1 });
        }
        if (a0 instanceof Point) {
            Object.assign(this, { point: a0, angle: a1 });
        }
    }

    static override events = {
        xChanged: "x" as const,
        yChanged: "y" as const,
        angleChanged: "angle" as const
    };

    private _setX(value: number) {
        if (!Utility.is(this._x, value)) this.trigger_(new EventSourceObject(this, Ray.events.xChanged));
        this._x = value;
    }
    private _setY(value: number) {
        if (!Utility.is(this._y, value)) this.trigger_(new EventSourceObject(this, Ray.events.yChanged));
        this._y = value;
    }
    private _setAngle(value: number) {
        if (!Utility.is(this._angle, value)) this.trigger_(new EventSourceObject(this, Ray.events.angleChanged));
        this._angle = value;
    }

    get x() {
        return this._x;
    }
    set x(value) {
        Assert.isRealNumber(value, "x");
        this._setX(value);
    }
    get y() {
        return this._y;
    }
    set y(value) {
        Assert.isRealNumber(value, "y");
        this._setY(value);
    }
    get coordinates() {
        return [this._x, this._y] as [number, number];
    }
    set coordinates(value) {
        Assert.isCoordinates(value, "coordinates");
        this._setX(Coordinates.x(value));
        this._setY(Coordinates.y(value));
    }
    get point() {
        return new Point(this._x, this._y);
    }
    set point(value) {
        this._setX(value.x);
        this._setY(value.y);
    }
    get angle() {
        return this._angle;
    }
    set angle(value) {
        Assert.isRealNumber(value, "angle");
        this._setAngle(value);
    }

    @stated
    initialized() {
        // prettier-ignore
        return (
            !Number.isNaN(this._x) &&
            !Number.isNaN(this._y) &&
            !Number.isNaN(this._angle)
        );
    }
    degenerate(check: false): this | null;
    degenerate(check: true): boolean;
    @statedWithBoolean(undefined)
    degenerate(check: boolean) {
        if (!this.initialized()) return check ? true : null;
        return check ? false : this;
    }

    isPointOn(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        const vr = Vector2.from2(this.angle, 1);
        const v = Vector2.from(this.coordinates, c);
        const dp = Vector2.dot(vr, v);
        const cp = Vector2.cross(vr, v);
        return !Maths.lessThan(dp, 0, eps.vectorEpsilon) && Maths.equalTo(cp, 0, eps.vectorEpsilon);
    }

    move(deltaX: number, deltaY: number) {
        this.coordinates = Vector2.add(this.coordinates, [deltaX, deltaY]);
        return this;
    }

    static fromTwoPoints(point1: [number, number] | Point, point2: [number, number] | Point) {
        const c1 = getCoordinates(point1, "point1");
        const c2 = getCoordinates(point2, "point2");
        if (Coordinates.equalTo(c1, c2, eps.epsilon)) {
            console.warn("[G]The points `point1` and `point2` are the same, they can NOT determine a `Ray`.");
            return null;
        }
        const angle = Vector2.angle(Vector2.from(c1, c2));
        return new Ray(c1, angle);
    }
    /**
     * Get the `n` section(equal) rays of the angle which is formed by rays `ray1` and `ray2`.
     * @description
     * If `n` is not integer, return `null`.
     * If `ray1` and `ray2` have different endpoint(`coordinates`), return `null`.
     * @param n
     * @param ray1
     * @param ray2
     */
    static getAngleNSectionRaysFromTwoRays(n: number, ray1: Ray, ray2: Ray): Ray[] | null {
        Assert.isInteger(n, "n");
        Assert.comparison(n, "n", "gt", 1);

        const { coordinates: c1 } = ray1;
        const { coordinates: c2 } = ray2;
        if (!Coordinates.equalTo(c1, c2, eps.epsilon)) {
            console.warn("[G]The endpoints of the two rays do not coincide. `null` will be returned.");
            return null;
        }
        const a1 = ray1.angle;
        const a2 = ray2.angle;
        const c = ray1.coordinates;
        const d = (a2 - a1) / n;
        const ret: Ray[] = [];
        Utility.range(1, n).forEach(index => {
            ret.push(new Ray(c, a1 + d * index));
        });
        return ret;
    }

    /**
     * Returns the closest point(the foot of the perpendicular) on line `this` from point `point`.
     * @param point
     */
    getClosestPointFromPoint(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        const co = this.coordinates;
        const v = Vector2.from(co, c);
        const vo = Vector2.from2(this._angle, 1);
        let dp = Vector2.dot(v, vo);
        dp = Maths.max(dp, 0);

        const vv = Vector2.from2(this._angle, dp);
        const p = Vector2.add(co, vv);
        const sd = Vector2.squaredMagnitude(Vector2.from(c, p));
        return [new Point(p), sd] as [point: Point, distanceSquare: number];
    }

    apply(transformation: Transformation) {
        const nc = transformation.transformCoordinates(this.coordinates);
        const [a, b, c, d] = transformation.matrix;
        const [nax, nay] = Matrix2.dotVector2([a, c, b, d], [Maths.cos(this.angle), Maths.sin(this.angle)]);
        return new Ray(nc, Maths.atan2(nay, nax));
    }
    getGraphics(viewport: ViewportDescriptor) {
        if (!this.initialized()) return new Graphics();

        const g = new Graphics();
        const gg = new GeometryGraphic();
        g.append(gg);
        const gbb = viewport.globalViewBox;
        const [dx, dy] = Vector2.from2(this.angle, 1);
        const [x, y] = this.coordinates;
        const [minX, minY, maxX, maxY] = [Box.minX(gbb), Box.minY(gbb), Box.maxX(gbb), Box.maxY(gbb)];

        if (dx === 0 && (minX === x || maxX === x)) return g;
        if (dy === 0 && (minY === y || maxY === y)) return g;

        const tMinX = (minX - x) / dx;
        const tMaxX = (maxX - x) / dx;
        const tMinY = (minY - y) / dy;
        const tMaxY = (maxY - y) / dy;

        let tMin = Maths.max(Maths.min(tMinX, tMaxX), Maths.min(tMinY, tMaxY));
        const tMax = Maths.min(Maths.max(tMinX, tMaxX), Maths.max(tMinY, tMaxY));

        tMin = Maths.max(tMin, 0);
        if (!Maths.greaterThan(tMax, tMin, eps.epsilon)) {
            return g;
        }
        const c1 = [x + tMin * dx, y + tMin * dy] as [number, number];
        const c2 = [x + tMax * dx, y + tMax * dy] as [number, number];
        gg.moveTo(...c1);
        gg.lineTo(...c2);

        if (optioner.options.graphics.rayArrow) {
            const arrowGraphics = new ArrowGraphics(c2, this.angle).getGraphics(viewport);
            g.concat(arrowGraphics);
        }

        return g;
    }

    toLine() {
        const { coordinates: c, angle: a } = this;
        return Line.fromPointAndAngle(c, a);
    }
    getBoundingBox() {
        return this.point.getBoundingBox();
    }
    clone() {
        return new Ray(this.x, this.y, this.angle);
    }
    copyFrom(shape: Ray | null) {
        if (shape === null) shape = new Ray();
        this._setX(shape._x);
        this._setY(shape._y);
        this._setAngle(shape._angle);
        return this;
    }
    override toJSON() {
        return {
            name: this.name,
            id: this.id,
            x: this._x,
            y: this._y,
            angle: this._angle
        };
    }
}
