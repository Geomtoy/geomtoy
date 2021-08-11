import vec2 from "./utility/vec2"
import util from "./utility"
import angle from "./utility/angle"
import math from "./utility/math"

import Point from "./Point"
import Segment from "./Segment"
import { CanvasDirective, GraphicImplType, SvgDirective } from "./types"
import GeomObject from "./base/GeomObject"
import Graphic from "./graphic"
import { is, sameOwner, sealed } from "./decorator"
import Transformation from "./transformation"
import Geomtoy from "."
import coord from "./helper/coordinate"

@sealed
class Vector extends GeomObject {
    #coordinate: [number, number] = [NaN, NaN]
    #point1Coordinate: [number, number] = [NaN, NaN]

    constructor(owner: Geomtoy, x: number, y: number)
    constructor(owner: Geomtoy, point1X: number, point1Y: number, point2X: number, point2Y: number)
    constructor(owner: Geomtoy, coordinate: [number, number])
    constructor(owner: Geomtoy, point1Coordinate: [number, number], point2Coordinate: [number, number])
    constructor(owner: Geomtoy, point: Point)
    constructor(owner: Geomtoy, point1: Point, point2: Point)
    constructor(o: Geomtoy, a1: any, a2?: any, a3?: any, a4?: any) {
        super(o)
        if (util.isNumber(a1) && util.isNumber(a2)) {
            if (util.isNumber(a3) && util.isNumber(a4)) {
                return Object.seal(util.assign(this, { point1X: a1, point1Y: a2, point2X: a3, point2Y: a4 }))
            }
            return Object.seal(util.assign(this, { point1Coordinate: [0, 0], x: a1, y: a2 }))
        }

        if (util.isCoordinate(a1)) {
            if (util.isCoordinate(a2)) {
                return Object.seal(util.assign(this, { point1Coordinate: a1, point2Coordinate: a2 }))
            }
            return Object.seal(util.assign(this, { point1Coordinate: [0, 0], coordinate: a1 }))
        }

        if (a1 instanceof Point) {
            if (a2 instanceof Point) {
                return Object.seal(util.assign(this, { point1: a1, point2: a2 }))
            }
            return Object.seal(util.assign(this, { point1Coordinate: [0, 0], point: a1 }))
        }
        throw new Error("[G]Arguments can NOT construct a `Vector`.")
    }

