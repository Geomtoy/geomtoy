import { Box, Assert, Type, Utility, Coordinates, Vector2, Maths, Size } from "@geomtoy/util";
import { validAndWithSameOwner } from "../../decorator";

import Shape from "../../base/Shape";
import Point from "./Point";
import Transformation from "../../transformation";
import Graphics from "../../graphics";
import EventObject from "../../event/EventObject";

import type Geomtoy from "../../geomtoy";
import type { ClosedShape, Direction, RotationFeaturedShape, TransformableShape } from "../../types";

class Rectangle extends Shape implements ClosedShape, TransformableShape, RotationFeaturedShape {
    private _originX = NaN;
    private _originY = NaN;
    private _width = NaN;
    private _height = NaN;
    private _rotation = 0;

    constructor(owner: Geomtoy, originX: number, originY: number, width: number, height: number, rotation?: number);
    constructor(owner: Geomtoy, originX: number, originY: number, size: [number, number], rotation?: number);
    constructor(owner: Geomtoy, originCoordinates: [number, number], width: number, height: number, rotation?: number);
    constructor(owner: Geomtoy, originCoordinates: [number, number], size: [number, number], rotation?: number);
    constructor(owner: Geomtoy, originPoint: Point, width: number, height: number, rotation?: number);
    constructor(owner: Geomtoy, originPoint: Point, size: [number, number], rotation?: number);
    constructor(owner: Geomtoy);
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any) {
        super(o);
        if (Type.isNumber(a1)) {
            if (Type.isNumber(a3)) {
                Object.assign(this, { originX: a1, originY: a2, width: a3, height: a4, rotation: a5 ?? 0 });
            } else {
                Object.assign(this, { originX: a1, originY: a2, size: a3, rotation: a4 ?? 0 });
            }
        }
        if (Type.isArray(a1)) {
            if (Type.isNumber(a2)) {
                Object.assign(this, { originCoordinates: a1, width: a2, height: a3, rotation: a4 ?? 0 });
            } else {
                Object.assign(this, { originCoordinates: a1, size: a2, rotation: a3 ?? 0 });
            }
        }
        if (a1 instanceof Point) {
            if (Type.isNumber(a2)) {
                Object.assign(this, { originPoint: a1, width: a2, height: a3, rotation: a4 ?? 0 });
            } else {
                Object.assign(this, { originPoint: a1, size: a2, rotation: a3 ?? 0 });
            }
        }
        return Object.seal(this);
    }

    static readonly events = Object.freeze({
        originXChanged: "originX" as const,
        originYChanged: "originY" as const,
        widthChanged: "width" as const,
        heightChanged: "height" as const,
        rotationChanged: "rotation" as const
    });

    private _setOriginX(value: number) {
        if (!Utility.isEqualTo(this._originX, value)) this.trigger_(EventObject.simple(this, Rectangle.events.originXChanged));
        this._originX = value;
    }
    private _setOriginY(value: number) {
        if (!Utility.isEqualTo(this._originY, value)) this.trigger_(EventObject.simple(this, Rectangle.events.originYChanged));
        this._originY = value;
    }
    private _setWidth(value: number) {
        if (!Utility.isEqualTo(this._width, value)) this.trigger_(EventObject.simple(this, Rectangle.events.widthChanged));
        this._width = value;
    }
    private _setHeight(value: number) {
        if (!Utility.isEqualTo(this._height, value)) this.trigger_(EventObject.simple(this, Rectangle.events.heightChanged));
        this._height = value;
    }
    private _setRotation(value: number) {
        if (!Utility.isEqualTo(this._rotation, value)) this.trigger_(EventObject.simple(this, Rectangle.events.rotationChanged));
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
        return new Point(this.owner, this._originX, this._originY);
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

    isValid() {
        const { originCoordinates: oc, size: s } = this;
        if (!Coordinates.isValid(oc)) return false;
        if (!Size.isValid(s)) return false;
        return true;
    }

    static fromTwoPoints(owner: Geomtoy, point1: Point, point2: Point) {
        if (point1.isSameAs(point2)) {
            throw new Error(`[G]Diagonal endpoints \`point1\` and \`point2\` of a rectangle can NOT be the same.`);
        }
        let { x: x1, y: y1 } = point1,
            { x: x2, y: y2 } = point2,
            minX = Maths.min(...[x1, x2])!,
            minY = Maths.min(...[y1, y2])!,
            dx = Maths.abs(x1 - x2),
            dy = Maths.abs(y1 - y2);
        return new Rectangle(owner, [minX, minY], dx, dy);
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
    isPointOn(point: [number, number] | Point): boolean {
        throw new Error("Method not implemented.");
    }
    isPointOutside(point: [number, number] | Point): boolean {
        throw new Error("Method not implemented.");
    }
    isPointInside(point: [number, number] | Point): boolean {
        throw new Error("Method not implemented.");
    }

    getCornerPoints(): [Point, Point, Point, Point] {
        const { originX: x, originY: y, width: w, height: h } = this;
        const b: [number, number, number, number] = [x, y, w, h];

        const t = new Transformation(this.owner);
        t.rotate(this.rotation, this.getCenterPoint());
        const nn = t.transformCoordinates(Box.nn(b));
        const mn = t.transformCoordinates(Box.mn(b));
        const mm = t.transformCoordinates(Box.mm(b));
        const nm = t.transformCoordinates(Box.nm(b));
        return [new Point(this.owner, nn), new Point(this.owner, mn), new Point(this.owner, mm), new Point(this.owner, nm)];
    }

    getCenterPoint() {
        const c = Vector2.add(this.originCoordinates, [Size.width(this.size) / 2, Size.height(this.size) / 2]);
        return new Point(this.owner, c);
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

    /**
     * Move rectangle `this` by `offsetX` and `offsetY` to get new rectangle.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY);
    }
    /**
     * Move rectangle `this` itself by `offsetX` and `offsetY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.originCoordinates = Vector2.add(this.originCoordinates, [deltaX, deltaY]);
        return this;
    }
    /**
     * Move rectangle `this` with `distance` along `angle` to get new rectangle.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance);
    }
    /**
     * Move rectangle `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
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

    apply(transformation: Transformation): Shape {
        throw new Error("Method not implemented.");
    }

    getGraphics() {
        const g = new Graphics();
        if (!this.isValid()) return g;
        const [p1, p2, p3, p4] = this.getCornerPoints();
        g.moveTo(...p1.coordinates);
        g.lineTo(...p2.coordinates);
        g.lineTo(...p3.coordinates);
        g.lineTo(...p4.coordinates);
        g.close();
        return g;
    }
    clone() {
        return new Rectangle(this.owner, this.originX, this.originY, this.width, this.height, this.rotation);
    }
    copyFrom(shape: Rectangle | null) {
        if (shape === null) shape = new Rectangle(this.owner);
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
            `} owned by Geomtoy(${this.owner.uuid})`
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
validAndWithSameOwner(Rectangle);

export default Rectangle;
