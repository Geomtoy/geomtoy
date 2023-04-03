import { Assert, Box, Coordinates, Maths, Type, Utility, Vector2 } from "@geomtoy/util";
import Geometry from "../../base/Geometry";
import EventSourceObject from "../../event/EventSourceObject";
import { eps, optioner } from "../../geomtoy";
import Graphics from "../../graphics";
import { Cartesian } from "../../helper/CoordinateSystem";
import PointGraphics from "../../helper/PointGraphics";
import { stated, statedWithBoolean } from "../../misc/decor-cache";
import { validGeometry } from "../../misc/decor-geometry";
import { getCoordinates } from "../../misc/point-like";
import Transformation from "../../transformation";
import type { PointAppearance, ViewportDescriptor } from "../../types";
import type Line from "./Line";
import type LineSegment from "./LineSegment";

@validGeometry
export default class Point extends Geometry {
    private _x = NaN;
    private _y = NaN;
    appearance: PointAppearance = optioner.options.graphics.point.appearance;

    constructor(x: number, y: number, appearance?: PointAppearance);
    constructor(coordinates: [number, number], appearance?: PointAppearance);
    constructor(coordinates: [number, number], appearance?: PointAppearance);
    constructor(appearance?: PointAppearance);
    constructor(a0?: any, a1?: any, a2?: any) {
        super();
        if (Type.isNumber(a0)) {
            Object.assign(this, { x: a0, y: a1, appearance: a2 ?? this.appearance });
        }
        if (Type.isArray(a0)) {
            Object.assign(this, { coordinates: a0, appearance: a1 ?? this.appearance });
        }
        if (Type.isString(a0)) {
            Object.assign(this, { appearance: a0 ?? this.appearance });
        }
    }

    static override events = {
        xChanged: "x" as const,
        yChanged: "y" as const
    };