    @is("realNumber")
    get x() {
        return coord.x(this.#coordinate)
    }
    set x(value) {
        coord.x(this.#coordinate, value)
    }
    @is("realNumber")
    get y() {
        return coord.y(this.#coordinate)
    }
    set y(value) {
        coord.y(this.#coordinate, value)
    }
    @is("coordinate")
    get coordinate() {
        return coord.copy(this.#coordinate)
    }
    set coordinate(value) {
        coord.assign(this.#coordinate, value)
    }
    @sameOwner
    @is("point")
    get point() {
        return new Point(this.owner, this.#coordinate)
    }
    set point(value) {
        coord.assign(this.#coordinate, value.coordinate)
    }
    @is("realNumber")
    get point1X() {
        return coord.x(this.#point1Coordinate)
    }
    set point1X(value) {
        coord.x(this.#point1Coordinate, value)
    }
    @is("realNumber")
    get point1Y() {
        return coord.y(this.#point1Coordinate)
    }
    set point1Y(value) {
        coord.y(this.#point1Coordinate, value)
    }
    @is("coordinate")
    get point1Coordinate() {
        return coord.copy(this.#point1Coordinate)
    }
    set point1Coordinate(value) {
        coord.assign(this.#point1Coordinate, value)
    }
    @sameOwner
    @is("point")
    get point1() {
        return new Point(this.owner, this.#point1Coordinate)
    }
    set point1(value) {
        coord.assign(this.#point1Coordinate, value.coordinate)
    }
    @is("realNumber")
    get point2X() {
        return coord.x(this.#point1Coordinate) + coord.x(this.#coordinate)
    }
    set point2X(value) {
        coord.x(this.#coordinate, value - coord.x(this.#point1Coordinate))
    }
    @is("realNumber")
    get point2Y() {
        return coord.y(this.#point1Coordinate) + coord.y(this.#coordinate)
    }
    set point2Y(value) {
        coord.y(this.#coordinate, value - coord.y(this.#point1Coordinate))
    }
    @is("coordinate")
    get point2Coordinate() {
        return vec2.add(this.#point1Coordinate, this.#coordinate)
    }
    set point2Coordinate(value) {
        coord.assign(this.#coordinate, vec2.from(this.#point1Coordinate, value))
    }
    @sameOwner
    @is("point")
    get point2() {
        return new Point(this.owner, this.point2Coordinate)
    }
    set point2(value) {
        coord.assign(this.#coordinate, vec2.from(this.#point1Coordinate, value.coordinate))
    }

    /**
     * Get the angle of vector `this`, the result is in the interval `(-Math.PI, Math.PI]`.
     */
    get angle() {
        if (this.isZero()) return NaN
        return vec2.angle(this.coordinate)
    }
    /**
     * Get the magnitude of vector `this`.
     */
    get magnitude(): number {
        if (this.isZero()) return 0
        return vec2.magnitude(this.coordinate)
    }

    static zero(owner: Geomtoy) {
        return new Vector(owner, 0, 0)
    }

    static fromPoint(owner: Geomtoy, point: Point): Vector {
        return new Vector(owner, point)
    }
    static fromPoints(owner: Geomtoy, point1: Point, point2: Point): Vector {
        return new Vector(owner, point1, point2)
    }

    static fromAngleAndMagnitude(owner: Geomtoy, angle: number, magnitude: number): Vector {
        let x = magnitude * Math.cos(angle),
            y = magnitude * Math.sin(angle)
        return new Vector(owner, x, y)
    }
    static fromSegment(owner: Geomtoy, segment: Segment, reverse = false) {
        return reverse ? new Vector(owner, segment.point2, segment.point1) : new Vector(owner, segment.point1, segment.point2)
    }

    /**
     * Whether vector `this` is `Vector.zero()`
     * @returns {boolean}
     */
    isZero(): boolean {
        let { x, y } = this,
            epsilon = this.owner.getOptions().epsilon
        return math.equalTo(x, 0, epsilon) && math.equalTo(y, 0, epsilon)
    }
    /**
     * Whether vector `this` is the same as vector `vector`, if they are all initialized from `Point.zero`
     * @param {Vector} vector
     * @returns {boolean}
     */
    isSameAs(vector: Vector): boolean {
        if (this === vector) return true
        if (this.isZero() && vector.isZero()) return true
        let epsilon = this.owner.getOptions().epsilon
        return coord.isSameAs(this.coordinate, vector.coordinate, epsilon)
    }
    /**
     * Whether vector `this` is the same as vector `vector`, including the initial point
     * @param {Vector} vector
     * @returns {boolean}
     */
    isSameAs2(vector: Vector): boolean {
        if (this === vector) return true
        let epsilon = this.owner.getOptions().epsilon
        return coord.isSameAs(this.point1Coordinate, vector.point1Coordinate, epsilon) && this.isSameAs(vector)
    }
    /**
     * Whether the angle of vector `this` is the same as vector `vector`
     * @param {Vector} vector
     * @returns {boolean}
     */
    isSameAngleAs(vector: Vector): boolean {
        if (this === vector) return true
        if (this.isZero() && vector.isZero()) return true
        let epsilon = this.owner.getOptions().epsilon
        return math.equalTo(this.angle, vector.angle, epsilon)
    }
    isSameMagnitudeAs(vector: Vector) {
        if (this === vector) return true
        if (this.isZero() && vector.isZero()) return true
        let epsilon = this.owner.getOptions().epsilon
        return math.equalTo(this.magnitude, vector.magnitude, epsilon)
    }

    /**
     * Angle from vector `this` to vector `vector`, in the interval `(-Math.PI, Math.PI]`
     * @param {Vector} vector
     * @returns {number}
     */
    angleTo(vector: Vector): number {
        return angle.simplify2(this.angle - vector.angle)
    }

    /**
     * `向量this`到`向量v`的角差（另一种实现），记作theta，`(-Math.PI, Math.PI]`
     * @param {Vector} v
     * @returns {number}
     */
    #angleToAnotherImpl(vector: Vector): number {
        if (this.isZero() || vector.isZero()) return NaN
        let dotProduct = this.dotProduct(vector),
            crossProduct = this.crossProduct(vector),
            cosTheta = dotProduct / (this.magnitude * vector.magnitude),
            a = Math.acos(cosTheta) //Math.acos，[0, Math.PI]

        //点乘与夹角范围：
        //dp>0      投影为正，夹角[0, Math.PI/2)
        //dp==0     投影为0，夹角为Math.PI/2，正交
        //dp<0      投影为负，夹角(Math.PI/2,Math.PI]

        //利用叉乘来确定符号，注意叉乘参数有顺序之别
        //cp>0      法向量大于0，`向量this`到`向量v`的正旋角 (0, Math.PI)
        //cp==0     法向量为0，`向量this`到`向量v`的正旋角 0或Math.PI
        //cp<0      法向量小于0，`向量this`到`向量v`的正旋角 (Math.PI, 2*Math.PI)
        if (crossProduct < 0) a = -a //此处已经是正旋角，无论正旋角定义为顺时针还是逆时针都一样
        return angle.simplify2(a)
    }

    simplify() {
        return this.clone().simplifySelf()
    }
    simplifySelf() {
        this.point1Coordinate = [0, 0]
    }

    dotProduct(vector: Vector): number {
        return vec2.dot(this.coordinate, vector.coordinate)
    }
    crossProduct(vector: Vector): number {
        return vec2.cross(this.coordinate, vector.coordinate)
    }
    normalize(): Vector {
        return new Vector(this.owner, vec2.normalize(this.coordinate))
    }
    add(vector: Vector): Vector {
        return new Vector(this.owner, vec2.add(this.coordinate, vector.coordinate))
    }
    subtract(vector: Vector): Vector {
        return new Vector(this.owner, vec2.subtract(this.coordinate, vector.coordinate))
    }
    scalarMultiply(scalar: number): Vector {
        return new Vector(this.owner, vec2.scalarMultiply(this.coordinate, scalar))
    }
    negative() {
        return new Vector(this.owner, vec2.negative(this.coordinate))
    }
    rotate(angle: number): Vector {
        return new Vector(this.owner, vec2.rotate(this.coordinate, angle))
    }
    clone() {
        return new Vector(this.owner, this.point1Coordinate, this.coordinate)
    }
    apply(transformation: Transformation) {
        let c = transformation.get().transformCoordinate(this.coordinate)
        return new Vector(this.owner, this.point1Coordinate, c)
    }

    //todo
    /**
     * Get graphic object of `this`
     * @param {GraphicImplType} type
     * @returns {Array<SvgDirective | CanvasDirective>}
     */
    getGraphic(type: GraphicImplType): Array<SvgDirective | CanvasDirective> {
        let [x1, y1] = this.point1Coordinate,
            [x2, y2] = this.point2Coordinate,
            g = new Graphic()

        g.moveTo(x1, y1)
        g.lineTo(x2, y2)
        // g.centerArcTo(x, y, Vector.options.graphic.pointSize, Vector.options.graphic.pointSize, 0, 2 * Math.PI, 0)
        // g.close()
        return g.valueOf(type)
    }
    toArray() {
        return []
    }
    toObject() {
        return {}
    }
    toString() {
        return ""
    }
}


/**
 * 
 * @category GeomObject
 */
export default Vector
