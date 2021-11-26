import { validAndWithSameOwner } from "../../decorator"
import assert from "../../utility/assertion"
import util from "../../utility"
import coord from "../../utility/coordinate"
import math from "../../utility/math"
import vec2 from "../../utility/vec2"
import coordArray from "../../utility/coordinateArray"

import { Cartesian, Trilinear } from "../../helper/CoordinateSystem"

import Shape from "../../base/Shape"
import Point from "./Point"
import Circle from "./Circle"
import LineSegment from "./LineSegment"
import Line from "./Line"
import Polygon from "../advanced/Polygon"

import Graphics from "../../graphics"

import type Geomtoy from "../.."
import type Transformation from "../../transformation"
import type { Direction, ClosedShape, TransformableShape } from "../../types"

class Triangle extends Shape implements ClosedShape, TransformableShape {
    private _point1Coordinate: [number, number] = [NaN, NaN]
    private _point2Coordinate: [number, number] = [NaN, NaN]
    private _point3Coordinate: [number, number] = [NaN, NaN]

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

    static readonly events = Object.freeze({
        point1XChanged: "point1XChanged",
        point1YChanged: "point1YChanged",
        point2XChanged: "point2XChanged",
        point2YChanged: "point2YChanged",
        point3XChanged: "point3XChanged",
        point3YChanged: "point3YChanged"
    })

    private _setPoint1X(value: number) {
        this.willTrigger_(coord.x(this._point1Coordinate), value, [Triangle.events.point1XChanged])
        coord.x(this._point1Coordinate, value)
    }
    private _setPoint1Y(value: number) {
        this.willTrigger_(coord.y(this._point1Coordinate), value, [Triangle.events.point1YChanged])
        coord.y(this._point1Coordinate, value)
    }
    private _setPoint2X(value: number) {
        this.willTrigger_(coord.x(this._point2Coordinate), value, [Triangle.events.point2XChanged])
        coord.x(this._point2Coordinate, value)
    }
    private _setPoint2Y(value: number) {
        this.willTrigger_(coord.y(this._point2Coordinate), value, [Triangle.events.point2YChanged])
        coord.y(this._point2Coordinate, value)
    }
    private _setPoint3X(value: number) {
        this.willTrigger_(coord.x(this._point3Coordinate), value, [Triangle.events.point3XChanged])
        coord.x(this._point3Coordinate, value)
    }
    private _setPoint3Y(value: number) {
        this.willTrigger_(coord.y(this._point3Coordinate), value, [Triangle.events.point3YChanged])
        coord.y(this._point3Coordinate, value)
    }

