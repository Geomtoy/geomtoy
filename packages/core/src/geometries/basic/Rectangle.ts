import { Assert, Box, Coordinates, Maths, Size, Type, Utility, Vector2 } from "@geomtoy/util";
import { validGeometry } from "../../misc/decor-geometry";

import Geometry from "../../base/Geometry";
import EventSourceObject from "../../event/EventSourceObject";
import GeometryGraphic from "../../graphics/GeometryGraphic";
import Transformation from "../../transformation";
import Point from "./Point";

import SealedShapeArray from "../../collection/SealedShapeArray";
import { optioner } from "../../geomtoy";
import Graphics from "../../graphics";
import { statedWithBoolean } from "../../misc/decor-cache";
import type { ClosedGeometry, RotationFeaturedGeometry, ViewportDescriptor, WindingDirection } from "../../types";
import Path from "../general/Path";
import Polygon from "../general/Polygon";
import LineSegment from "./LineSegment";

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
    }

    static override events = {
        xChanged: "x" as const,
        yChanged: "y" as const,
        widthChanged: "width" as const,
        heightChanged: "height" as const,
        rotationChanged: "rotation" as const
    };

    private _setX(value: number) {
        if (!Utility.isEqualTo(this._x, value)) this.trigger_(new EventSourceObject(this, Rectangle.events.xChanged));
        this._x = value;
    }
    private _setY(value: number) {
        if (!Utility.isEqualTo(this._y, value)) this.trigger_(new EventSourceObject(this, Rectangle.events.yChanged));
        this._y = value;
    }
    private _setWidth(value: number) {
        if (!Utility.isEqualTo(this._width, value)) this.trigger_(new EventSourceObject(this, Rectangle.events.widthChanged));
        this._width = value;
    }
    private _setHeight(value: number) {
        if (!Utility.isEqualTo(this._height, value)) this.trigger_(new EventSourceObject(this, Rectangle.events.heightChanged));
        this._height = value;
    }
    private _setRotation(value: number) {
        if (!Utility.isEqualTo(this._rotation, value)) this.trigger_(new EventSourceObject(this, Rectangle.events.rotationChanged));
        this._rotation = value;
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

    degenerate(check: false): Point | SealedShapeArray<[LineSegment, LineSegment]> | this | null;
    degenerate(check: true): boolean;
    @statedWithBoolean(undefined)
    degenerate(check: boolean) {
        if (!this.initialized()) return check ? true : null;

        const w0 = Maths.equalTo(this._width, 0, optioner.options.epsilon);
        const h0 = Maths.equalTo(this._height, 0, optioner.options.epsilon);
        if (check) return w0 || h0;

        if (w0 && !h0) {
            // prettier-ignore
            return new SealedShapeArray([
                new LineSegment(this._x, this._y, this._x, this._y + this._height), 
                new LineSegment(this._x, this._y + this._height, this._x, this._y)
            ]);
        }
        if (!w0 && h0) {
            // prettier-ignore
            return new SealedShapeArray([
                new LineSegment(this._x, this._y, this._x + this._width, this._y), 
                new LineSegment(this._x + this._width, this._y, this._x, this._y)
            ]);
        }
        if (w0 && h0) return new Point(this._x, this._y);
        return this;
    }

    static fromTwoPointsAndRotation(point1: Point, point2: Point, rotation = 0) {
        const c1 = point1.coordinates;
        const c2 = point2.coordinates;
        const box = Box.from(c1, c2);
        return new Rectangle(Box.x(box), Box.y(box), Box.width(box), Box.height(box), rotation);
    }

    getLength(): number {
        throw new Error("Method not implemented.");
    }
    getArea(): number {
        throw new Error("Method not implemented.");
    }
    getWindingDirection(): WindingDirection {
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

    getVertices(): [Point, Point, Point, Point] {
        const { x: x, y: y, width: w, height: h, rotation } = this;
        const b: [number, number, number, number] = [x, y, w, h];
        const t = new Transformation();
        t.setRotate(rotation, this.getCenterPoint());
        const nn = t.transformCoordinates(Box.nn(b));
        const mn = t.transformCoordinates(Box.mn(b));
        const mm = t.transformCoordinates(Box.mm(b));
        const nm = t.transformCoordinates(Box.nm(b));
        return [new Point(nn), new Point(mn), new Point(mm), new Point(nm)];
    }

    getCenterPoint() {
        const c = Vector2.add(this.coordinates, [Size.width(this.size) / 2, Size.height(this.size) / 2]);
        return new Point(c);
    }

    normalize() {
        //todo Normalize rectangle with rotation of `n * Maths.PI / 2` to regular non-rotational rectangle
    }

    getBoundingBox(): [number, number, number, number] {
        throw new Error();
        // let xRight = this.owner.xAxisPositiveOnRight,
        //     yBottom = this.owner.yAxisPositiveOnBottom,
        //     { x: x, y: y, width: w, height: h } = this,
        //     l = x,
        //     r = x + w,
        //     t = y,
        //     b = y + h
        // if (!xRight) [l, r] = [r, l]
        // if (!yBottom) [t, b] = [b, t]
        // let ret = 0
        // if (side === "left") {
        //     ret = l
        // }
        // if (side === "right") {
        //     ret = r
        // }
        // if (side === "top") {
        //     ret = t
        // }
        // if (side === "bottom") {
        //     ret = b
        // }
        // return ret
    }
    move(deltaX: number, deltaY: number) {
        this.coordinates = Vector2.add(this.coordinates, [deltaX, deltaY]);
        return this;
    }

    inflate(size: [number, number]) {
        return this.clone().inflateSelf(size);
    }
    inflateSelf(size: [number, number]) {
        let { x: x, y: y, width: w, height: h } = this,
            [sw, sh] = size,
            nx = x - sw,
            ny = y - sh,
            nw = w + sw * 2,
            nh = h + sw * 2;
        if (nw <= 0 || nh <= 0) {
            return this;
        }
        this.x = nx;
        this.y = ny;
        this.width = nw;
        this.height = nh;
        return this;
    }

    // keepAspectRadioAndFit(size, keepInside = true) {
    //     if (this.width === 0) {
    //         return new Size(0, Size.height)
    //     }
    //     if (this.height === 0) {
    //         return new Size(Size.width, 0)
    //     }
    //     let nw = (this.width / this.height) * Size.height,
    //         nh = (this.height / this.width) * Size.width

    //     if (nw === Size.width && nh === Size.height) {
    //         return new Size(size)
    //     }
    //     if ((nw < Size.width) ^ keepInside) {
    //         return new Size(nw, Size.height)
    //     } else {
    //         return new Size(Size.width, nh)
    //     }
    // }

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
        const path = new Path();
        const [p1, p2, p3, p4] = this.getVertices();
        path.appendCommand(Path.moveTo(p1));
        path.appendCommand(Path.lineTo(p2));
        path.appendCommand(Path.lineTo(p3));
        path.appendCommand(Path.lineTo(p4));
        path.closed = true;
        return path;
    }

    apply(transformation: Transformation) {
        const { coordinates: c, width: w, height: h, rotation } = this;
        const rectangleTransformation = new Transformation();
        rectangleTransformation.setRotate(rotation, this.getCenterPoint());
        const t = transformation.clone().addMatrix(...rectangleTransformation.matrix);
        const {
            skew: [kx, ky],
            scale: [sx, sy],
            rotate
        } = t.decomposeQr();
        const epsilon = optioner.options.epsilon;

        if (Maths.equalTo(kx, 0, epsilon) && Maths.equalTo(ky, 0, epsilon)) {
            const newCoordinates = t.transformCoordinates(c);
            const newWidth = w * sx;
            const newHeight = h * sy;
            const newRotation = rotate;
            return new Rectangle(newCoordinates, newWidth, newHeight, newRotation);
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
        return new Rectangle(this.x, this.y, this.width, this.height, this.rotation);
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
    override toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.id}){`,
            `\tx: ${this.x}`,
            `\ty: ${this.y}`,
            `\twidth: ${this.width}`,
            `\theight: ${this.height}`,
            `\trotation: ${this.rotation}`,
            `}`
        ].join("\n");
    }
}
