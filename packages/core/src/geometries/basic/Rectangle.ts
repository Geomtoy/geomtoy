import { Angle, Assert, Box, Coordinates, Float, Maths, Size, Type, Utility, Vector2 } from "@geomtoy/util";
import Geometry from "../../base/Geometry";
import SealedGeometryArray from "../../collection/SealedGeometryArray";
import EventSourceObject from "../../event/EventSourceObject";
import { eps } from "../../geomtoy";
import Graphics from "../../graphics";
import GeometryGraphic from "../../graphics/GeometryGraphic";
import { validGeometry, validGeometryArguments } from "../../misc/decor-geometry";
import { stated, statedWithBoolean } from "../../misc/decor-stated";
import { getCoordinates } from "../../misc/point-like";
import Transformation from "../../transformation";
import type { ClosedGeometry, PathCommand, RotationFeaturedGeometry, ViewportDescriptor, WindingDirection } from "../../types";
import Path from "../general/Path";
import Polygon from "../general/Polygon";
import LineSegment from "./LineSegment";
import Point from "./Point";

@validGeometry
export default class Rectangle extends Geometry implements ClosedGeometry, RotationFeaturedGeometry {
    private _x = NaN;
    private _y = NaN;
    private _width = NaN;
    private _height = NaN;
    private _rotation = 0;

    constructor(x: number, y: number, width: number, height: number, rotation?: number);
    constructor(x: number, y: number, size: [number, number], rotation?: number);
    constructor(coordinates: [number, number], width: number, height: number, rotation?: number);
    constructor(coordinates: [number, number], size: [number, number], rotation?: number);
    constructor(point: Point, width: number, height: number, rotation?: number);
    constructor(point: Point, size: [number, number], rotation?: number);
    constructor();
    constructor(a0?: any, a1?: any, a2?: any, a3?: any, a4?: any) {
        super();
        if (Type.isNumber(a0)) {
            if (Type.isNumber(a2)) {
                Object.assign(this, { x: a0, y: a1, width: a2, height: a3, rotation: a4 ?? 0 });
            } else {
                Object.assign(this, { x: a0, y: a1, size: a2, rotation: a3 ?? 0 });
            }
        }
        if (Type.isArray(a0)) {
            if (Type.isNumber(a1)) {
                Object.assign(this, { coordinates: a0, width: a1, height: a2, rotation: a3 ?? 0 });
            } else {
                Object.assign(this, { coordinates: a0, size: a1, rotation: a2 ?? 0 });
            }
        }
        if (a0 instanceof Point) {
            if (Type.isNumber(a1)) {
                Object.assign(this, { point: a0, width: a1, height: a2, rotation: a3 ?? 0 });
            } else {
                Object.assign(this, { point: a0, size: a1, rotation: a2 ?? 0 });
            }
        }
        this.initState_();
    }

    static override events = {
        xChanged: "x" as const,
        yChanged: "y" as const,
        widthChanged: "width" as const,
        heightChanged: "height" as const,
        rotationChanged: "rotation" as const
    };

