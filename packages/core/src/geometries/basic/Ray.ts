import { Angle, Assert, Type, Utility, Coordinates, Vector2, Maths, Matrix2, Box } from "@geomtoy/util";
import { validGeometry } from "../../misc/decor-valid-geometry";
import Geometry from "../../base/Geometry";
import Point from "./Point";
import Line from "./Line";
import GeometryGraphics from "../../graphics/GeometryGraphics";
import EventObject from "../../event/EventObject";
import type Transformation from "../../transformation";
import type { InfiniteOpenGeometry, ViewportDescriptor } from "../../types";
import { optioner } from "../../geomtoy";
import { getCoordinates } from "../../misc/point-like";
import ArrowGraphics from "../../helper/ArrowGraphics";

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

    get events() {
        return {
            xChanged: "x" as const,
            yChanged: "y" as const,
            angleChanged: "angle" as const
        };
    }

    private _setX(value: number) {
        if (!Utility.isEqualTo(this._x, value)) this.trigger_(EventObject.simple(this, this.events.xChanged));
        this._x = value;
    }
    private _setY(value: number) {
        if (!Utility.isEqualTo(this._y, value)) this.trigger_(EventObject.simple(this, this.events.yChanged));
        this._y = value;
    }
    private _setAngle(value: number) {
        if (!Utility.isEqualTo(this._angle, value)) this.trigger_(EventObject.simple(this, this.events.angleChanged));
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

    protected initialized_() {
        // prettier-ignore
        return (
            !Number.isNaN(this._x) &&
            !Number.isNaN(this._y) &&
            !Number.isNaN(this._angle)
        );
    }
    isPointOn(point: [number, number] | Point) {
        const epsilon = optioner.options.epsilon;
        const c = getCoordinates(point, "point");
        const vr = Vector2.from2(this.angle, 1);
        const v = Vector2.from(this.coordinates, c);
        const dp = Vector2.dot(vr, v);
        const cp = Vector2.cross(vr, v);
        return !Maths.lessThan(dp, 0, epsilon) && Maths.equalTo(cp, 0, epsilon);
    }

    move(deltaX: number, deltaY: number) {
        this.coordinates = Vector2.add(this.coordinates, [deltaX, deltaY]);
        return this;
    }
    moveAlongAngle(angle: number, distance: number) {
        this.coordinates = Vector2.add(this.coordinates, Vector2.from2(angle, distance));
        return this;
    }

    static fromTwoPoints(point1: [number, number] | Point, point2: [number, number] | Point) {
        const c1 = getCoordinates(point1, "point1");
        const c2 = getCoordinates(point2, "point2");
        const epsilon = optioner.options.epsilon;
        if (Coordinates.isEqualTo(c1, c2, epsilon)) {
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
     * If `ray1` and `ray2` have different endpoint, return `null`.
     * @param n
     * @param ray1
     * @param ray2
     */
    static getAngleNSectionRaysFromTwoRays(n: number, ray1: Ray, ray2: Ray): Ray[] | null {
        Assert.condition(Type.isInteger(n) && n > 2, `[G]Got invalid \`n\`:\`${n}\`, which should be an integer and greater than 2.`);
        const { coordinates: c1 } = ray1;
        const { coordinates: c2 } = ray2;
        const epsilon = optioner.options.epsilon;

        if (!Coordinates.isEqualTo(c1, c2, epsilon)) {
            console.warn("[G]The endpoints of the two rays do not coincide. `null` will be returned.");
            return null;
        }
        let a1 = ray1.angle,
            a2 = ray2.angle,
            c = ray1.coordinates,
            d = (a2 - a1) / n,
            ret: Ray[] = [];
        Utility.range(1, n).forEach(index => {
            ret.push(new Ray(c, a1 + d * index));
        });
        return ret;
    }

    getAngleToRay(ray: Ray) {
        return Angle.simplify2(this.angle - ray.angle);
    }

    apply(transformation: Transformation) {
        const nc = transformation.transformCoordinates(this.coordinates);
        const [a, b, c, d] = transformation.matrix;
        const [nax, nay] = Matrix2.dotVector2([a, c, b, d], [Maths.cos(this.angle), Maths.sin(this.angle)]);
        return new Ray(nc, Maths.atan2(nay, nax));
    }
    getGraphics(viewport: ViewportDescriptor) {
        const g = new GeometryGraphics();
        if (!this.initialized_()) return g;

        const gbb = viewport.globalViewBox;
        const epsilon = optioner.options.epsilon;
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

        const cs: [number, number][] = [];

        tMin = Maths.max(tMin, 0);
        if (!Maths.greaterThan(tMax, tMin, epsilon)) {
            return g;
        }
        const c1 = [x + tMin * dx, y + tMin * dy] as [number, number];
        const c2 = [x + tMax * dx, y + tMax * dy] as [number, number];
        g.moveTo(...c1);
        g.lineTo(...c2);

        if (optioner.options.graphics.rayArrow) {
            const arrowGraphics = new ArrowGraphics(c2, this.angle).getGraphics(viewport);
            g.append(arrowGraphics);
        }

        return g;
    }

    toLine() {
        const { coordinates: c, angle: a } = this;
        return Line.fromPointAndAngle(c, a);
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
    toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\tx: ${this.x}`,
            `\ty: ${this.y}`,
            `\tangle: ${this.angle}`,
            `}`
        ].join("\n")
    }
    toArray() {
        return [this.x, this.y, this.angle];
    }
    toObject() {
        return { x: this.x, y: this.y, angle: this.angle };
    }
}