    private _setX(value: number) {
        if (!Utility.is(this._x, value)) this.trigger_(new EventSourceObject(this, Point.events.xChanged));
        this._x = value;
    }
    private _setY(value: number) {
        if (!Utility.is(this._y, value)) this.trigger_(new EventSourceObject(this, Point.events.yChanged));
        this._y = value;
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

    @stated
    initialized() {
        // prettier-ignore
        return (
            !Number.isNaN(this._x) &&
            !Number.isNaN(this._y)
        );
    }
    degenerate(check: false): this | null;
    degenerate(check: true): boolean;
    @statedWithBoolean(undefined)
    degenerate(check: boolean) {
        if (!this.initialized()) return check ? true : null;
        return check ? false : this;
    }

    move(deltaX: number, deltaY: number) {
        this.coordinates = Vector2.add(this.coordinates, [deltaX, deltaY]);
        return this;
    }
    /**
     * Returns a point of origin([0, 0]) of the coordinate system.
     */
    static origin() {
        return new Point(0, 0);
    }
    /**
     * Returns a random point in the box `box`.
     * @param box
     */
    static random(box: [number, number, number, number]) {
        const x = Box.x(box) + Maths.random() * Box.width(box);
        const y = Box.y(box) + Maths.random() * Box.height(box);
        return new Point(x, y);
    }
    /**
     * Whether points `point1`, `point2`, `point3` are collinear.
     * @note
     * If any two of these three points are the same, they will also be considered collinear.
     * @param point1
     * @param point2
     * @param point3
     */
    static isThreePointsCollinear(point1: [number, number] | Point, point2: [number, number] | Point, point3: [number, number] | Point) {
        const c1 = getCoordinates(point1, "point1");
        const c2 = getCoordinates(point2, "point2");
        const c3 = getCoordinates(point3, "point3");
        const v1 = Vector2.from(c1, c2);
        const v2 = Vector2.from(c1, c3);
        return Maths.equalTo(Vector2.cross(v1, v2), 0, eps.vectorEpsilon);
    }
    /**
     * Whether points `point1`, `point2`, `point3`, `point4` are concyclic.
     * @note
     * If any two of these four points are the same, they will also be considered concyclic.
     * @param point1
     * @param point2
     * @param point3
     * @param point4
     */
    static isFourPointsConcyclic(point1: [number, number] | Point, point2: [number, number] | Point, point3: [number, number] | Point, point4: [number, number] | Point) {
        const c1 = getCoordinates(point1, "point1");
        const c2 = getCoordinates(point2, "point2");
        const c3 = getCoordinates(point3, "point3");
        const c4 = getCoordinates(point4, "point4");

        const cart = new Cartesian(Coordinates.x(c4), Coordinates.y(c4));
        const tri = cart.toTrilinear(c1, c2, c3);
        if (!(Type.isRealNumber(tri.lambda1) && Type.isRealNumber(tri.lambda2) && Type.isRealNumber(tri.lambda3))) {
            return true; // c1,c2,c3 have some coincidence
        }
        if (tri.lambda1 >= 0 || tri.lambda2 >= 0 || tri.lambda3 >= 0) {
            return false; // c4 is inside or on the triangle(except the vertex and even triangle is not formed)
        }
        let loop: [[number, number], [number, number], [number, number], [number, number]];
        if (tri.lambda1 < 0) /* outside c2-c3 */ loop = [c1, c2, c4, c3];
        else if (tri.lambda2 < 0) /* outside c3-c1 */ loop = [c1, c2, c3, c4];
        else if (tri.lambda3 < 0) /* outside c1-c2 */ loop = [c1, c4, c2, c3];
        else throw new Error("[G]Impossible.");

        // use Ptolemy's theorem
        // @see  https://en.wikipedia.org/wiki/Ptolemy's_theorem
        const ac = Vector2.magnitude(Vector2.from(loop[0], loop[2]));
        const bd = Vector2.magnitude(Vector2.from(loop[1], loop[3]));
        const ab = Vector2.magnitude(Vector2.from(loop[0], loop[1]));
        const cd = Vector2.magnitude(Vector2.from(loop[2], loop[3]));
        const bc = Vector2.magnitude(Vector2.from(loop[1], loop[2]));
        const da = Vector2.magnitude(Vector2.from(loop[3], loop[0]));

        if (Maths.equalTo(ac * bd, ab * cd + bc * da, eps.epsilon)) {
            return true;
        }
        return false;
    }
    /**
     * Whether point `this` equal to point `point`.
     * @param point
     */
    equalTo(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        return Coordinates.equalTo(this.coordinates, c, eps.epsilon);
    }
    /**
     * Get the distance between point `this` and point `point`.
     */
    getDistanceBetweenPoint(point: Point): number {
        return Vector2.magnitude(Vector2.from(this.coordinates, point.coordinates));
    }
    /**
     * Get the distance square between point `this` and point `point`.
     */
    getSquaredDistanceBetweenPoint(point: Point): number {
        return Vector2.squaredMagnitude(Vector2.from(this.coordinates, point.coordinates));
    }
    /**
     * Get the distance between point `this` and line `line`.
     * @param line
     */
    getDistanceBetweenLine(line: Line): number {
        return Maths.abs(this.getSignedDistanceBetweenLine(line));
    }
    /**
     * Get the signed distance between point `this` and line `line`.
     * @param line
     */
    getSignedDistanceBetweenLine(line: Line): number {
        const [a, b, c] = line.getImplicitFunctionCoefs();
        const { x, y } = this;
        return (a * x + b * y + c) / Maths.hypot(a, b);
    }
    /**
     * Get the distance square between point `this` and line `line`.
     * @param line
     */
    getSquaredDistanceBetweenLine(line: Line): number {
        const [a, b, c] = line.getImplicitFunctionCoefs();
        const { x, y } = this;
        return (a * x + b * y + c) ** 2 / (a ** 2 + b ** 2);
    }
    /**
     * Get the distance between point `this` and line segment `lineSegment`.
     * @param lineSegment
     */
    getDistanceBetweenLineSegment(lineSegment: LineSegment): number {
        return Maths.abs(this.getSignedDistanceBetweenLineSegment(lineSegment));
    }
    /**
     * Get the signed distance between point `this` and line segment `lineSegment`.
     * @param lineSegment
     */
    getSignedDistanceBetweenLineSegment(lineSegment: LineSegment): number {
        const c = this.coordinates;
        const { point1Coordinates: c1, point2Coordinates: c2 } = lineSegment;
        const v12 = Vector2.from(c1, c2);
        const v10 = Vector2.from(c1, c);
        return Vector2.cross(v12, v10) / Vector2.magnitude(Vector2.from(c1, c2));
    }
    /**
     * Get the distance square between point `this` and line segment `lineSegment`
     * @param lineSegment
     */
    getSquaredDistanceBetweenLineSegment(lineSegment: LineSegment): number {
        const c = this.coordinates;
        const { point1Coordinates: c1, point2Coordinates: c2 } = lineSegment;
        const v12 = Vector2.from(c1, c2);
        const v10 = Vector2.from(c1, c);
        return Vector2.cross(v12, v10) ** 2 / Vector2.squaredMagnitude(Vector2.from(c1, c2));
    }
    getBoundingBox() {
        return [...this.coordinates, 0, 0] as [number, number, number, number];
    }
    getGraphics(viewport: ViewportDescriptor) {
        if (!this.initialized()) return new Graphics();

        const g = new Graphics();
        g.concat(new PointGraphics(this.coordinates, this.appearance).getGraphics(viewport));
        return g;
    }
    apply(transformation: Transformation) {
        const nc = transformation.transformCoordinates(this.coordinates);
        return new Point(nc, this.appearance);
    }
    clone() {
        return new Point(this._x, this._y);
    }
    copyFrom(shape: Point | null) {
        if (shape === null) shape = new Point();
        this._setX(shape._x);
        this._setY(shape._y);
        return this;
    }
    override toJSON() {
        return {
            name: this.name,
            id: this.id,
            x: this._x,
            y: this._y,
            appearance: this.appearance
        };
    }
}