    private _setX(value: number) {
        if (Utility.is(this._x, value)) return;
        this._x = value;
        this.trigger_(new EventSourceObject(this, Rectangle.events.xChanged));
    }
    private _setY(value: number) {
        if (Utility.is(this._y, value)) return;
        this._y = value;
        this.trigger_(new EventSourceObject(this, Rectangle.events.yChanged));
    }
    private _setWidth(value: number) {
        if (Utility.is(this._width, value)) return;
        this._width = value;
        this.trigger_(new EventSourceObject(this, Rectangle.events.widthChanged));
    }
    private _setHeight(value: number) {
        if (Utility.is(this._height, value)) return;
        this._height = value;
        this.trigger_(new EventSourceObject(this, Rectangle.events.heightChanged));
    }
    private _setRotation(value: number) {
        if (Utility.is(this._rotation, value)) return;
        this._rotation = value;
        this.trigger_(new EventSourceObject(this, Rectangle.events.rotationChanged));
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
    get width() {
        return this._width;
    }
    set width(value) {
        Assert.isNonNegativeNumber(value, "width");
        this._setWidth(value);
    }
    get height() {
        return this._height;
    }
    set height(value) {
        Assert.isNonNegativeNumber(value, "height");
        this._setHeight(value);
    }
    get size() {
        return [this._width, this._height] as [number, number];
    }
    set size(value) {
        Assert.isSize(value, "size");
        this._setWidth(Size.width(value));
        this._setHeight(Size.height(value));
    }
    get rotation() {
        return this._rotation;
    }
    set rotation(value) {
        Assert.isRealNumber(value, "rotation");
        this._setRotation(value);
    }

    initialized() {
        // prettier-ignore
        return (
            !Number.isNaN(this._x) &&
            !Number.isNaN(this._y) &&
            !Number.isNaN(this._width) &&
            !Number.isNaN(this._height)
        );
    }

    degenerate(check: false): Point | SealedGeometryArray<[LineSegment, LineSegment]> | this | null;
    degenerate(check: true): boolean;
    @statedWithBoolean(undefined)
    degenerate(check: boolean) {
        if (!this.initialized()) return check ? true : null;

        const w0 = Float.equalTo(this._width, 0, Float.MACHINE_EPSILON);
        const h0 = Float.equalTo(this._height, 0, Float.MACHINE_EPSILON);
        if (check) return w0 || h0;

        const c = this.coordinates;
        if (w0 && !h0) {
            const d = Vector2.add(c, Vector2.from2(this._rotation + Maths.PI / 2, this._height));
            return new SealedGeometryArray([new LineSegment(c, d), new LineSegment(d, c)]);
        }
        if (!w0 && h0) {
            const d = Vector2.add(c, Vector2.from2(this._rotation, this._width));
            return new SealedGeometryArray([new LineSegment(c, d), new LineSegment(d, c)]);
        }
        if (w0 && h0) return new Point(c);
        return this;
    }

    static fromTwoPointsAndRotation(point1: [number, number] | Point, point2: [number, number] | Point, rotation = 0) {
        const c1 = getCoordinates(point1, "point1");
        const c2 = getCoordinates(point2, "point2");

        const v = Vector2.from(c1, c2);
        const vuw = Vector2.from2(rotation, 1);
        const dpw = Vector2.dot(v, vuw);
        const vw = Vector2.project(v, vuw);
        const vuh = Vector2.from2(rotation + Maths.PI / 2, 1);
        const dph = Vector2.dot(v, vuh);
        const vh = Vector2.project(v, vuh);
        let c: [number, number];

        const c3 = Vector2.add(c1, vw);
        const c4 = Vector2.add(c1, vh);
        if (dpw > 0) {
            if (dph > 0) c = c1;
            else c = c4;
        } else {
            if (dph > 0) c = c3;
            else c = c2;
        }
        const w = Vector2.magnitude(vw);
        const h = Vector2.magnitude(vh);
        return new Rectangle(c, w, h, rotation);
    }

    static fromCenterEtc(center: [number, number] | Point, width: number, height: number, rotation = 0) {
        const cc = getCoordinates(center, "center");
        const vw = Vector2.from2(rotation, -width / 2);
        const vh = Vector2.from2(rotation + Maths.PI / 2, -height / 2);
        const [x, y] = Vector2.add(cc, Vector2.add(vw, vh));
        return new Rectangle(x, y, width, height, rotation);
    }
    /**
     * By change the `point` and swap the `width` and `height`(if needed), to make the `rotation` of rectangle `this` into the interval $[0,\frac{\pi}{2})$.
     */
    simplify() {
        const { coordinates: c, _width: w, _height: h, _rotation: phi } = this;
        const vw = Vector2.from2(phi, w);
        const vh = Vector2.from2(phi + Maths.PI / 2, h);
        if (Angle.between(phi, 0, Maths.PI / 2, true, false, true)) {
            // do nothing;
        }
        if (Angle.between(phi, Maths.PI / 2, Maths.PI, true, false, true)) {
            this.coordinates = Vector2.add(c, vh);
            this.rotation = phi - Maths.PI / 2;
            [this.width, this.height] = [h, w];
        }
        if (Angle.between(phi, Maths.PI, (3 * Maths.PI) / 2, true, false, true)) {
            this.coordinates = Vector2.add(Vector2.add(c, vw), vh);
            this.rotation = phi - Maths.PI;
        }
        if (Angle.between(phi, (3 * Maths.PI) / 2, 2 * Maths.PI, true, false, true)) {
            this.coordinates = Vector2.add(c, vw);
            this.rotation = phi - (3 * Maths.PI) / 2;
            [this.width, this.height] = [h, w];
        }
        return this;
    }

    getLength() {
        return 2 * this._width + 2 * this._height;
    }
    getArea() {
        return this._width * this._height;
    }
    getWindingDirection() {
        return 1 as WindingDirection;
    }
    @validGeometryArguments
    isPointOn(point: [number, number] | Point) {
        const c0 = getCoordinates(point, "point");
        const [c1, c2, c3, c4] = this.getVertices().map(p => p.coordinates);
        const v12 = Vector2.from(c1, c2);
        const v23 = Vector2.from(c2, c3);
        const v34 = Vector2.from(c3, c4);
        const v41 = Vector2.from(c4, c1);
        const v10 = Vector2.from(c1, c0);
        const v20 = Vector2.from(c2, c0);
        const v30 = Vector2.from(c3, c0);
        const v40 = Vector2.from(c4, c0);

        if (Float.equalTo(Vector2.cross(v12, v10), 0, eps.vectorEpsilon) && Float.between(Vector2.dot(v12, v10) / Vector2.dot(v12, v12), 0, 1, false, false, eps.vectorEpsilon)) return true;
        if (Float.equalTo(Vector2.cross(v23, v20), 0, eps.vectorEpsilon) && Float.between(Vector2.dot(v23, v20) / Vector2.dot(v23, v23), 0, 1, false, false, eps.vectorEpsilon)) return true;
        if (Float.equalTo(Vector2.cross(v34, v30), 0, eps.vectorEpsilon) && Float.between(Vector2.dot(v34, v30) / Vector2.dot(v34, v34), 0, 1, false, false, eps.vectorEpsilon)) return true;
        if (Float.equalTo(Vector2.cross(v41, v40), 0, eps.vectorEpsilon) && Float.between(Vector2.dot(v41, v40) / Vector2.dot(v41, v41), 0, 1, false, false, eps.vectorEpsilon)) return true;
        return false;
    }
    @validGeometryArguments
    isPointOutside(point: [number, number] | Point) {
        const c0 = getCoordinates(point, "point");
        const [c1, c2, c3, c4] = this.getVertices().map(p => p.coordinates);
        const v12 = Vector2.from(c1, c2);
        const v23 = Vector2.from(c2, c3);
        const v34 = Vector2.from(c3, c4);
        const v41 = Vector2.from(c4, c1);
        const v10 = Vector2.from(c1, c0);
        const v20 = Vector2.from(c2, c0);
        const v30 = Vector2.from(c3, c0);
        const v40 = Vector2.from(c4, c0);
        if (Float.lessThan(Vector2.cross(v12, v10), 0, eps.vectorEpsilon)) return true;
        if (Float.lessThan(Vector2.cross(v23, v20), 0, eps.vectorEpsilon)) return true;
        if (Float.lessThan(Vector2.cross(v34, v30), 0, eps.vectorEpsilon)) return true;
        if (Float.lessThan(Vector2.cross(v41, v40), 0, eps.vectorEpsilon)) return true;
        return false;
    }
    @validGeometryArguments
    isPointInside(point: [number, number] | Point) {
        const c0 = getCoordinates(point, "point");
        const [c1, c2, c3, c4] = this.getVertices().map(p => p.coordinates);
        const v12 = Vector2.from(c1, c2);
        const v23 = Vector2.from(c2, c3);
        const v34 = Vector2.from(c3, c4);
        const v41 = Vector2.from(c4, c1);
        const v10 = Vector2.from(c1, c0);
        const v20 = Vector2.from(c2, c0);
        const v30 = Vector2.from(c3, c0);
        const v40 = Vector2.from(c4, c0);
        if (
            Float.greaterThan(Vector2.cross(v12, v10), 0, eps.vectorEpsilon) &&
            Float.greaterThan(Vector2.cross(v23, v20), 0, eps.vectorEpsilon) &&
            Float.greaterThan(Vector2.cross(v34, v30), 0, eps.vectorEpsilon) &&
            Float.greaterThan(Vector2.cross(v41, v40), 0, eps.vectorEpsilon)
        )
            return true;
        return false;
    }

    @stated
    getVertices() {
        const { _x: x, _y: y, _width: w, _height: h, _rotation: phi } = this;
        const vw = Vector2.from2(phi, w);
        const vh = Vector2.from2(phi + Maths.PI / 2, h);
        const nn = [x, y] as [number, number];
        const nm = Vector2.add(nn, vw);
        const mm = Vector2.add(nm, vh);
        const mn = Vector2.add(nn, vh);
        return [new Point(nn), new Point(nm), new Point(mm), new Point(mn)] as [Point, Point, Point, Point];
    }
    getCenter() {
        const { coordinates: cc, _width: w, _height: h, _rotation: phi } = this;
        const vw = Vector2.from2(phi, w / 2);
        const vh = Vector2.from2(phi + Maths.PI / 2, h / 2);
        const c = Vector2.add(cc, Vector2.add(vw, vh));
        return new Point(c);
    }

    getBoundingBox() {
        const { _x: x, _y: y, _width: w, _height: h, rotation: phi } = this;
        const vw = Vector2.from2(phi, w);
        const vh = Vector2.from2(phi + Maths.PI / 2, h);
        const xs = [x, x + vw[0], x + vh[0], x + vw[0] + vh[0]];
        const ys = [y, y + vw[1], y + vh[1], y + vw[1] + vh[1]];
        const nx = Maths.min(...xs);
        const mx = Maths.max(...xs);
        const ny = Maths.min(...ys);
        const my = Maths.max(...ys);

        return Box.from([nx, ny], [mx, my]);
    }
    move(deltaX: number, deltaY: number) {
        this.coordinates = Vector2.add(this.coordinates, [deltaX, deltaY]);
        return this;
    }

    /**
     * Keep the center of the rectangle `this` put, try to set the rectangle with `width` and `height`, but keep the aspect ratio of the rectangle `this`,
     * if `clamped` is true, it limits the new width and height of rectangle `this` not to exceed the `width` and `height`.
     * @param width
     * @param height
     */
    keepAspectRatioFit(width: number, height: number, clamped = true) {
        const cc = this.getCenter().coordinates;
        const { _width: w, _height: h } = this;

        const nw = (w / h) * height;
        const nh = (h / w) * width;

        if (nw === width || nh === height) {
            this.copyFrom(Rectangle.fromCenterEtc(cc, nw, nh, this._rotation));
            return this;
        }
        if (nw < width === clamped) {
            this.copyFrom(Rectangle.fromCenterEtc(cc, nw, height, this._rotation));
            return this;
        } else {
            this.copyFrom(Rectangle.fromCenterEtc(cc, width, nh, this._rotation));
            return this;
        }
    }

    toPolygon() {
        const polygon = new Polygon();
        const [p1, p2, p3, p4] = this.getVertices();
        polygon.appendVertex(Polygon.vertex(p1));
        polygon.appendVertex(Polygon.vertex(p2));
        polygon.appendVertex(Polygon.vertex(p3));
        polygon.appendVertex(Polygon.vertex(p4));
        polygon.closed = true;
        return polygon;
    }

    toPath() {
        const [p1, p2, p3, p4] = this.getVertices();
        const commands: PathCommand[] = [];
        commands.push(Path.moveTo(p1));
        commands.push(Path.lineTo(p2));
        commands.push(Path.lineTo(p3));
        commands.push(Path.lineTo(p4));
        return new Path(commands, true);
    }

    apply(transformation: Transformation) {
        const { _x: x, _y: y, _width: w, _height: h, _rotation: phi } = this;
        // Treat the rectangle as it is from a square(-1/2,-1/2,1,1) with center at [0,0].
        const c = this.getCenter().coordinates;
        const rectangleTransformation = new Transformation();
        rectangleTransformation
            .addTranslate(...c)
            .addRotate(phi)
            .addScale(w, h);
        const t = transformation.clone().addMatrix(...rectangleTransformation.matrix);
        const {
            translate: [tx, ty],
            rotate,
            scale: [sx, sy],
            skew: [kx, ky]
        } = t.decomposeQr();

        if (Float.equalTo(kx, 0, eps.epsilon) && Float.equalTo(ky, 0, eps.epsilon)) {
            const newWidth = Maths.abs(sx);
            const newHeight = Maths.abs(sy);
            const newRotation = rotate;
            return Rectangle.fromCenterEtc([tx, ty], newWidth, newHeight, newRotation);
        } else {
            return this.toPath().apply(transformation);
        }
    }

    getGraphics(viewport: ViewportDescriptor) {
        const dg = this.degenerate(false);
        if (dg === null) return new Graphics();
        if (dg !== this) return (dg as Exclude<typeof dg, this>).getGraphics(viewport);

        const g = new Graphics();
        const gg = new GeometryGraphic();
        g.append(gg);
        const [p1, p2, p3, p4] = this.getVertices();
        gg.moveTo(...p1.coordinates);
        gg.lineTo(...p2.coordinates);
        gg.lineTo(...p3.coordinates);
        gg.lineTo(...p4.coordinates);
        gg.close();
        return g;
    }
    clone() {
        const ret = new Rectangle();
        ret._x = this._x;
        ret._y = this._y;
        ret._width = this._width;
        ret._height = this._height;
        ret._rotation = this._rotation;
        return ret;
    }
    copyFrom(shape: Rectangle | null) {
        if (shape === null) shape = new Rectangle();
        this._setX(shape._x);
        this._setY(shape._y);
        this._setWidth(shape._width);
        this._setHeight(shape._height);
        this._setRotation(shape._rotation);
        return this;
    }
    override toJSON() {
        return {
            name: this.name,
            id: this.id,
            x: this._x,
            y: this._y,
            width: this._width,
            height: this._height,
            rotation: this._rotation
        };
    }
}
