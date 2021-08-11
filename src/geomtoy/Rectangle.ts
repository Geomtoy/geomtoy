import util from "./utility"

import Point from "./Point"
import { CanvasDirective, GraphicImplType, SvgDirective } from "./types"
import GeomObject from "./base/GeomObject"
import Transformation from "./transformation"
import { is, sealed } from "./decorator"
import math from "./utility/math"
import Geomtoy from "."
import coord from "./helper/coordinate"
import size from "./helper/size"

@sealed
class Rectangle extends GeomObject {
    #name = "Rectangle"
    #uuid = util.uuid()

    #originCoordinate: [number, number] = [NaN, NaN]
    #size: [number, number] = [NaN, NaN]

    constructor(owner: Geomtoy, originX: number, originY: number, width: number, height: number)
    constructor(owner: Geomtoy, originX: number, originY: number, size: [number, number])
    constructor(owner: Geomtoy, originCoordinate: [number, number], width: number, height: number)
    constructor(owner: Geomtoy, originCoordinate: [number, number], size: [number, number])
    constructor(owner: Geomtoy, originPoint: Point, width: number, height: number)
    constructor(owner: Geomtoy, originPoint: Point, size: [number, number])
    constructor(o: Geomtoy, a1: any, a2: any, a3?: any, a4?: any) {
        super(o)
        if (util.isNumber(a1) && util.isNumber(a2)) {
            if (util.isNumber(a3) && util.isNumber(a4)) {
                return Object.seal(util.assign(this, { originX: a1, originY: a2, width: a3, height: a4 }))
            }
            if (util.isArray(a3)) {
                return Object.seal(util.assign(this, { originX: a1, originY: a2, size: a3 }))
            }
        }
        if (util.isArray(a1)) {
            if (util.isNumber(a2) && util.isNumber(a3)) {
                return Object.seal(util.assign(this, { originCoordinate: a1, width: a2, height: a3 }))
            }
            if (util.isArray(a2)) {
                return Object.seal(util.assign(this, { originCoordinate: a1, size: a2 }))
            }
        }

        if (a1 instanceof Point) {
            if (util.isNumber(a2) && util.isNumber(a3)) {
                return Object.seal(util.assign(this, { originPoint: a1, width: a2, height: a3 }))
            }
            if (util.isArray(a2)) {
                return Object.seal(util.assign(this, { originPoint: a1, size: a2 }))
            }
        }
        throw new Error(`[G]Arguments can NOT construct a rectangle.`)
    }
    get name() {
        return this.#name
    }
    get uuid() {
        return this.#uuid
    }

    @is("realNumber")
    get originX() {
        return coord.x(this.#originCoordinate)
    }
    set originX(value) {
        coord.x(this.#originCoordinate, value)
    }
    @is("realNumber")
    get originY() {
        return coord.y(this.#originCoordinate)
    }
    set originY(value) {
        coord.y(this.#originCoordinate, value)
    }
    @is("coordinate")
    get originCoordinate() {
        return coord.copy(this.#originCoordinate)
    }
    set originCoordinate(value) {
        coord.assign(this.#originCoordinate, value)
    }
    @is("point")
    get originPoint() {
        return new Point(this.owner, this.#originCoordinate)
    }
    set originPoint(value) {
        coord.assign(this.#originCoordinate, value.coordinate)
    }
    @is("positiveNumber")
    get width() {
        return size.width(this.#size)
    }
    set width(value) {
        size.width(this.#size, value)
    }
    @is("positiveNumber")
    get height() {
        return size.height(this.#size)
    }
    set height(value) {
        size.height(this.#size, value)
    }
    @is("size")
    get size() {
        return size.copy(this.#size)
    }
    set size(value) {
        size.assign(this.#size, value)
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
        let xRight = this.owner.getOptions().coordinateSystem.xAxisPositiveOnRight,
            yBottom = this.owner.getOptions().coordinateSystem.yAxisPositiveOnBottom,
            { originX: x, originY: y, width: w, height: h } = this,
            lt: [number, number] = [x, y],
            rt: [number, number] = [x + w, y],
            rb: [number, number] = [x + w, y + h],
            lb: [number, number] = [x, y + h]
        if (!xRight) ([lt, rt] = [rt, lt]), ([lb, rb] = [rb, lb])
        if (!yBottom) ([lt, lb] = [lb, lt]), ([rt, rb] = [rb, rt])
        let ret = Point.zero(this.owner)
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
        let xRight = this.owner.getOptions().coordinateSystem.xAxisPositiveOnRight,
            yBottom = this.owner.getOptions().coordinateSystem.yAxisPositiveOnBottom,
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

    move(offsetX: number, offsetY: number): Rectangle {
        return this.clone().moveSelf(offsetX, offsetY)
    }
    moveSelf(offsetX: number, offsetY: number): Rectangle {
        this.originX += offsetX
        this.originY += offsetY
        return this
    }

    inflate(size: [number, number]) {
        return this.clone().inflateSelf(size)
    }
    inflateSelf(size: [number, number]) {
        let { originX: x, originY: y, width: w, height: h }  = this,
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
        return new Rectangle(this.owner,this.originCoordinate, this.size)
    }
    apply(transformation: Transformation): GeomObject {
        throw new Error("Method not implemented.")
    }

    getGraphic(type: GraphicImplType): (SvgDirective | CanvasDirective)[] {
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
    // 	m1 = pointSegment(a, b, c, x1, y1, x2, y2);
    // 	m2 = pointSegment(a, b, c, x2, y2, x3, y3);
    // 	m3 = pointSegment(a, b, c, x3, y3, x4, y4);
    // 	m4 = pointSegment(a, b, c, x4, y4, x1, y1);
    // 	if(m1 == m2 == m3 == m4 == false)
    // 		System.out.println("直线与矩形没有交点");
    // }
}

/**
 * 
 * @category GeomObject
 */
export default Rectangle
