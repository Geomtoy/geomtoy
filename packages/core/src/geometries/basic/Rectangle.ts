import { Box, Assert, Type, Utility, Coordinates, Vector2, Maths, Size } from "@geomtoy/util";
import { validGeometry } from "../../misc/decor-valid-geometry";

import Geometry from "../../base/Geometry";
import Point from "./Point";
import Transformation from "../../transformation";
import GeometryGraphics from "../../graphics/GeometryGraphics";
import EventObject from "../../event/EventObject";

import type { ClosedGeometry, WindingDirection, RotationFeaturedGeometry } from "../../types";
import Path from "../advanced/Path";
import Polygon from "../advanced/Polygon";
import { optioner } from "../../geomtoy";

@validGeometry
export default class Rectangle extends Geometry implements ClosedGeometry, RotationFeaturedGeometry {
    private _originX = NaN;
    private _originY = NaN;
    private _width = NaN;
    private _height = NaN;
    private _rotation = 0;

    constructor(originX: number, originY: number, width: number, height: number, rotation?: number);
    constructor(originX: number, originY: number, size: [number, number], rotation?: number);
    constructor(originCoordinates: [number, number], width: number, height: number, rotation?: number);
    constructor(originCoordinates: [number, number], size: [number, number], rotation?: number);
    constructor(originPoint: Point, width: number, height: number, rotation?: number);
    constructor(originPoint: Point, size: [number, number], rotation?: number);
    constructor();
    constructor(a0?: any, a1?: any, a2?: any, a3?: any, a4?: any) {
        super();
        if (Type.isNumber(a0)) {
            if (Type.isNumber(a2)) {
                Object.assign(this, { originX: a0, originY: a1, width: a2, height: a3, rotation: a4 ?? 0 });
            } else {
                Object.assign(this, { originX: a0, originY: a1, size: a2, rotation: a3 ?? 0 });
            }
        }
        if (Type.isArray(a0)) {
            if (Type.isNumber(a1)) {
                Object.assign(this, { originCoordinates: a0, width: a1, height: a2, rotation: a3 ?? 0 });
            } else {
                Object.assign(this, { originCoordinates: a0, size: a1, rotation: a2 ?? 0 });
            }
        }
        if (a0 instanceof Point) {
            if (Type.isNumber(a1)) {
                Object.assign(this, { originPoint: a0, width: a1, height: a2, rotation: a3 ?? 0 });
            } else {
                Object.assign(this, { originPoint: a0, size: a1, rotation: a2 ?? 0 });
            }
        }
    }

    get events() {
        return {
            originXChanged: "originX" as const,
            originYChanged: "originY" as const,
            widthChanged: "width" as const,
            heightChanged: "height" as const,
            rotationChanged: "rotation" as const
        };
    }

    private _setOriginX(value: number) {
        if (!Utility.isEqualTo(this._originX, value)) this.trigger_(EventObject.simple(this, this.events.originXChanged));
        this._originX = value;
    }
    private _setOriginY(value: number) {
        if (!Utility.isEqualTo(this._originY, value)) this.trigger_(EventObject.simple(this, this.events.originYChanged));
        this._originY = value;
    }
    private _setWidth(value: number) {
        if (!Utility.isEqualTo(this._width, value)) this.trigger_(EventObject.simple(this, this.events.widthChanged));
        this._width = value;
    }
    private _setHeight(value: number) {
        if (!Utility.isEqualTo(this._height, value)) this.trigger_(EventObject.simple(this, this.events.heightChanged));
        this._height = value;
    }
    private _setRotation(value: number) {
        if (!Utility.isEqualTo(this._rotation, value)) this.trigger_(EventObject.simple(this, this.events.rotationChanged));
        this._rotation = value;
    }

