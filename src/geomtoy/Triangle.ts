import util from "./utility"

import Point from "./Point"
import Circle from "./Circle"
import GeomObject from "./base/GeomObject"
import { Direction, GraphicsCommand } from "./types"
import Transformation from "./transformation"

import { assertIsCoordinate, assertIsPoint, assertIsRealNumber, sealed, validAndWithSameOwner } from "./decorator"
import Geomtoy from "."
import coord from "./utility/coordinate"
import vec2 from "./utility/vec2"
import { AreaMeasurable, Visible } from "./interfaces"
import math from "./utility/math"
import Line from "./Line"
import { Cartesian, Trilinear } from "./helper/CoordinateSystem"
import Graphics from "./graphics"
import Polygon from "./Polygon"
import Segment from "./Segment"

@sealed
@validAndWithSameOwner
class Triangle extends GeomObject implements AreaMeasurable, Visible {
    #point1Coordinate: [number, number] = [NaN, NaN]
    #point2Coordinate: [number, number] = [NaN, NaN]
    #point3Coordinate: [number, number] = [NaN, NaN]

    constructor(owner: Geomtoy, point1X: number, point1Y: number, point2X: number, point2Y: number, point3X: number, point3Y: number)
    constructor(owner: Geomtoy, point1Coordinate: [number, number], point2Coordinate: [number, number], point3Coordinate: [number, number])
    constructor(owner: Geomtoy, point1: Point, point2: Point, point3: Point)
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any, a6?: any) {
        super(o)
        if (util.isNumber(a1)) {
            Object.assign(this, { point1X: a1, point1Y: a2, point2X: a3, point2Y: a4, point3X: a5, point3Y: a6 })
        }
        if (util.isArray(a1)) {
            Object.assign(this, { point1Coordinate: a1, point2Coordinate: a2, point3Coordinate: a3 })
        }
        if (a1 instanceof Point) {
            Object.assign(this, { point1: a1, point2: a2, point3: a3 })
        }
        return Object.seal(this)
    }

    get point1X() {
        return coord.x(this.#point1Coordinate)
    }
    set point1X(value) {
        assertIsRealNumber(value, "point1X")
        coord.x(this.#point1Coordinate, value)
    }
    get point1Y() {
        return coord.y(this.#point1Coordinate)
    }
    set point1Y(value) {
        assertIsRealNumber(value, "point1Y")
        coord.y(this.#point1Coordinate, value)
    }
    get point1Coordinate() {
        return coord.copy(this.#point1Coordinate)
    }
    set point1Coordinate(value) {
        assertIsCoordinate(value, "point1Coordinate")
        coord.assign(this.#point1Coordinate, value)
    }
    get point1() {
        return new Point(this.owner, this.#point1Coordinate)
    }
    set point1(value) {
        assertIsPoint(value, "point1")
        coord.assign(this.#point1Coordinate, value.coordinate)
    }
    get point2X() {
        return coord.x(this.#point2Coordinate)
    }
    set point2X(value) {
        assertIsRealNumber(value, "point2X")
        coord.x(this.#point2Coordinate, value)
    }
    get point2Y() {
        return coord.y(this.#point2Coordinate)
    }
    set point2Y(value) {
        assertIsRealNumber(value, "point2Y")
        coord.y(this.#point2Coordinate, value)
    }
    get point2Coordinate() {
        return coord.copy(this.#point2Coordinate)
    }
    set point2Coordinate(value) {
        assertIsCoordinate(value, "point2Coordinate")
        coord.assign(this.#point2Coordinate, value)
    }
    get point2() {
        return new Point(this.owner, this.#point2Coordinate)
    }
    set point2(value) {
        assertIsPoint(value, "point2")
        coord.assign(this.#point2Coordinate, value.coordinate)
    }
    get point3X() {
        return coord.x(this.#point3Coordinate)
    }
    set point3X(value) {
        assertIsRealNumber(value, "point3X")
        coord.x(this.#point3Coordinate, value)
    }
    get point3Y() {
        return coord.y(this.#point3Coordinate)
    }
    set point3Y(value) {
        assertIsRealNumber(value, "point3Y")
        coord.y(this.#point3Coordinate, value)
    }
    get point3Coordinate() {
        return coord.copy(this.#point3Coordinate)
    }
    set point3Coordinate(value) {
        assertIsCoordinate(value, "point3Coordinate")
        coord.assign(this.#point3Coordinate, value)
    }
    get point3() {
        return new Point(this.owner, this.#point3Coordinate)
    }
    set point3(value) {
        assertIsPoint(value, "point3")
        coord.assign(this.#point3Coordinate, value.coordinate)
    }

    get coordinates(): [[number, number], [number, number], [number, number]] {
        return [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate]
    }
    /**
     * Get the length of the opposite side of `point1` which is segment from `point2` to `point3`.
     */
    get side1Length() {
        return vec2.magnitude(vec2.from(this.point2Coordinate, this.point3Coordinate))
    }
    /**
     * Get the length of the opposite side of `point2` which is segment from `point3` to `point1`.
     */
    get side2Length() {
        return vec2.magnitude(vec2.from(this.point3Coordinate, this.point1Coordinate))
    }
    /**
     * Get the length of the opposite side of `point3` which is segment from `point1` to `point2`.
     */
    get side3Length() {
        return vec2.magnitude(vec2.from(this.point1Coordinate, this.point2Coordinate))
    }
    /**
     * Get the `angle1` at `point1`.
     */
    get angle1() {
        let { point1Coordinate: c1, point2Coordinate: c2, point3Coordinate: c3 } = this
        return math.abs(vec2.angleTo(vec2.from(c1, c2), vec2.from(c1, c3)))
    }
    /**
     * Get the `angle2` at `point2`.
     */
    get angle2() {
        let { point1Coordinate: c1, point2Coordinate: c2, point3Coordinate: c3 } = this
        return math.abs(vec2.angleTo(vec2.from(c2, c3), vec2.from(c2, c1)))
    }
    /**
     * Get the `angle3` at `point3`.
     */
    get angle3() {
        let { point1Coordinate: c1, point2Coordinate: c2, point3Coordinate: c3 } = this
        return math.abs(vec2.angleTo(vec2.from(c3, c1), vec2.from(c3, c2)))
    }

    static formingCondition = "The three vertices of a `Triangle` should not be collinear, or the sum of the length of any two sides is greater than the third side."

    isValid() {
        let c1 = this.#point1Coordinate,
            c2 = this.#point2Coordinate,
            c3 = this.#point3Coordinate,
            epsilon = this.owner.getOptions().epsilon,
            valid = true
        valid &&= coord.isValid(c1)
        valid &&= coord.isValid(c2)
        valid &&= coord.isValid(c3)
        // Do NOT use vector cross judgment, area judgment, lying on the same line judgment etc.
        // None of these methods can guarantee that if triangle `this` is judged to be valid, its sub segment can all be valid.
        valid &&= !coord.isSameAs(c1, c2, epsilon) && !coord.isSameAs(c2, c3, epsilon) && !coord.isSameAs(c3, c1, epsilon)
        valid &&= math.greaterThan(vec2.magnitude(vec2.from(c1, c2)) + vec2.magnitude(vec2.from(c2, c3)), vec2.magnitude(vec2.from(c3, c1)), epsilon)
        return valid
    }
    /**
     * Get the winding direction of vertices of triangle `this`.
     */
    getWindingDirection(): Direction {
        let { point1Coordinate: c1, point2Coordinate: c2, point3Coordinate: c3 } = this,
            cp = vec2.cross(vec2.from(c1, c2), vec2.from(c1, c3))
        if (cp < 0) {
            return "negative"
        }
        return "positive"
    }

    static equilateralTriangleFromSegment(owner: Geomtoy, segment: Segment, positive = true) {
        let c1 = segment.point1Coordinate,
            c2 = segment.point2Coordinate,
            v3 = vec2.rotate(vec2.from(c1, c2), positive ? Math.PI / 3 : -Math.PI / 3),
            c3 = vec2.add(c1, v3)
        return new Triangle(owner, c1, c2, c3)
    }
    static fromThreeIntersectedLines(owner: Geomtoy, lines: Line[]) {}

    /**
     * Whether the three vertices of triangle `this` is the same as triangle `triangle` ignoring the order of the vertices.
     * @param triangle
     */
    isSameAs(triangle: Triangle) {
        let epsilon = this.owner.getOptions().epsilon,
            [ac1, ac2, ac3] = coord.sort([this.point1Coordinate, this.point2Coordinate, this.point3Coordinate]),
            [bc1, bc2, bc3] = coord.sort([triangle.point1Coordinate, triangle.point2Coordinate, triangle.point3Coordinate])
        return coord.isSameAs(ac1, bc1, epsilon) && coord.isSameAs(ac2, bc2, epsilon) && coord.isSameAs(ac3, bc3, epsilon)
    }
    /**
     * Whether the three vertices of triangle `this` is the same as triangle `triangle` considering the order of vertices.
     * @param triangle
     */
    isSameAs2(triangle: Triangle) {
        let epsilon = this.owner.getOptions().epsilon
        return (
            coord.isSameAs(this.point1Coordinate, triangle.point1Coordinate, epsilon) &&
            coord.isSameAs(this.point2Coordinate, triangle.point2Coordinate, epsilon) &&
            coord.isSameAs(this.point3Coordinate, triangle.point3Coordinate, epsilon)
        )
    }

    /**
     * Get the sides as segments of triangle `this`.
     */
    getSideSegments(): [Segment, Segment, Segment] {
        return [
            new Segment(this.owner, this.point2Coordinate, this.point3Coordinate),
            new Segment(this.owner, this.point3Coordinate, this.point1Coordinate),
            new Segment(this.owner, this.point1Coordinate, this.point2Coordinate)
        ]
    }
    /**
     * Get the altitudes as segments of triangle `this`.
     */
    getAltitudeSegments(): [Segment, Segment, Segment] {
        let { point1Coordinate: c1, point2Coordinate: c2, point3Coordinate: c3 } = this,
            c1p = vec2.add(c2, vec2.project(vec2.from(c2, c1), vec2.from(c2, c3))),
            c2p = vec2.add(c3, vec2.project(vec2.from(c3, c2), vec2.from(c3, c1))),
            c3p = vec2.add(c1, vec2.project(vec2.from(c1, c3), vec2.from(c1, c2)))
        return [new Segment(this.owner, c1, c1p), new Segment(this.owner, c2, c2p), new Segment(this.owner, c3, c3p)]
    }
    /**
     * Get the medians as segments of triangle `this`.
     */
    getMedianSegments(): [Segment, Segment, Segment] {
        let { point1Coordinate: c1, point2Coordinate: c2, point3Coordinate: c3 } = this,
            c1p = vec2.add(vec2.scalarMultiply(c2, 1 / 2), vec2.scalarMultiply(c3, 1 / 2)),
            c2p = vec2.add(vec2.scalarMultiply(c3, 1 / 2), vec2.scalarMultiply(c1, 1 / 2)),
            c3p = vec2.add(vec2.scalarMultiply(c1, 1 / 2), vec2.scalarMultiply(c2, 1 / 2))
        return [new Segment(this.owner, c1, c1p), new Segment(this.owner, c2, c2p), new Segment(this.owner, c3, c3p)]
    }
    /**
     * Get the symmedians as segments of triangle `this`.
     */
    getSymmedianSegments() {
        let ls = [this.side1Length, this.side2Length, this.side3Length],
            cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate]
        return util.map(util.range(0, 3), i => {
            let c0 = cs[i],
                c1 = cs[(i + 1) % 3],
                c2 = cs[(i + 2) % 3],
                ls1 = ls[(i + 1) % 3],
                ls2 = ls[(i + 2) % 3],
                ratio = ls2 ** 2 / (ls1 ** 2 + ls2 ** 2),
                c0p = vec2.add(c1, vec2.scalarMultiply(vec2.from(c1, c2), ratio))
            return new Segment(this.owner, c0, c0p)
        }) as [Segment, Segment, Segment]
    }
    /**
     * Get the angle bisectors as segments of triangle `this`.
     */
    getAngleBisectingSegments(): [Segment, Segment, Segment] {
        let ls = [this.side1Length, this.side2Length, this.side3Length],
            cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate]
        return util.map(util.range(0, 3), i => {
            let c0 = cs[i],
                c1 = cs[(i + 1) % 3],
                c2 = cs[(i + 2) % 3],
                ls1 = ls[(i + 1) % 3],
                ls2 = ls[(i + 2) % 3],
                ratio = ls2 / (ls1 + ls2),
                c0p = vec2.add(c1, vec2.scalarMultiply(vec2.from(c1, c2), ratio))
            return new Segment(this.owner, c0, c0p)
        }) as [Segment, Segment, Segment]
    }
    /**
     * Get the perpendicular bisectors as segments of triangle `this`.
     */
    getPerpendicularlyBisectingSegments(): [Segment, Segment, Segment] {
        let cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate]
        return util.map(util.range(0, 3), i => {
            let c0 = cs[i],
                c1 = cs[(i + 1) % 3],
                c2 = cs[(i + 2) % 3],
                v0 = vec2.from(c1, c2),
                v1 = vec2.from(c1, c0),
                v2 = vec2.from(c2, c0),
                d0 = vec2.dot(v0, v0),
                d1 = vec2.dot(v1, v0),
                d2 = vec2.dot(v2, vec2.negative(v0)),
                m0 = vec2.add(vec2.scalarMultiply(c1, 1 / 2), vec2.scalarMultiply(c2, 1 / 2)),
                m0p
            if (d1 >= d0 / 2) {
                let scalar = vec2.squaredMagnitude(v0) / 2 / d1
                m0p = vec2.add(c1, vec2.scalarMultiply(v1, scalar))
            } else {
                let scalar = vec2.squaredMagnitude(v0) / 2 / d2
                m0p = vec2.add(cs[(i + 2) % 3], vec2.scalarMultiply(v2, scalar))
            }
            return new Segment(this.owner, m0, m0p)
        }) as [Segment, Segment, Segment]
    }

    /**
     * Whether triangle `this` is congruent with triangle `triangle`.
     * @param triangle
     */
    isCongruentWithTriangle(triangle: Triangle) {
        let [al1, al2, al3] = util.sort([this.side1Length, this.side2Length, this.side3Length], (a, b) => a - b),
            [bl1, bl2, bl3] = util.sort([triangle.side1Length, triangle.side2Length, triangle.side3Length], (a, b) => a - b),
            epsilon = this.owner.getOptions().epsilon
        return math.equalTo(al1, bl1, epsilon) && math.equalTo(al2, bl2, epsilon) && math.equalTo(al3, bl3, epsilon)
    }
    /**
     * Whether triangle `this` is similar with triangle `triangle`.
     * @param triangle
     */
    isSimilarWithTriangle(triangle: Triangle) {
        let [aa1, aa2, aa3] = util.sort([this.angle1, this.angle2, this.angle3], (a, b) => a - b),
            [ba1, ba2, ba3] = util.sort([triangle.angle1, triangle.angle2, triangle.angle3], (a, b) => a - b),
            epsilon = this.owner.getOptions().epsilon
        return math.equalTo(aa1, ba1, epsilon) && math.equalTo(aa2, ba2, epsilon) && math.equalTo(aa3, ba3, epsilon)
    }
    /**
     * Get the similarity ratio of triangles `this` and `triangle`.
     * @description
     * If triangle `this` is not similar with triangle `triangle`, return NaN, otherwise return the similarity ratio `this` over `triangle`.
     * @param triangle
     */
    getSimilarityRatioWithTriangle(triangle: Triangle) {
        if (!this.isSimilarWithTriangle(triangle)) return NaN
        return this.getPerimeter() / triangle.getPerimeter()
    }

    /**
     * Whether triangle `this` is an acute triangle.
     */
    isAcuteTriangle() {
        let [a, b, c] = util.sort([this.side1Length, this.side2Length, this.side3Length], (a, b) => a - b),
            epsilon = this.owner.getOptions().epsilon
        return math.greaterThan(a ** 2 + b ** 2, c ** 2, epsilon)
    }
    /**
     * Whether triangle `this` is a right triangle.
     */
    isRightTriangle() {
        let [a, b, c] = util.sort([this.side1Length, this.side2Length, this.side3Length], (a, b) => a - b),
            epsilon = this.owner.getOptions().epsilon
        return math.equalTo(a ** 2 + b ** 2, c ** 2, epsilon)
    }
    /**
     * Whether triangle `this` is an obtuse triangle.
     */
    isObtuseTriangle() {
        let [a, b, c] = util.sort([this.side1Length, this.side2Length, this.side3Length], (a, b) => a - b),
            epsilon = this.owner.getOptions().epsilon
        return math.lessThan(a ** 2 + b ** 2, c ** 2, epsilon)
    }
    /**
     * Whether triangle `this` is a scalene triangle(a triangle with no congruent sides).
     */
    isScaleneTriangle() {
        let epsilon = this.owner.getOptions().epsilon
        return !math.equalTo(this.side1Length, this.side2Length, epsilon) && !math.equalTo(this.side1Length, this.side3Length, epsilon)
    }
    /**
     * Whether triangle `this` is an isosceles triangle(a triangle with at least two congruent sides).
     */
    isIsoscelesTriangle() {
        let epsilon = this.owner.getOptions().epsilon
        return (
            math.equalTo(this.side1Length, this.side2Length, epsilon) ||
            math.equalTo(this.side1Length, this.side3Length, epsilon) ||
            math.equalTo(this.side2Length, this.side3Length, epsilon)
        )
    }
    /**
     * Whether triangle `this` is an equilateral triangle(a triangle with three congruent sides).
     */
    isEquilateralTriangle() {
        let epsilon = this.owner.getOptions().epsilon
        return math.equalTo(this.side1Length, this.side2Length, epsilon) && math.equalTo(this.side1Length, this.side3Length, epsilon)
    }
    /**
     * Get perimeter of triangle `this`.
     */
    getPerimeter() {
        return this.side1Length + this.side2Length + this.side3Length
    }
    /**
     * Get area of triangle `this`.
     */
    getArea() {
        let [x1, y1] = this.point1Coordinate,
            [x2, y2] = this.point2Coordinate,
            [x3, y3] = this.point3Coordinate,
            a = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2) //cross product shorthand
        a = a / 2
        return Math.abs(a)
    }
    asPolygon() {
        return new Polygon(this.owner, [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate])
    }

    // #region using trilinear
    /**
     * Get the point at the `trilinear` coordinate respect to triangle `this`.
     * @param trilinear
     */
    getPointAtTrilinear(trilinear: [number, number, number]) {
        let t = new Trilinear(trilinear[0], trilinear[1], trilinear[2]),
            c = t.toCartesian(this.point1Coordinate, this.point2Coordinate, this.point3Coordinate)
        return new Point(this.owner, c.valueOf())
    }
    /**
     * Get the trilinear coordinate of point `point` respect to triangle `this`.
     * @param point
     */
    getTrilinearOfPoint(point: Point) {
        let c = new Cartesian(...point.coordinate),
            t = c.toTrilinear(this.point1Coordinate, this.point2Coordinate, this.point3Coordinate)
        return t.valueOf()
    }
    /**
     * Whether point `point` is on triangle `this`.
     * @param point
     */
    isPointOnTriangle(point: Point) {
        let t = this.getTrilinearOfPoint(point),
            epsilon = this.owner.getOptions().epsilon
        return math.strictSign(t[0], epsilon) * math.strictSign(t[1], epsilon) * math.strictSign(t[2], epsilon) === 0
    }
    /**
     * Whether point `point` is inside triangle `this`.
     * @param point
     */
    isPointInsideTriangle(point: Point) {
        let t = this.getTrilinearOfPoint(point),
            epsilon = this.owner.getOptions().epsilon
        return math.strictSign(t[0], epsilon) * math.strictSign(t[1], epsilon) * math.strictSign(t[2], epsilon) === 1
    }
    /**
     * Whether point `point` is outside triangle `this`.
     * @param point
     */
    isPointOutsideTriangle(point: Point) {
        let t = this.getTrilinearOfPoint(point),
            epsilon = this.owner.getOptions().epsilon
        return math.strictSign(t[0], epsilon) * math.strictSign(t[1], epsilon) * math.strictSign(t[2], epsilon) === -1
    }
    /**
     * Get the isogonal conjugate point of point `point` respect to triangle `this`.
     * @param point
     */
    getIsogonalConjugatePointOfPoint(point: Point) {
        if (this.isPointOnTriangle(point)) return null
        let t = this.getTrilinearOfPoint(point),
            tp: [number, number, number] = [1 / t[0], 1 / t[1], 1 / t[2]]
        return this.getPointAtTrilinear(tp)
    }
    /**
     * Get the isotomic conjugate point of point `point` respect to triangle `this`.
     * @param point
     */
    getIsotomicConjugatePointOfPoint(point: Point) {
        if (this.isPointOnTriangle(point)) return null
        let t = this.getTrilinearOfPoint(point),
            [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            tp: [number, number, number] = [1 / (a ** 2 * t[0]), 1 / (b ** 2 * t[1]), 1 / (c ** 2 * t[2])]
        return this.getPointAtTrilinear(tp)
    }
    /**
     * Get the centroid point of triangle `this`.
     */
    getCentroidPoint() {
        if (false) {
            let [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
                t: [number, number, number] = [b * c, c * a, a * b]
            return this.getPointAtTrilinear(t)
        } else {
            let [x1, y1] = this.point1Coordinate,
                [x2, y2] = this.point2Coordinate,
                [x3, y3] = this.point3Coordinate,
                x = (x1 + x2 + x3) / 3,
                y = (y1 + y2 + y3) / 3
            return new Point(this.owner, x, y)
        }
    }
    /**
     * Get the medial triangle of triangle `this`.
     */
    getMedialTriangle() {
        let [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            t1 = new Trilinear(0, c * a, a * b),
            t2 = new Trilinear(b * c, 0, a * b),
            t3 = new Trilinear(b * c, c * a, 0),
            cc1 = t1.toCartesian(...this.coordinates),
            cc2 = t2.toCartesian(...this.coordinates),
            cc3 = t3.toCartesian(...this.coordinates)
        return new Triangle(this.owner, cc1.valueOf(), cc2.valueOf(), cc3.valueOf())
    }
    /**
     * Get the antimedial triangle of triangle `this`.
     */
    getAntimedialTriangle() {
        let [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            t1 = new Trilinear(-b * c, c * a, a * b),
            t2 = new Trilinear(b * c, -c * a, a * b),
            t3 = new Trilinear(b * c, c * a, -a * b),
            cc1 = t1.toCartesian(...this.coordinates),
            cc2 = t2.toCartesian(...this.coordinates),
            cc3 = t3.toCartesian(...this.coordinates)
        return new Triangle(this.owner, cc1.valueOf(), cc2.valueOf(), cc3.valueOf())
    }
    /**
     * Get the orthocenter point of triangle `this`.
     */
    getOrthocenterPoint() {
        if (false) {
            let [aa, bb, cc] = [this.angle1, this.angle2, this.angle3],
                t: [number, number, number] = [math.sec(aa), math.sec(bb), math.sec(cc)]
            return this.getPointAtTrilinear(t)
        } else {
            let [x1, y1] = this.point1Coordinate,
                [x2, y2] = this.point2Coordinate,
                [x3, y3] = this.point3Coordinate,
                a1 = x1 - x2,
                a2 = x2 - x3,
                a3 = x3 - x1,
                b1 = y1 - y2,
                b2 = y2 - y3,
                b3 = y3 - y1,
                d = x1 * b2 + x2 * b3 + x3 * b1,
                x = (b1 * b2 * b3 - (x1 * x2 * b1 + x2 * x3 * b2 + x3 * x1 * b3)) / d,
                y = (-a1 * a2 * a3 + (y1 * y2 * a1 + y2 * y3 * a2 + y3 * y1 * a3)) / d
            return new Point(this.owner, x, y)
        }
    }
    /**
     * Get the polar circle of triangle `this`.
     * @description
     * If `this` is not obtuse triangle, return null.
     */
    getPolarCircle(): Circle | null {
        if (!this.isObtuseTriangle()) return null
        let [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            area = this.getArea(),
            r = math.sqrt((a * b * c) ** 2 / (4 * area ** 2) - (a ** 2 + b ** 2 + c ** 2) / 2)
        return new Circle(this.owner, r, this.#getOrthocenterCoordinate())
    }
    /**
     * Get the orthic triangle of triangle `this`.
     * @description
     * - If triangle `this` is right triangle, return null
     * - Else return the orthic triangle.
     */
    getOrthicTriangle() {
        if (this.isRightTriangle()) return null
        let [a1, a2, a3] = [this.angle1, this.angle2, this.angle3],
            t1 = new Trilinear(0, math.sec(a2), math.sec(a3)),
            t2 = new Trilinear(math.sec(a1), 0, math.sec(a3)),
            t3 = new Trilinear(math.sec(a1), math.sec(a2), 0),
            cc1 = t1.toCartesian(...this.coordinates),
            cc2 = t2.toCartesian(...this.coordinates),
            cc3 = t3.toCartesian(...this.coordinates)
        return new Triangle(this.owner, cc1.valueOf(), cc2.valueOf(), cc3.valueOf())
    }
    /**
     * Get the incenter point of triangle `this` using trilinear.
     */
    getIncenterPointAlt() {
        let t: [number, number, number] = [1, 1, 1]
        return this.getPointAtTrilinear(t)
    }
    /**
     * Get the circumcenter point of triangle `this` using trilinear.
     */
    getCircumcenterPointAlt() {
        let [aa, bb, cc] = [this.angle1, this.angle2, this.angle3],
            t: [number, number, number] = [math.cos(aa), math.cos(bb), math.cos(cc)]
        return this.getPointAtTrilinear(t)
    }
    /**
     * Get the escenter points of triangle `this`.
     */
    getEscenterPointsAlt(): [Point, Point, Point] {
        let t1: [number, number, number] = [-1, 1, 1],
            t2: [number, number, number] = [1, -1, 1],
            t3: [number, number, number] = [1, 1, -1]
        return [this.getPointAtTrilinear(t1), this.getPointAtTrilinear(t2), this.getPointAtTrilinear(t3)]
    }
    /**
     * Get the Nine-point circle center point of triangle `this`.
     */
    getNinePointCenterPoint() {
        // Nine-point center = cos(B-C) : cos(C-A) : cos(A-B)
        let t = new Trilinear(math.cos(this.angle2 - this.angle3), math.cos(this.angle3 - this.angle1), math.cos(this.angle1 - this.angle2)),
            cc = t.toCartesian(...this.coordinates)
        return new Point(this.owner, cc.valueOf())
    }
    /**
     * Get the Nine-point circle of triangle `this`.
     */
    getNinePointCircle() {
        let p = this.getNinePointCenterPoint(),
            [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            area = this.getArea(),
            r = (a * b * c) / (8 * area)
        return new Circle(this.owner, r, p)
    }
    /**
     * Get the Nagel point of triangle `this`.
     */
    getNagelPoint() {
        // Nagel = (b+c-a)/a : (c+a-b)/b : (a+b-c)/c = csc^2(A/2) : csc^2(B/2) : csc^2(C/2)
        let [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            d1 = (-a + b + c) / a,
            d2 = (a - b + c) / b,
            d3 = (a + b - c) / c,
            t = new Trilinear(d1, d2, d3),
            cc = t.toCartesian(...this.coordinates)
        return new Point(this.owner, cc.valueOf())
    }
    /**
     * Get the Nagel triangle of triangle `this`.
     */
    getNagelTriangle() {
        let [a1, a2, a3] = [this.angle1, this.angle2, this.angle3],
            d1 = a1 / 2,
            d2 = a2 / 2,
            d3 = a3 / 2,
            t1 = new Trilinear(0, math.csc(d2) ** 2, math.csc(d3) ** 2),
            t2 = new Trilinear(math.csc(d1) ** 2, 0, math.csc(d3) ** 2),
            t3 = new Trilinear(math.csc(d1) ** 2, math.csc(d2) ** 2, 0),
            cc1 = t1.toCartesian(...this.coordinates),
            cc2 = t2.toCartesian(...this.coordinates),
            cc3 = t3.toCartesian(...this.coordinates)
        return new Triangle(this.owner, cc1.valueOf(), cc2.valueOf(), cc3.valueOf())
    }
    /**
     * Get the Gergonne point of triangle `this`.
     */
    getGergonnePoint() {
        let [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            d1 = (b * c) / (-a + b + c),
            d2 = (a * c) / (a - b + c),
            d3 = (a * b) / (a + b - c),
            t = new Trilinear(d1, d2, d3),
            cc = t.toCartesian(...this.coordinates)
        return new Point(this.owner, cc.valueOf())
    }
    /**
     * Get the Gergonne triangle of triangle `this`.
     * @see {@link https://en.wikipedia.org/wiki/Incircle_and_excircles_of_a_triangle#Gergonne_triangle_and_point}
     */
    getGergonneTriangle() {
        let [a1, a2, a3] = [this.angle1, this.angle2, this.angle3],
            d1 = a1 / 2,
            d2 = a2 / 2,
            d3 = a3 / 2,
            t1 = new Trilinear(0, math.sec(d2) ** 2, math.sec(d3) ** 2),
            t2 = new Trilinear(math.sec(d1) ** 2, 0, math.sec(d3) ** 2),
            t3 = new Trilinear(math.sec(d1) ** 2, math.sec(d2) ** 2, 0),
            cc1 = t1.toCartesian(...this.coordinates),
            cc2 = t2.toCartesian(...this.coordinates),
            cc3 = t3.toCartesian(...this.coordinates)
        return new Triangle(this.owner, cc1.valueOf(), cc2.valueOf(), cc3.valueOf())
    }

    getLemoinePoint() {
        // Lemoine = a : b : c = sinA : sinB : sinC
        let [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            t = new Trilinear(a, b, c),
            cc = t.toCartesian(...this.coordinates)
        return new Point(this.owner, cc.valueOf())
    }
    getLemoineLine() {
        return new Line(this.owner, 0, 0, 0)
    }
    /**
     * Get the Feuerbach circle of triangle `this`.
     * @see {@link https://en.wikipedia.org/wiki/Feuerbach_point}
     */
    getFeuerbachPoint() {
        // Feuerbach = 1−cos(B−C) : 1−cos(C−A) : 1−cos(A−B)
        let t = new Trilinear(1 - math.cos(this.angle2 - this.angle3), 1 - math.cos(this.angle3 - this.angle1), 1 - math.cos(this.angle1 - this.angle2)),
            cc = t.toCartesian(...this.coordinates)
        return new Point(this.owner, cc.valueOf())
    }
    /**
     * Get the Feuerbach triangle of triangle `this`.
     * @see {@link https://mathworld.wolfram.com/FeuerbachTriangle.html}
     */
    getFeuerbachTriangle() {
        let [a1, a2, a3] = [this.angle1, this.angle2, this.angle3],
            d1 = (a2 - a3) / 2,
            d2 = (a3 - a1) / 2,
            d3 = (a1 - a2) / 2,
            t1 = new Trilinear(-1 * math.sin(d1) ** 2, math.cos(d2) ** 2, math.cos(d3) ** 2),
            t2 = new Trilinear(math.cos(d1) ** 2, -1 * math.sin(d2) ** 2, math.cos(d3) ** 2),
            t3 = new Trilinear(math.cos(d1) ** 2, math.cos(d2) ** 2, -1 * math.sin(d3) ** 2),
            cc1 = t1.toCartesian(...this.coordinates),
            cc2 = t2.toCartesian(...this.coordinates),
            cc3 = t3.toCartesian(...this.coordinates)
        return new Triangle(this.owner, cc1.valueOf(), cc2.valueOf(), cc3.valueOf())
    }

    /**
     * Get the first Fermat point of triangle `this`.
     * @see {@link https://en.wikipedia.org/wiki/Fermat_point}
     */
    getFirstFermatPoint() {
        // Fermat1 = csc(A+PI/3) : csc(B+PI/3) : csc(C+PI/3)
        let t = new Trilinear(math.csc(this.angle1 + Math.PI / 3), math.csc(this.angle2 + Math.PI / 3), math.csc(this.angle3 + Math.PI / 3)),
            cc = t.toCartesian(...this.coordinates)
        return new Point(this.owner, cc.valueOf())
    }
    /**
     * Get the second Fermat point of triangle `this`.
     * @see {@link https://en.wikipedia.org/wiki/Fermat_point}
     */
    getSecondFermatPoint() {
        // Fermat2 = csc(A-PI/3) : csc(B-PI/3) : csc(C-PI/3)
        let t = new Trilinear(math.csc(this.angle1 - Math.PI / 3), math.csc(this.angle2 - Math.PI / 3), math.csc(this.angle3 - Math.PI / 3)),
            cc = t.toCartesian(...this.coordinates)
        return new Point(this.owner, cc.valueOf())
    }
    /**
     * Get the first isodynamic point of triangle `this`
     * @description
     * If triangle is an equilateral triangle, return null, otherwise return the first isodynamic point.
     * @see {@link https://en.wikipedia.org/wiki/Isodynamic_point}
     */
    getFirstIsodynamicPoint() {
        // isodynamic1 = sin(A+PI/3) : sin(B+PI/3) : sin(C+PI/3)
        if (this.isEquilateralTriangle()) return null
        let t = new Trilinear(math.sin(this.angle1 + Math.PI / 3), math.sin(this.angle2 + Math.PI / 3), math.sin(this.angle3 + Math.PI / 3)),
            cc = t.toCartesian(...this.coordinates)
        return new Point(this.owner, cc.valueOf())
    }
    /**
     * Get the second isodynamic point of triangle `this`
     * @description
     * If triangle is an equilateral triangle, return null, otherwise return the second isodynamic point.
     * @see {@link https://en.wikipedia.org/wiki/Isodynamic_point}
     */
    getSecondIsodynamicPoint() {
        // isodynamic2 = sin(A-PI/3) : sin(B-PI/3) : sin(C-PI/3)
        if (this.isEquilateralTriangle()) return null
        let t = new Trilinear(math.sin(this.angle1 - Math.PI / 3), math.sin(this.angle2 - Math.PI / 3), math.sin(this.angle3 - Math.PI / 3)),
            cc = t.toCartesian(...this.coordinates)
        return new Point(this.owner, cc.valueOf())
    }

    /**
     * @see {@link https://mathworld.wolfram.com/EulerPoints.html}
     */
    getEulerPoints(): [Point, Point, Point] {
        let [hx, hy] = this.#getOrthocenterCoordinate(),
            [x1, y1] = this.point1Coordinate,
            [x2, y2] = this.point2Coordinate,
            [x3, y3] = this.point3Coordinate,
            e1: [number, number] = [(hx + x1) / 2, (hy + y1) / 2],
            e2: [number, number] = [(hx + x2) / 2, (hy + y2) / 2],
            e3: [number, number] = [(hx + x3) / 2, (hy + y3) / 2]
        return [new Point(this.owner, e1), new Point(this.owner, e2), new Point(this.owner, e3)]
    }
    /**
     * @see {@link https://mathworld.wolfram.com/EulerTriangle.html}
     */
    getEulerTriangle() {}

    /**
     * Get the Lemoine Line
     * @see {@link https://mathworld.wolfram.com/LemoineAxis.html}
     */

    /**
     * Get Euler line of triangle `this`
     * @see {@link https://en.wikipedia.org/wiki/Euler_line}
     */
    getEulerLine() {
        if (this.isEquilateralTriangle()) return null
        let c1 = this.#getCircumcenterCoordinate(),
            c2 = this.#getOrthocenterCoordinate()
        return Line.fromTwoCoordinates(this.owner, c1, c2)
    }

    // #endregion

    /**
     * Get the tangential triangle of triangle `this`.
     * @see {@link https://en.wikipedia.org/wiki/Tangential_triangle}
     */
    getTangentialTriangle() {
        let [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            t1 = new Trilinear(-a, b, c),
            t2 = new Trilinear(a, -b, c),
            t3 = new Trilinear(a, b, -c),
            cc1 = t1.toCartesian(...this.coordinates),
            cc2 = t2.toCartesian(...this.coordinates),
            cc3 = t3.toCartesian(...this.coordinates)
        return new Triangle(this.owner, cc1.valueOf(), cc2.valueOf(), cc3.valueOf())
    }

    /**
     * @see {@link https://en.wikipedia.org/wiki/Incircle_and_excircles_of_a_triangle  Gergonne triangle}
     */
    getIntouchTriangle() {}
    /**
     * @see {@link https://en.wikipedia.org/wiki/Extouch_triangle}
     */
    getExtouchTriangle() {}
    getIncentralTriangle() {}

    #getOrthocenterCoordinate(): [number, number] {
        let [x1, y1] = this.point1Coordinate,
            [x2, y2] = this.point2Coordinate,
            [x3, y3] = this.point3Coordinate,
            a1 = x1 - x2,
            a2 = x2 - x3,
            a3 = x3 - x1,
            b1 = y1 - y2,
            b2 = y2 - y3,
            b3 = y3 - y1,
            d = x1 * b2 + x2 * b3 + x3 * b1,
            x = (b1 * b2 * b3 - (x1 * x2 * b1 + x2 * x3 * b2 + x3 * x1 * b3)) / d,
            y = (-a1 * a2 * a3 + (y1 * y2 * a1 + y2 * y3 * a2 + y3 * y1 * a3)) / d
        return [x, y]
    }

    #getIncenterCoordinate(): [number, number] {
        let [x1, y1] = this.point1Coordinate,
            [x2, y2] = this.point2Coordinate,
            [x3, y3] = this.point3Coordinate,
            [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            d = a + b + c, // this.getPerimeter()
            x = (a * x1 + b * x2 + c * x3) / d,
            y = (a * y1 + b * y2 + c * y3) / d
        return [x, y]
    }
    /**
     * Get the incenter point of triangle `this`.
     */
    getIncenterPoint() {
        return new Point(this.owner, this.#getIncenterCoordinate())
    }
    /**
     * Get the inscribed circle of triangle `this`.
     */
    getInscribedCircle() {
        let s = this.getArea(),
            d = this.getPerimeter(),
            r = (2 * s) / d
        return new Circle(this.owner, r, this.#getIncenterCoordinate())
    }

    #getCircumcenterCoordinate(): [number, number] {
        let [x1, y1] = this.point1Coordinate,
            [x2, y2] = this.point2Coordinate,
            [x3, y3] = this.point3Coordinate,
            a1 = 2 * (x2 - x1),
            b1 = 2 * (y2 - y1),
            c1 = x2 ** 2 + y2 ** 2 - (x1 ** 2 + y1 ** 2),
            a2 = 2 * (x3 - x2),
            b2 = 2 * (y3 - y2),
            c2 = x3 ** 2 + y3 ** 2 - (x2 ** 2 + y2 ** 2),
            d = a1 * b2 - a2 * b1,
            x = (c1 * b2 - c2 * b1) / d,
            y = (c2 * a1 - c1 * a2) / d
        return [x, y]
    }
    /**
     * Get the circumcenter point of triangle `this`.
     */
    getCircumcenterPoint() {
        return new Point(this.owner, this.#getCircumcenterCoordinate())
    }
    /**
     * Get the circumscribed circle of triangle `this`.
     */
    getCircumscribedCircle() {
        let [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            area = this.getArea(),
            r = (a * b * c) / (4 * area)
        return new Circle(this.owner, r, this.#getCircumcenterCoordinate())
    }

    #getEscenterCoordinates(): [[number, number], [number, number], [number, number]] {
        let [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            [x1, y1] = this.point1Coordinate,
            [x2, y2] = this.point2Coordinate,
            [x3, y3] = this.point3Coordinate,
            ead = -a + b + c,
            ea: [number, number] = [(-a * x1 + b * x2 + c * x3) / ead, (-a * y1 + b * y2 + c * y3) / ead],
            ebd = a - b + c,
            eb: [number, number] = [(a * x1 - b * x2 + c * x3) / ebd, (a * y1 - b * y2 + c * y3) / ebd],
            ecd = a + b - c,
            ec: [number, number] = [(a * x1 + b * x2 - c * x3) / ecd, (a * y1 + b * y2 - c * y3) / ecd]
        return [ea, eb, ec]
    }
    /**
     * Get the escenter points of triangle `this`.
     */
    getEscenterPoints(): [Point, Point, Point] {
        let [ea, eb, ec] = this.#getEscenterCoordinates()
        return [new Point(this.owner, ea), new Point(this.owner, eb), new Point(this.owner, ec)]
    }

    getEscribedCircleRadii() {
        let s = this.getArea(),
            p = this.getPerimeter() / 2,
            [a, b, c] = [this.side1Length, this.side2Length, this.side3Length]
        return [s / (p - a), s / (p - b), s / (p - c)]
    }

    /**
     * Get the escribed circles of triangle `this`.
     */
    getEscribedCircles(): [Circle, Circle, Circle] {
        let [ea, eb, ec] = this.#getEscenterCoordinates(),
            area = this.getArea(),
            [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            ead = -a + b + c,
            ebd = a - b + c,
            ecd = a + b - c,
            ra = (2 * area) / ead,
            rb = (2 * area) / ebd,
            rc = (2 * area) / ecd
        return [new Circle(this.owner, ra, ea), new Circle(this.owner, rb, eb), new Circle(this.owner, rc, ec)]
    }

    apply(transformation: Transformation): GeomObject {
        throw new Error("Method not implemented.")
    }
    getGraphics(): GraphicsCommand[] {
        const g = new Graphics()
        const { point1Coordinate: c1, point2Coordinate: c2, point3Coordinate: c3 } = this
        g.moveTo(...c1)
        g.lineTo(...c2)
        g.lineTo(...c3)
        g.close()
        return g.commands
    }
    clone() {
        return new Triangle(this.owner, this.point1Coordinate, this.point2Coordinate, this.point3Coordinate)
    }
    toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\tpoint1Coordinate: ${coord.toString(this.point1Coordinate)}`,
            `\tpoint2Coordinate: ${coord.toString(this.point2Coordinate)}`,
            `\tpoint3Coordinate: ${coord.toString(this.point3Coordinate)}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n")
    }
    toArray() {
        return [coord.copy(this.point1Coordinate), coord.copy(this.point2Coordinate), coord.copy(this.point3Coordinate)]
    }
    toObject() {
        return {
            point1Coordinate: coord.copy(this.point1Coordinate),
            point2Coordinate: coord.copy(this.point2Coordinate),
            point3Coordinate: coord.copy(this.point3Coordinate)
        }
    }
}

/**
 *
 * @category GeomObject
 */
export default Triangle
