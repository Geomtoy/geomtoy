import util from "./utility"
import Point from "./Point"
import { GraphicsCommand } from "./types"
import GeomObject from "./base/GeomObject"
import Transformation from "./transformation"
import { validAndWithSameOwner } from "./decorator"
import assert from "./utility/assertion"
import math from "./utility/math"
import Geomtoy from "."
import coord from "./utility/coordinate"
import size from "./utility/size"
import Shape from "./base/Shape"

class Rectangle extends Shape {
    private _originCoordinate: [number, number] = [NaN, NaN]
    private _size: [number, number] = [NaN, NaN]

    constructor(owner: Geomtoy, originX: number, originY: number, width: number, height: number)
    constructor(owner: Geomtoy, originX: number, originY: number, size: [number, number])
    constructor(owner: Geomtoy, originCoordinate: [number, number], width: number, height: number)
    constructor(owner: Geomtoy, originCoordinate: [number, number], size: [number, number])
    constructor(owner: Geomtoy, originPoint: Point, width: number, height: number)
    constructor(owner: Geomtoy, originPoint: Point, size: [number, number])
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any) {
        super(o)
        if (util.isNumber(a1)) {
            if (util.isNumber(a3)) {
                Object.assign(this, { originX: a1, originY: a2, width: a3, height: a4 })
            } else {
                Object.assign(this, { originX: a1, originY: a2, size: a3 })
            }
        }
        if (util.isArray(a1)) {
            if (util.isNumber(a2)) {
                Object.assign(this, { originCoordinate: a1, width: a2, height: a3 })
            } else {
                Object.assign(this, { originCoordinate: a1, size: a2 })
            }
        }
        if (a1 instanceof Point) {
            if (util.isNumber(a2)) {
                Object.assign(this, { originPoint: a1, width: a2, height: a3 })
            } else {
                Object.assign(this, { originPoint: a1, size: a2 })
            }
        }
        return Object.seal(this)
    }

    static readonly events = Object.freeze({
        originXChanged: "originXChanged",
        originYChanged: "originYChanged",
        widthChanged: "widthChanged",
        heightChanged: "heightChanged"
    })

    private _setOriginX(value: number) {
        this.willTrigger_(coord.x(this._originCoordinate), value, [Rectangle.events.originXChanged])
        coord.x(this._originCoordinate, value)
    }
    private _setOriginY(value: number) {
        this.willTrigger_(coord.y(this._originCoordinate), value, [Rectangle.events.originYChanged])
        coord.y(this._originCoordinate, value)
    }
    private _setWidth(value: number) {
        this.willTrigger_(size.width(this._size), value, [Rectangle.events.widthChanged])
        size.width(this._size, value)
    }
    private _setHeight(value: number) {
        this.willTrigger_(size.height(this._size), value, [Rectangle.events.heightChanged])
        size.height(this._size, value)
    }

    get originX() {
        return coord.x(this._originCoordinate)
    }
    set originX(value) {
        assert.isRealNumber(value, "originX")
        this._setOriginX(value)
    }
    get originY() {
        return coord.y(this._originCoordinate)
    }
    set originY(value) {
        assert.isRealNumber(value, "originY")
        this._setOriginY(value)
    }
    get originCoordinate() {
        return coord.clone(this._originCoordinate)
    }
    set originCoordinate(value) {
        assert.isCoordinate(value, "originCoordinate")
        this._setOriginX(coord.x(value))
        this._setOriginY(coord.y(value))
    }
    get originPoint() {
        return new Point(this.owner, this._originCoordinate)
    }
    set originPoint(value) {
        assert.isPoint(value, "originPoint")
        this._setOriginX(value.x)
        this._setOriginY(value.y)
    }
    get width() {
        return size.width(this._size)
    }
    set width(value) {
        assert.isPositiveNumber(value, "width")
        this._setWidth(value)
    }
    get height() {
        return size.height(this._size)
    }
    set height(value) {
        assert.isPositiveNumber(value, "height")
        this._setHeight(value)
    }
    get size() {
        return size.clone(this._size)
    }
    set size(value) {
        assert.isSize(value, "size")
        this._setWidth(size.width(value))
        this._setHeight(size.height(value))
    }

    isValid() {
        const [oc, s] = [this._originCoordinate, this._size]
        const epsilon = this.options_.epsilon
        if (!coord.isValid(oc)) return false
        if (!size.isValid(s, epsilon)) return false
        return true
    }

    static fromPoints(owner: Geomtoy, point1: Point, point2: Point) {
        if (point1.isSameAs(point2)) {
            throw new Error(`[G]Diagonal endpoints \`point1\` and \`point2\` of a rectangle can NOT be the same.`)
        }
        let { x: x1, y: y1 } = point1,
            { x: x2, y: y2 } = point2,
            minX = math.min(...[x1, x2])!,
            minY = math.min(...[y1, y2])!,
            dx = math.abs(x1 - x2),
            dy = math.abs(y1 - y2)
        return new Rectangle(owner, [minX, minY], dx, dy)
    }

    getCornerPoint(corner: "leftTop" | "rightTop" | "rightBottom" | "leftBottom"): Point {
        let xRight = this.owner.xAxisPositiveOnRight,
            yBottom = this.owner.yAxisPositiveOnBottom,
            { originX: x, originY: y, width: w, height: h } = this,
            lt: [number, number] = [x, y],
            rt: [number, number] = [x + w, y],
            rb: [number, number] = [x + w, y + h],
            lb: [number, number] = [x, y + h]
        if (!xRight) ([lt, rt] = [rt, lt]), ([lb, rb] = [rb, lb])
        if (!yBottom) ([lt, lb] = [lb, lt]), ([rt, rb] = [rb, rt])
        let ret = Point.zero.bind(this)()
        if (corner === "leftTop") {
            ret = new Point(this.owner, lt)
        }
        if (corner === "rightTop") {
            ret = new Point(this.owner, rt)
        }
        if (corner === "rightBottom") {
            ret = new Point(this.owner, rb)
        }
        if (corner === "leftBottom") {
            ret = new Point(this.owner, lb)
        }
        return ret
    }
    getBounding(side: "left" | "right" | "top" | "bottom"): number {
        let xRight = this.owner.xAxisPositiveOnRight,
            yBottom = this.owner.yAxisPositiveOnBottom,
            { originX: x, originY: y, width: w, height: h } = this,
            l = x,
            r = x + w,
            t = y,
            b = y + h
        if (!xRight) [l, r] = [r, l]
        if (!yBottom) [t, b] = [b, t]
        let ret = 0
        if (side === "left") {
            ret = l
        }
        if (side === "right") {
            ret = r
        }
        if (side === "top") {
            ret = t
        }
        if (side === "bottom") {
            ret = b
        }
        return ret
    }

    /**
     * Move rectangle `this` by `offsetX` and `offsetY` to get new rectangle.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY)
    }
    /**
     * Move rectangle `this` itself by `offsetX` and `offsetY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.originCoordinate = coord.move(this.originCoordinate, deltaX, deltaY)
        return this
    }
    /**
     * Move rectangle `this` with `distance` along `angle` to get new rectangle.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance)
    }
    /**
     * Move rectangle `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        this.originCoordinate = coord.moveAlongAngle(this.originCoordinate, angle, distance)
        return this
    }

    inflate(size: [number, number]) {
        return this.clone().inflateSelf(size)
    }
    inflateSelf(size: [number, number]) {
        let { originX: x, originY: y, width: w, height: h } = this,
            [sw, sh] = size,
            nx = x - sw,
            ny = y - sh,
            nw = w + sw * 2,
            nh = h + sw * 2
        if (nw <= 0 || nh <= 0) {
            return this
        }
        this.originX = nx
        this.originY = ny
        this.width = nw
        this.height = nh
        return this
    }

    // keepAspectRadioAndFit(size, keepInside = true) {
    //     if (this.width === 0) {
    //         return new Size(0, size.height)
    //     }
    //     if (this.height === 0) {
    //         return new Size(size.width, 0)
    //     }
    //     let nw = (this.width / this.height) * size.height,
    //         nh = (this.height / this.width) * size.width

    //     if (nw === size.width && nh === size.height) {
    //         return new Size(size)
    //     }
    //     if ((nw < size.width) ^ keepInside) {
    //         return new Size(nw, size.height)
    //     } else {
    //         return new Size(size.width, nh)
    //     }
    // }

    clone() {
        return new Rectangle(this.owner, this.originCoordinate, this.size)
    }
    copyFrom(rectangle: Rectangle | null) {
        if (rectangle === null) rectangle = new Rectangle(this.owner)
        this._setOriginX(coord.x(rectangle._originCoordinate))
        this._setOriginY(coord.y(rectangle._originCoordinate))
        this._setWidth(size.width(rectangle._size))
        this._setHeight(size.height(rectangle._size))
        return this
    }
    apply(transformation: Transformation): Shape {
        throw new Error("Method not implemented.")
    }

    getGraphics(): GraphicsCommand[] {
        throw new Error("Method not implemented.")
    }
    toString(): string {
        throw new Error("Method not implemented.")
    }
    toObject(): object {
        throw new Error("Method not implemented.")
    }
    toArray(): any[] {
        throw new Error("Method not implemented.")
    }

    // getIntersectionPointWithLine (double a, double b, double c, double x1, double y1, double x2, double y2, double x3, double y3) {
    // 	double x4,y4;//定义矩形第四个点的横纵坐标
    // 	x4 = x1 + x3 - x2;
    // 	y4 = y1 + y3 - y2;
    // 	//接下来依次求解直线与构成矩形的四条线段的交点
    // 	boolean m1,m2,m3,m4;//设置是否有交点的标志
    // 	System.out.println("直线与矩形交点的计算结果为 ： ");
    // 	m1 = pointLineSegment(a, b, c, x1, y1, x2, y2);
    // 	m2 = pointLineSegment(a, b, c, x2, y2, x3, y3);
    // 	m3 = pointLineSegment(a, b, c, x3, y3, x4, y4);
    // 	m4 = pointLineSegment(a, b, c, x4, y4, x1, y1);
    // 	if(m1 == m2 == m3 == m4 == false)
    // 		System.out.println("直线与矩形没有交点");
    // }
}
validAndWithSameOwner(Rectangle)
/**
 * @category Shape
 */
export default Rectangle
