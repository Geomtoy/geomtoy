import Point from "./Point"
import _ from "lodash"
import util from "./utility"
import { Size, Coordinate, CanvasDirective, GraphicImplType, SvgDirective } from "./types"
import GeomObject from "./base/GeomObject"
import Transformation from "./transformation"
import { is, sealed } from "./decorator"

@sealed
class Rectangle extends GeomObject {
    #originPoint: Point | undefined
    #width: number | undefined
    #height: number | undefined

    constructor(x: number, y: number, width: number, height: number)
    constructor(x: number, y: number, size: Size)
    constructor(position: Coordinate | Point, width: number, height: number)
    constructor(position: Coordinate | Point, size: Size)
    constructor(a1: any, a2: any, a3?: any, a4?: any) {
        super()
        if (_.isNumber(a1) && _.isNumber(a2)) {
            if (_.isNumber(a3) && _.isNumber(a4)) {
                let p = new Point(a1, a2)
                Object.seal(Object.assign(this, { originPoint: p, width: a3, height: a4 }))
                return this
            }
            if (util.type.isSize(a3)) {
                let p = new Point(a1, a2),
                    [w, h] = a3
                Object.seal(Object.assign(this, { originPoint: p, width: w, height: h }))
                return this
            }
        }
        if (util.type.isCoordinate(a1) || a1 instanceof Point) {
            if (_.isNumber(a2) && _.isNumber(a3)) {
                let p = new Point(a1)
                Object.seal(Object.assign(this, { originPoint: p, width: a2, height: a3 }))
                return this
            }
            if (util.type.isSize(a2)) {
                let p = new Point(a1),
                    [w, h] = a2
                Object.seal(Object.assign(this, { originPoint: p, width: w, height: h }))
                return this
            }
        }
        throw new Error(`[G]Arguments can NOT construct a rectangle.`)
    }

    @is("point")
    get originPoint() {
        return this.#originPoint!
    }
    set originPoint(value) {
        this.#originPoint = value
    }
    @is("realNumber")
    get x() {
        return this.#originPoint!.x
    }
    set x(value) {
        this.#originPoint!.x = value
    }
    @is("realNumber")
    get y() {
        return this.#originPoint!.y
    }
    set y(value) {
        this.#originPoint!.y = value
    }
    @is("positiveNumber")
    get width() {
        return this.#width!
    }
    set width(value) {
        this.#width = value
    }
    @is("positiveNumber")
    get height() {
        return this.#height!
    }
    set height(value) {
        this.#height = value
    }
    @is("size")
    get size(): Size {
        return [this.width, this.height]
    }
    set size(value: Size) {
        this.#width = value[0]
        this.#height = value[1]
    }

    static fromPoints(point1: Point, point2: Point) {
        if (point1.isSameAs(point2)) {
            throw new Error(`[G]Diagonal endpoints \`point1\` and \`point2\` of a rectangle can NOT be the same.`)
        }

        let { x: x1, y: y1 } = point1,
            { x: x2, y: y2 } = point2,
            minX = _.min([x1, x2])!,
            minY = _.min([y1, y2])!,
            dx = Math.abs(x1 - x2),
            dy = Math.abs(y1 - y2)
        return new Rectangle([minX, minY], dx, dy)
    }

    getCornerPoint(corner: "leftTop" | "rightTop" | "rightBottom" | "leftBottom"): Point {
        let xRight = this.options.global.xAxisPositiveOnRight,
            yBottom = this.options.global.yAxisPositiveOnBottom,
            { x, y, width: w, height: h } = this,
            lt: Coordinate = [x, y],
            rt: Coordinate = [x + w, y],
            rb: Coordinate = [x + w, y + h],
            lb: Coordinate = [x, y + h]
        if (!xRight) ([lt, rt] = [rt, lt]), ([lb, rb] = [rb, lb])
        if (!yBottom) ([lt, lb] = [lb, lt]), ([rt, rb] = [rb, rt])
        let ret = Point.zero
        if (corner === "leftTop") {
            ret = new Point(lt)
        }
        if (corner === "rightTop") {
            ret = new Point(rt)
        }
        if (corner === "rightBottom") {
            ret = new Point(rb)
        }
        if (corner === "leftBottom") {
            ret = new Point(lb)
        }
        return ret
    }
    getBounding(side: "left" | "right" | "top" | "bottom"): number {
        let xRight = this.options.global.xAxisPositiveOnRight,
            yBottom = this.options.global.yAxisPositiveOnBottom,
            { x, y, width: w, height: h } = this,
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
        this.x += offsetX
        this.y += offsetY
        return this
    }

    inflate(size: Size) {
        return this.clone().inflateSelf(size)
    }
    inflateSelf(size: Size) {
        let { x, y, width: w, height: h } = this,
            [sw, sh] = size,
            nx = x - sw,
            ny = y - sh,
            nw = w + sw * 2,
            nh = h + sw * 2
        if (nw <= 0 || nh <= 0) {
            return this
        }
        this.x = nx
        this.y = ny
        this.width = nw
        this.height = nh
        return this
    }

    clone(withTransformation = true) {
        return new Rectangle(this.x, this.y, this.width, this.height)
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

export default Rectangle