    get point1X() {
        return coord.x(this._point1Coordinate)
    }
    set point1X(value) {
        assert.isRealNumber(value, "point1X")
        this._setPoint1X(value)
    }
    get point1Y() {
        return coord.y(this._point1Coordinate)
    }
    set point1Y(value) {
        assert.isRealNumber(value, "point1Y")
        this._setPoint1Y(value)
    }
    get point1Coordinate() {
        return coord.clone(this._point1Coordinate)
    }
    set point1Coordinate(value) {
        assert.isCoordinate(value, "point1Coordinate")
        this._setPoint1X(coord.x(value))
        this._setPoint1Y(coord.y(value))
    }
    get point1() {
        return new Point(this.owner, this._point1Coordinate)
    }
    set point1(value) {
        assert.isPoint(value, "point1")
        this._setPoint1X(value.x)
        this._setPoint1Y(value.y)
    }
    get point2X() {
        return coord.x(this._point2Coordinate)
    }
    set point2X(value) {
        assert.isRealNumber(value, "point2X")
        this._setPoint2X(value)
    }
    get point2Y() {
        return coord.y(this._point2Coordinate)
    }
    set point2Y(value) {
        assert.isRealNumber(value, "point2Y")
        this._setPoint2Y(value)
    }
    get point2Coordinate() {
        return coord.clone(this._point2Coordinate)
    }
    set point2Coordinate(value) {
        assert.isCoordinate(value, "point2Coordinate")
        this._setPoint2X(coord.x(value))
        this._setPoint2Y(coord.y(value))
    }
    get point2() {
        return new Point(this.owner, this._point2Coordinate)
    }
    set point2(value) {
        assert.isPoint(value, "point2")
        this._setPoint2X(value.x)
        this._setPoint2Y(value.y)
    }
    get point3X() {
        return coord.x(this._point3Coordinate)
    }
    set point3X(value) {
        assert.isRealNumber(value, "point3X")
        this._setPoint3X(value)
    }
    get point3Y() {
        return coord.y(this._point3Coordinate)
    }
    set point3Y(value) {
        assert.isRealNumber(value, "point3Y")
        this._setPoint3Y(value)
    }
    get point3Coordinate() {
        return coord.clone(this._point3Coordinate)
    }
    set point3Coordinate(value) {
        assert.isCoordinate(value, "point3Coordinate")
        this._setPoint3X(coord.x(value))
        this._setPoint3Y(coord.y(value))
    }
    get point3() {
        return new Point(this.owner, this._point3Coordinate)
    }
    set point3(value) {
        assert.isPoint(value, "point3")
        this._setPoint3X(value.x)
        this._setPoint3Y(value.y)
    }
    /**
     * Get the length of the opposite side of `point1` which is line segment from `point2` to `point3`.
     */
    get side1Length() {
        return vec2.magnitude(vec2.from(this.point2Coordinate, this.point3Coordinate))
    }
    /**
     * Get the length of the opposite side of `point2` which is line segment from `point3` to `point1`.
     */
    get side2Length() {
        return vec2.magnitude(vec2.from(this.point3Coordinate, this.point1Coordinate))
    }
    /**
     * Get the length of the opposite side of `point3` which is line segment from `point1` to `point2`.
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
        const [c1, c2, c3] = [this._point1Coordinate, this._point2Coordinate, this._point3Coordinate]
        const epsilon = this.options_.epsilon
        if (!coord.isValid(c1)) return false
        if (!coord.isValid(c2)) return false
        if (!coord.isValid(c3)) return false
        if (coord.isSameAs(c1, c2, epsilon)) return false
        if (coord.isSameAs(c2, c3, epsilon)) return false
        if (coord.isSameAs(c3, c1, epsilon)) return false
        // Do NOT use vector cross judgment, area judgment, lying on the same line judgment etc.
        // None of these methods can guarantee that if triangle `this` is judged to be valid, its inner line segment can all be valid.
        if (!math.greaterThan(vec2.magnitude(vec2.from(c1, c2)) + vec2.magnitude(vec2.from(c2, c3)), vec2.magnitude(vec2.from(c3, c1)), epsilon)) return false
        return true
    }
    getLength(): number {
        throw new Error("Method not implemented.")
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

    static equilateralTriangleFromLineSegment(owner: Geomtoy, lineSegment: LineSegment, positive = true) {
        let c1 = lineSegment.point1Coordinate,
            c2 = lineSegment.point2Coordinate,
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
        const epsilon = this.options_.epsilon
        const [ac1, ac2, ac3] = coordArray.sortSelf([this.point1Coordinate, this.point2Coordinate, this.point3Coordinate], epsilon)
        const [bc1, bc2, bc3] = coordArray.sortSelf([triangle.point1Coordinate, triangle.point2Coordinate, triangle.point3Coordinate], epsilon)
        return coord.isSameAs(ac1, bc1, epsilon) && coord.isSameAs(ac2, bc2, epsilon) && coord.isSameAs(ac3, bc3, epsilon)
    }
    /**
     * Whether the three vertices of triangle `this` is the same as triangle `triangle` considering the order of vertices.
     * @param triangle
     */
    isSameAs2(triangle: Triangle) {
        const epsilon = this.options_.epsilon
        return (
            coord.isSameAs(this.point1Coordinate, triangle.point1Coordinate, epsilon) &&
            coord.isSameAs(this.point2Coordinate, triangle.point2Coordinate, epsilon) &&
            coord.isSameAs(this.point3Coordinate, triangle.point3Coordinate, epsilon)
        )
    }
    /**
     * Move triangle `this` by `offsetX` and `offsetY` to get new triangle.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY)
    }
    /**
     * Move triangle `this` itself by `offsetX` and `offsetY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.point1Coordinate = coord.move(this.point1Coordinate, deltaX, deltaY)
        this.point2Coordinate = coord.move(this.point2Coordinate, deltaX, deltaY)
        this.point3Coordinate = coord.move(this.point3Coordinate, deltaX, deltaY)
        return this
    }
    /**
     * Move triangle `this` with `distance` along `angle` to get new triangle.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance)
    }
    /**
     * Move triangle `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        this.point1Coordinate = coord.moveAlongAngle(this.point1Coordinate, angle, distance)
        this.point2Coordinate = coord.moveAlongAngle(this.point2Coordinate, angle, distance)
        this.point3Coordinate = coord.moveAlongAngle(this.point3Coordinate, angle, distance)
        return this
    }
    /**
     * Get the sides as line segments of triangle `this`.
     */
    getSideLineSegments(): [LineSegment, LineSegment, LineSegment] {
        return [
            new LineSegment(this.owner, this.point2Coordinate, this.point3Coordinate),
            new LineSegment(this.owner, this.point3Coordinate, this.point1Coordinate),
            new LineSegment(this.owner, this.point1Coordinate, this.point2Coordinate)
        ]
    }
    /**
     * Get the altitudes as line segments of triangle `this`.
     */
    getAltitudeLineSegments(): [LineSegment, LineSegment, LineSegment] {
        const { point1Coordinate: c1, point2Coordinate: c2, point3Coordinate: c3 } = this
        const c1p = vec2.add(c2, vec2.project(vec2.from(c2, c1), vec2.from(c2, c3)))
        const c2p = vec2.add(c3, vec2.project(vec2.from(c3, c2), vec2.from(c3, c1)))
        const c3p = vec2.add(c1, vec2.project(vec2.from(c1, c3), vec2.from(c1, c2)))
        return [new LineSegment(this.owner, c1, c1p), new LineSegment(this.owner, c2, c2p), new LineSegment(this.owner, c3, c3p)]
    }
    /**
     * Get the medians as line segments of triangle `this`.
     */
    getMedianLineSegments(): [LineSegment, LineSegment, LineSegment] {
        const { point1Coordinate: c1, point2Coordinate: c2, point3Coordinate: c3 } = this
        const c1p = vec2.add(vec2.scalarMultiply(c2, 1 / 2), vec2.scalarMultiply(c3, 1 / 2))
        const c2p = vec2.add(vec2.scalarMultiply(c3, 1 / 2), vec2.scalarMultiply(c1, 1 / 2))
        const c3p = vec2.add(vec2.scalarMultiply(c1, 1 / 2), vec2.scalarMultiply(c2, 1 / 2))
        return [new LineSegment(this.owner, c1, c1p), new LineSegment(this.owner, c2, c2p), new LineSegment(this.owner, c3, c3p)]
    }
    /**
     * Get the symmedians as line segments of triangle `this`.
     */
    getSymmedianLineSegments() {
        let ls = [this.side1Length, this.side2Length, this.side3Length],
            cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate]
        return util.range(0, 3).map(i => {
            let c0 = cs[i],
                c1 = cs[(i + 1) % 3],
                c2 = cs[(i + 2) % 3],
                ls1 = ls[(i + 1) % 3],
                ls2 = ls[(i + 2) % 3],
                ratio = ls2 ** 2 / (ls1 ** 2 + ls2 ** 2),
                c0p = vec2.add(c1, vec2.scalarMultiply(vec2.from(c1, c2), ratio))
            return new LineSegment(this.owner, c0, c0p)
        }) as [LineSegment, LineSegment, LineSegment]
    }
    /**
     * Get the angle bisectors as line segments of triangle `this`.
     */
    getAngleBisectingLineSegments(): [LineSegment, LineSegment, LineSegment] {
        let ls = [this.side1Length, this.side2Length, this.side3Length],
            cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate]
        return util.range(0, 3).map(i => {
            let c0 = cs[i],
                c1 = cs[(i + 1) % 3],
                c2 = cs[(i + 2) % 3],
                ls1 = ls[(i + 1) % 3],
                ls2 = ls[(i + 2) % 3],
                ratio = ls2 / (ls1 + ls2),
                c0p = vec2.add(c1, vec2.scalarMultiply(vec2.from(c1, c2), ratio))
            return new LineSegment(this.owner, c0, c0p)
        }) as [LineSegment, LineSegment, LineSegment]
    }
    /**
     * Get the perpendicular bisectors as line segments of triangle `this`.
     */
    getPerpendicularlyBisectingLineSegments(): [LineSegment, LineSegment, LineSegment] {
        let cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate]
        return util.range(0, 3).map(i => {
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
            return new LineSegment(this.owner, m0, m0p)
        }) as [LineSegment, LineSegment, LineSegment]
    }

    /**
     * Whether triangle `this` is congruent with triangle `triangle`.
     * @param triangle
     */
    isCongruentWithTriangle(triangle: Triangle) {
        let [al1, al2, al3] = [this.side1Length, this.side2Length, this.side3Length].sort((a, b) => a - b),
            [bl1, bl2, bl3] = [triangle.side1Length, triangle.side2Length, triangle.side3Length].sort((a, b) => a - b),
            epsilon = this.options_.epsilon
        return math.equalTo(al1, bl1, epsilon) && math.equalTo(al2, bl2, epsilon) && math.equalTo(al3, bl3, epsilon)
    }
    /**
     * Whether triangle `this` is similar with triangle `triangle`.
     * @param triangle
     */
    isSimilarWithTriangle(triangle: Triangle) {
        let [aa1, aa2, aa3] = [this.angle1, this.angle2, this.angle3].sort((a, b) => a - b),
            [ba1, ba2, ba3] = [triangle.angle1, triangle.angle2, triangle.angle3].sort((a, b) => a - b),
            epsilon = this.options_.epsilon
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
        let [a, b, c] = [this.side1Length, this.side2Length, this.side3Length].sort((a, b) => a - b),
            epsilon = this.options_.epsilon
        return math.greaterThan(a ** 2 + b ** 2, c ** 2, epsilon)
    }
    /**
     * Whether triangle `this` is a right triangle.
     */
    isRightTriangle() {
        let [a, b, c] = [this.side1Length, this.side2Length, this.side3Length].sort((a, b) => a - b),
            epsilon = this.options_.epsilon
        return math.equalTo(a ** 2 + b ** 2, c ** 2, epsilon)
    }
    /**
     * Whether triangle `this` is an obtuse triangle.
     */
    isObtuseTriangle() {
        let [a, b, c] = [this.side1Length, this.side2Length, this.side3Length].sort((a, b) => a - b),
            epsilon = this.options_.epsilon
        return math.lessThan(a ** 2 + b ** 2, c ** 2, epsilon)
    }
    /**
     * Whether triangle `this` is a scalene triangle(a triangle with no congruent sides).
     */
    isScaleneTriangle() {
        let epsilon = this.options_.epsilon
        return !math.equalTo(this.side1Length, this.side2Length, epsilon) && !math.equalTo(this.side1Length, this.side3Length, epsilon)
    }
    /**
     * Whether triangle `this` is an isosceles triangle(a triangle with at least two congruent sides).
     */
    isIsoscelesTriangle() {
        let epsilon = this.options_.epsilon
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
        let epsilon = this.options_.epsilon
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
    isPointOnSideLines(point: Point) {
        let t = this.getTrilinearOfPoint(point),
            epsilon = this.options_.epsilon
        return math.strictSign(t[0], epsilon) * math.strictSign(t[1], epsilon) * math.strictSign(t[2], epsilon) === 0
    }
    isPointOn(point: Point): boolean {
        return true
    }
    /**
     * Whether point `point` is inside triangle `this`.
     * @param point
     */
    isPointInside(point: Point) {
        let t = this.getTrilinearOfPoint(point),
            epsilon = this.options_.epsilon
        return math.strictSign(t[0], epsilon) * math.strictSign(t[1], epsilon) * math.strictSign(t[2], epsilon) === 1
    }
    /**
     * Whether point `point` is outside triangle `this`.
     * @param point
     */
    isPointOutside(point: Point) {
        let t = this.getTrilinearOfPoint(point),
            epsilon = this.options_.epsilon
        return math.strictSign(t[0], epsilon) * math.strictSign(t[1], epsilon) * math.strictSign(t[2], epsilon) === -1
    }
    /**
     * Get the isogonal conjugate point of point `point` respect to triangle `this`.
     * @param point
     */
    getIsogonalConjugatePointOfPoint(point: Point) {
        if (this.isPointOn(point)) return null
        let t = this.getTrilinearOfPoint(point),
            tp: [number, number, number] = [1 / t[0], 1 / t[1], 1 / t[2]]
        return this.getPointAtTrilinear(tp)
    }
    /**
     * Get the isotomic conjugate point of point `point` respect to triangle `this`.
     * @param point
     */
    getIsotomicConjugatePointOfPoint(point: Point) {
        if (this.isPointOn(point)) return null
        let t = this.getTrilinearOfPoint(point),
            [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            tp: [number, number, number] = [1 / (a ** 2 * t[0]), 1 / (b ** 2 * t[1]), 1 / (c ** 2 * t[2])]
        return this.getPointAtTrilinear(tp)
    }
    /**
     * Get the centroid point of triangle `this`.
     */
    getCentroidPoint() {
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length]
        const t: [number, number, number] = [b * c, c * a, a * b]
        return this.getPointAtTrilinear(t)
    }
    /**
     * Get the medial triangle of triangle `this`.
     */
    getMedialTriangle() {
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length]
        const cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate] as const
        const t1 = new Trilinear(0, c * a, a * b)
        const t2 = new Trilinear(b * c, 0, a * b)
        const t3 = new Trilinear(b * c, c * a, 0)
        const cc1 = t1.toCartesian(...cs)
        const cc2 = t2.toCartesian(...cs)
        const cc3 = t3.toCartesian(...cs)
        return new Triangle(this.owner, cc1.valueOf(), cc2.valueOf(), cc3.valueOf())
    }
    /**
     * Get the antimedial triangle of triangle `this`.
     */
    getAntimedialTriangle() {
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length]
        const cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate] as const
        const t1 = new Trilinear(-b * c, c * a, a * b)
        const t2 = new Trilinear(b * c, -c * a, a * b)
        const t3 = new Trilinear(b * c, c * a, -a * b)
        const cc1 = t1.toCartesian(...cs)
        const cc2 = t2.toCartesian(...cs)
        const cc3 = t3.toCartesian(...cs)
        return new Triangle(this.owner, cc1.valueOf(), cc2.valueOf(), cc3.valueOf())
    }
    /**
     * Get the orthocenter point of triangle `this`.
     */
    getOrthocenterPoint() {
        const [aa, bb, cc] = [this.angle1, this.angle2, this.angle3]
        const t: [number, number, number] = [math.sec(aa), math.sec(bb), math.sec(cc)]
        return this.getPointAtTrilinear(t)
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
        return new Circle(this.owner, this._getOrthocenterCoordinate(), r)
    }
    /**
     * Get the orthic triangle of triangle `this`.
     * @description
     * - If triangle `this` is right triangle, return null
     * - Else return the orthic triangle.
     */
    getOrthicTriangle() {
        if (this.isRightTriangle()) return null
        const [a1, a2, a3] = [this.angle1, this.angle2, this.angle3]
        const cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate] as const
        const t1 = new Trilinear(0, math.sec(a2), math.sec(a3))
        const t2 = new Trilinear(math.sec(a1), 0, math.sec(a3))
        const t3 = new Trilinear(math.sec(a1), math.sec(a2), 0)
        const cc1 = t1.toCartesian(...cs)
        const cc2 = t2.toCartesian(...cs)
        const cc3 = t3.toCartesian(...cs)
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
        const cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate] as const
        let t = new Trilinear(math.cos(this.angle2 - this.angle3), math.cos(this.angle3 - this.angle1), math.cos(this.angle1 - this.angle2)),
            cc = t.toCartesian(...cs)
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
        return new Circle(this.owner, p.coordinate, r)
    }
    /**
     * Get the Nagel point of triangle `this`.
     */
    getNagelPoint() {
        // Nagel = (b+c-a)/a : (c+a-b)/b : (a+b-c)/c = csc^2(A/2) : csc^2(B/2) : csc^2(C/2)
        const cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate] as const
        let [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            d1 = (-a + b + c) / a,
            d2 = (a - b + c) / b,
            d3 = (a + b - c) / c,
            t = new Trilinear(d1, d2, d3),
            cc = t.toCartesian(...cs)
        return new Point(this.owner, cc.valueOf())
    }
    /**
     * Get the Nagel triangle of triangle `this`.
     */
    getNagelTriangle() {
        const cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate] as const
        let [a1, a2, a3] = [this.angle1, this.angle2, this.angle3],
            d1 = a1 / 2,
            d2 = a2 / 2,
            d3 = a3 / 2,
            t1 = new Trilinear(0, math.csc(d2) ** 2, math.csc(d3) ** 2),
            t2 = new Trilinear(math.csc(d1) ** 2, 0, math.csc(d3) ** 2),
            t3 = new Trilinear(math.csc(d1) ** 2, math.csc(d2) ** 2, 0),
            cc1 = t1.toCartesian(...cs),
            cc2 = t2.toCartesian(...cs),
            cc3 = t3.toCartesian(...cs)
        return new Triangle(this.owner, cc1.valueOf(), cc2.valueOf(), cc3.valueOf())
    }
    /**
     * Get the Gergonne point of triangle `this`.
     */
    getGergonnePoint() {
        const cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate] as const
        let [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            d1 = (b * c) / (-a + b + c),
            d2 = (a * c) / (a - b + c),
            d3 = (a * b) / (a + b - c),
            t = new Trilinear(d1, d2, d3),
            cc = t.toCartesian(...cs)
        return new Point(this.owner, cc.valueOf())
    }
    /**
     * Get the Gergonne triangle of triangle `this`.
     * @see {@link https://en.wikipedia.org/wiki/Incircle_and_excircles_of_a_triangle_Gergonne_triangle_and_point}
     */
    getGergonneTriangle() {
        const cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate] as const
        let [a1, a2, a3] = [this.angle1, this.angle2, this.angle3],
            d1 = a1 / 2,
            d2 = a2 / 2,
            d3 = a3 / 2,
            t1 = new Trilinear(0, math.sec(d2) ** 2, math.sec(d3) ** 2),
            t2 = new Trilinear(math.sec(d1) ** 2, 0, math.sec(d3) ** 2),
            t3 = new Trilinear(math.sec(d1) ** 2, math.sec(d2) ** 2, 0),
            cc1 = t1.toCartesian(...cs),
            cc2 = t2.toCartesian(...cs),
            cc3 = t3.toCartesian(...cs)
        return new Triangle(this.owner, cc1.valueOf(), cc2.valueOf(), cc3.valueOf())
    }

    getLemoinePoint() {
        // Lemoine = a : b : c = sinA : sinB : sinC
        const cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate] as const
        let [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            t = new Trilinear(a, b, c),
            cc = t.toCartesian(...cs)
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
        const cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate] as const
        let t = new Trilinear(1 - math.cos(this.angle2 - this.angle3), 1 - math.cos(this.angle3 - this.angle1), 1 - math.cos(this.angle1 - this.angle2)),
            cc = t.toCartesian(...cs)
        return new Point(this.owner, cc.valueOf())
    }
    /**
     * Get the Feuerbach triangle of triangle `this`.
     * @see {@link https://mathworld.wolfram.com/FeuerbachTriangle.html}
     */
    getFeuerbachTriangle() {
        const cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate] as const
        let [a1, a2, a3] = [this.angle1, this.angle2, this.angle3],
            d1 = (a2 - a3) / 2,
            d2 = (a3 - a1) / 2,
            d3 = (a1 - a2) / 2,
            t1 = new Trilinear(-1 * math.sin(d1) ** 2, math.cos(d2) ** 2, math.cos(d3) ** 2),
            t2 = new Trilinear(math.cos(d1) ** 2, -1 * math.sin(d2) ** 2, math.cos(d3) ** 2),
            t3 = new Trilinear(math.cos(d1) ** 2, math.cos(d2) ** 2, -1 * math.sin(d3) ** 2),
            cc1 = t1.toCartesian(...cs),
            cc2 = t2.toCartesian(...cs),
            cc3 = t3.toCartesian(...cs)
        return new Triangle(this.owner, cc1.valueOf(), cc2.valueOf(), cc3.valueOf())
    }

    /**
     * Get the first Fermat point of triangle `this`.
     * @see {@link https://en.wikipedia.org/wiki/Fermat_point}
     */
    getFirstFermatPoint() {
        // Fermat1 = csc(A+PI/3) : csc(B+PI/3) : csc(C+PI/3)
        const cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate] as const
        let t = new Trilinear(math.csc(this.angle1 + Math.PI / 3), math.csc(this.angle2 + Math.PI / 3), math.csc(this.angle3 + Math.PI / 3)),
            cc = t.toCartesian(...cs)
        return new Point(this.owner, cc.valueOf())
    }
    /**
     * Get the second Fermat point of triangle `this`.
     * @see {@link https://en.wikipedia.org/wiki/Fermat_point}
     */
    getSecondFermatPoint() {
        // Fermat2 = csc(A-PI/3) : csc(B-PI/3) : csc(C-PI/3)
        const cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate] as const
        let t = new Trilinear(math.csc(this.angle1 - Math.PI / 3), math.csc(this.angle2 - Math.PI / 3), math.csc(this.angle3 - Math.PI / 3)),
            cc = t.toCartesian(...cs)
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
        const cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate] as const
        let t = new Trilinear(math.sin(this.angle1 + Math.PI / 3), math.sin(this.angle2 + Math.PI / 3), math.sin(this.angle3 + Math.PI / 3)),
            cc = t.toCartesian(...cs)
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
        const cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate] as const
        let t = new Trilinear(math.sin(this.angle1 - Math.PI / 3), math.sin(this.angle2 - Math.PI / 3), math.sin(this.angle3 - Math.PI / 3)),
            cc = t.toCartesian(...cs)
        return new Point(this.owner, cc.valueOf())
    }

    /**
     * @see {@link https://mathworld.wolfram.com/EulerPoints.html}
     */
    getEulerPoints(): [Point, Point, Point] {
        let [hx, hy] = this._getOrthocenterCoordinate(),
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
        let c1 = this._getCircumcenterCoordinate(),
            c2 = this._getOrthocenterCoordinate()
        return Line.fromTwoPoints.bind(this)(this.owner, c1, c2)
    }

    // #endregion

    /**
     * Get the tangential triangle of triangle `this`.
     * @see {@link https://en.wikipedia.org/wiki/Tangential_triangle}
     */
    getTangentialTriangle() {
        const cs = [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate] as const
        let [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            t1 = new Trilinear(-a, b, c),
            t2 = new Trilinear(a, -b, c),
            t3 = new Trilinear(a, b, -c),
            cc1 = t1.toCartesian(...cs),
            cc2 = t2.toCartesian(...cs),
            cc3 = t3.toCartesian(...cs)
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

    _getOrthocenterCoordinate(): [number, number] {
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

    _getIncenterCoordinate(): [number, number] {
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
        return new Point(this.owner, this._getIncenterCoordinate())
    }
    /**
     * Get the inscribed circle of triangle `this`.
     */
    getInscribedCircle() {
        let s = this.getArea(),
            d = this.getPerimeter(),
            r = (2 * s) / d
        return new Circle(this.owner, this._getIncenterCoordinate(), r)
    }

    _getCircumcenterCoordinate(): [number, number] {
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
        return new Point(this.owner, this._getCircumcenterCoordinate())
    }
    /**
     * Get the circumscribed circle of triangle `this`.
     */
    getCircumscribedCircle() {
        let [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            area = this.getArea(),
            r = (a * b * c) / (4 * area)
        return new Circle(this.owner, this._getCircumcenterCoordinate(), r)
    }

    _getEscenterCoordinates(): [[number, number], [number, number], [number, number]] {
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
        let [ea, eb, ec] = this._getEscenterCoordinates()
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
        let [ea, eb, ec] = this._getEscenterCoordinates(),
            area = this.getArea(),
            [a, b, c] = [this.side1Length, this.side2Length, this.side3Length],
            ead = -a + b + c,
            ebd = a - b + c,
            ecd = a + b - c,
            ra = (2 * area) / ead,
            rb = (2 * area) / ebd,
            rc = (2 * area) / ecd
        return [new Circle(this.owner, ea, ra), new Circle(this.owner, eb, rb), new Circle(this.owner, ec, rc)]
    }

    apply(transformation: Transformation): Shape {
        throw new Error("Method not implemented.")
    }
    getGraphics() {
        const g = new Graphics()
        if (!this.isValid()) return g

        const { point1Coordinate: c1, point2Coordinate: c2, point3Coordinate: c3 } = this
        g.moveTo(...c1)
        g.lineTo(...c2)
        g.lineTo(...c3)
        g.close()
        return g
    }
    clone() {
        return new Triangle(this.owner, this.point1Coordinate, this.point2Coordinate, this.point3Coordinate)
    }
    copyFrom(triangle: Triangle | null) {
        if (triangle === null) triangle = new Triangle(this.owner)
        this._setPoint1X(coord.x(triangle._point1Coordinate))
        this._setPoint1Y(coord.y(triangle._point1Coordinate))
        this._setPoint2X(coord.x(triangle._point2Coordinate))
        this._setPoint2Y(coord.y(triangle._point2Coordinate))
        this._setPoint3X(coord.x(triangle._point3Coordinate))
        this._setPoint3Y(coord.y(triangle._point3Coordinate))
        return this
    }
    toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\tpoint1Coordinate: ${this.point1Coordinate.join(", ")}`,
            `\tpoint2Coordinate: ${this.point2Coordinate.join(", ")}`,
            `\tpoint3Coordinate: ${this.point3Coordinate.join(", ")}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n")
    }
    toArray() {
        return [this.point1Coordinate, this.point2Coordinate, this.point3Coordinate]
    }
    toObject() {
        return {
            point1Coordinate: this.point1Coordinate,
            point2Coordinate: this.point2Coordinate,
            point3Coordinate: this.point3Coordinate
        }
    }
}

validAndWithSameOwner(Triangle)

/**
 *
 * @category Shape
 */
export default Triangle