    get originX() {
        return this._originX;
    }
    set originX(value) {
        Assert.isRealNumber(value, "originX");
        this._setOriginX(value);
    }
    get originY() {
        return this._originY;
    }
    set originY(value) {
        Assert.isRealNumber(value, "originY");
        this._setOriginY(value);
    }
    get originCoordinates() {
        return [this._originX, this._originY] as [number, number];
    }
    set originCoordinates(value) {
        Assert.isCoordinates(value, "originCoordinates");
        this._setOriginX(Coordinates.x(value));
        this._setOriginY(Coordinates.y(value));
    }
    get originPoint() {
        return new Point(this._originX, this._originY);
    }
    set originPoint(value) {
        this._setOriginX(value.x);
        this._setOriginY(value.y);
    }
    get width() {
        return this._width;
    }
    set width(value) {
        Assert.isPositiveNumber(value, "width");
        this._setWidth(value);
    }
    get height() {
        return this._height;
    }
    set height(value) {
        Assert.isPositiveNumber(value, "height");
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

    protected initialized_() {
        // prettier-ignore
        return (
            !Number.isNaN(this._originX) &&
            !Number.isNaN(this._originY) &&
            !Number.isNaN(this._width) &&
            !Number.isNaN(this._height)
        );
    }

    static fromTwoPointsAndRotation(point1: Point, point2: Point, rotation = 0) {
        const c1 = point1.coordinates;
        const c2 = point2.coordinates;
        const epsilon = optioner.options.epsilon;

        if (Coordinates.isEqualTo(c1, c2, epsilon)) {
            console.warn("[G]Diagonal endpoints `point1` and `point2` of a rectangle can NOT be the same. `null` will be returned");
            return null;
        }
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
        const { originX: x, originY: y, width: w, height: h, rotation } = this;
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
        const c = Vector2.add(this.originCoordinates, [Size.width(this.size) / 2, Size.height(this.size) / 2]);
        return new Point(c);
    }

    normalize() {
        //todo Normalize rectangle with rotation of `n * Maths.PI / 2` to regular non-rotational rectangle
    }

    getBoundingBox(): [number, number, number, number] {
        throw new Error();
        // let xRight = this.owner.xAxisPositiveOnRight,
        //     yBottom = this.owner.yAxisPositiveOnBottom,
        //     { originX: x, originY: y, width: w, height: h } = this,
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
        this.originCoordinates = Vector2.add(this.originCoordinates, [deltaX, deltaY]);
        return this;
    }
    moveAlongAngle(angle: number, distance: number) {
        this.originCoordinates = Vector2.add(this.originCoordinates, Vector2.from2(angle, distance));
        return this;
    }

    inflate(size: [number, number]) {
        return this.clone().inflateSelf(size);
    }
    inflateSelf(size: [number, number]) {
        let { originX: x, originY: y, width: w, height: h } = this,
            [sw, sh] = size,
            nx = x - sw,
            ny = y - sh,
            nw = w + sw * 2,
            nh = h + sw * 2;
        if (nw <= 0 || nh <= 0) {
            return this;
        }
        this.originX = nx;
        this.originY = ny;
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
        const { originCoordinates: oc, width: w, height: h, rotation } = this;
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
            const newOrigin = t.transformCoordinates(oc);
            const newWidth = w * sx;
            const newHeight = h * sy;
            const newRotation = rotate;
            return new Rectangle(newOrigin, newWidth, newHeight, newRotation);
        } else {
            return this.toPath().apply(transformation);
        }
    }

    getGraphics() {
        const g = new GeometryGraphics();
        if (!this.initialized_()) return g;
        const [p1, p2, p3, p4] = this.getVertices();
        g.moveTo(...p1.coordinates);
        g.lineTo(...p2.coordinates);
        g.lineTo(...p3.coordinates);
        g.lineTo(...p4.coordinates);
        g.close();
        return g;
    }
    clone() {
        return new Rectangle(this.originX, this.originY, this.width, this.height, this.rotation);
    }
    copyFrom(shape: Rectangle | null) {
        if (shape === null) shape = new Rectangle();
        this._setOriginX(shape._originX);
        this._setOriginY(shape._originY);
        this._setWidth(shape._width);
        this._setHeight(shape._height);
        this._setRotation(shape._rotation);
        return this;
    }
    toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\toriginX: ${this.originX}`,
            `\toriginY: ${this.originY}`,
            `\twidth: ${this.width}`,
            `\theight: ${this.height}`,
            `\trotation: ${this.rotation}`,
            `}`
        ].join("\n");
    }
    toArray() {
        return [this.originX, this.originY, this.width, this.height, this.rotation];
    }
    toObject() {
        return {
            originX: this.originX,
            originY: this.originY,
            width: this.width,
            height: this.height,
            rotation: this.rotation
        };
    }
}
