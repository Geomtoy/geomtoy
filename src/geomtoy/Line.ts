import math from "./utility/math"
import util from "./utility"
import { validAndWithSameOwner } from "./decorator"
import assert from "./utility/assertion"

import Point from "./Point"
import LineSegment from "./LineSegment"
import Graphics from "./graphics"
import Rectangle from "./Rectangle"
import Circle from "./Circle"
import { GraphicsCommand, OwnerCarrier } from "./types"
import Transformation from "./transformation"
import Geomtoy from "."
import Polygon from "./advanced/Polygon"
import coord from "./utility/coordinate"
import angle from "./utility/angle"
import Arrow from "./helper/Arrow"
import coordArray from "./utility/coordinateArray"
import { optionerOf } from "./helper/Optioner"
import bbox from "./utility/boundingBox"
import vec2 from "./utility/vec2"
import Shape from "./base/Shape"
import { InfiniteOpenShape } from "./interfaces"

class Line extends Shape implements InfiniteOpenShape {
    private _slope: number = NaN
    private _coordinate: [number, number] = [NaN, NaN]

    constructor(owner: Geomtoy, x: number, y: number, slope: number)
    constructor(owner: Geomtoy, coordinate: [number, number], slope: number)
    constructor(owner: Geomtoy, point: Point, slope: number)
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any) {
        super(o)
        if (util.isNumber(a1)) {
            Object.assign(this, { x: a1, y: a2, slope: a3 })
        }
        if (util.isArray(a1)) {
            Object.assign(this, { coordinate: a1, slope: a2 })
        }
        if (a1 instanceof Point) {
            Object.assign(this, { point: a1, slope: a2 })
        }

        return Object.seal(this)
    }

    static readonly events = Object.freeze({
        xChanged: "xChanged",
        yChanged: "yChanged",
        slopeChanged: "slopeChanged",
        angleChanged: "angleChanged"
    })

    private _setX(value: number) {
        this.willTrigger_(coord.x(this._coordinate), value, [Line.events.xChanged])
        coord.x(this._coordinate, value)
    }
    private _setY(value: number) {
        this.willTrigger_(coord.y(this._coordinate), value, [Line.events.yChanged])
        coord.y(this._coordinate, value)
    }
    private _setSlope(value: number) {
        this.willTrigger_(this._slope, value, [Line.events.slopeChanged, Line.events.angleChanged])
        this._slope = value
    }

    get x() {
        return coord.x(this._coordinate)
    }
    set x(value) {
        assert.isRealNumber(value, "x")
        this._setX(value)
    }
    get y() {
        return coord.y(this._coordinate)
    }
    set y(value) {
        assert.isRealNumber(value, "y")
        this._setY(value)
    }
    get coordinate() {
        return coord.clone(this._coordinate)
    }
    set coordinate(value) {
        assert.isCoordinate(value, "coordinate")
        this._setX(coord.x(value))
        this._setY(coord.y(value))
    }
    get point() {
        return new Point(this.owner, this._coordinate)
    }
    set point(value) {
        assert.isPoint(value, "point")
        this._setX(value.x)
        this._setY(value.y)
    }
    /**
     * The slope of line `this`, the result is in the interval `(-Infinity, Infinity]`.
     * @description
     * Due to the accuracy of computer calculations, such as `Math.PI` is not accurate,
     * the range of slope is internally reduced to `(Math.tan(-Math.PI / 2), Math.tan(Math.PI / 2)]` which should be `(-16331239353195370, 16331239353195370]`
     * but we use `(-Infinity, Infinity]` to represent. So we actually cut off the numbers of these two intervals:
     * `[-Infinity, Math.tan(-Math.PI / 2)]`, `(Math.tan(Math.PI / 2), Infinity)`
     * (The results returned by `Math.atan` on these numbers are all -Math.PI / 2 or Math.PI / 2)
     * Any number greater than or equal to the maximum/less than or equal to the minimum will be clamped to `Infinity`.
     */
    get slope(): number {
        return this._slope
    }
    set slope(value) {
        assert.isNumberNotNaN(value, "slope")
        // prettier-ignore
        const s = value >= math.Tan90 
            ? Infinity 
            : value<= math.TanN90
            ? -Infinity
            : value
        this._setSlope(s)
    }
    /**
     * The angle between line `this` and the positive x-axis, the result is in the interval `(-Math.PI / 2, Math.PI / 2]`.
     */
    get angle(): number {
        return math.atan(this.slope)
    }
    set angle(value) {
        assert.isRealNumber(value, "angle")
        const a = angle.convert2(value)
        // prettier-ignore
        const s = a === Math.PI / 2 
            ? Infinity
            : a === - Math.PI / 2 
            ? -Infinity
            : math.tan(value)
        this._setSlope(s)
    }
    /**
     * The y-intercept of line `this`, the result is in the interval `(-Infinity, Infinity]`.
     * If line `this` is perpendicular to the x-axis, the y-intercept is `Infinity`.
     */
    get yIntercept(): number {
        const { x, y, slope } = this
        if (slope === Infinity) return Infinity
        return -x * slope + y
    }
    /**
     * The x-intercept of line `this`, the result is in the interval `(-Infinity, Infinity]`.
     * If line `this` is perpendicular to the y-axis, the x-intercept is `Infinity`.
     */
    get xIntercept(): number {
        const { x, y, slope } = this
        if (slope === 0) return Infinity
        return -y / slope + x
    }

    isValid() {
        if (!coord.isValid(this._coordinate)) return false
        if (!util.isNumberNotNaN(this._slope)) return false
        return true
    }

    static yAxis(owner: Geomtoy) {
        return new Line(owner, 0, 0, Infinity)
    }
    static xAxis(owner: Geomtoy) {
        return new Line(owner, 0, 0, 0)
    }
    static yEqualPositiveX(owner: Geomtoy) {
        return new Line(owner, 0, 0, 1)
    }
    static yEqualNegativeX(owner: Geomtoy) {
        return new Line(owner, 0, 0, -1)
    }
    static fromGeneralEquationParameters(owner: Geomtoy, params: [number, number, number]): null | Line {
        const [a, b, c] = params
        if (a === 0 && b === 0) {
            console.warn("[G]The `a` and `b` of a `Line` should not be equal to 0 at the same time.")
            return null
        }
        if (b === 0) return new Line(owner, -(c / a), 0, Infinity)
        if (a === 0) return new Line(owner, 0, -(c / b), 0)
        return new Line(owner, 0, -(c / b), -(a / b))
    }

    /**
     * Determine a line from two points `point1` and `point2`.
     * @param this
     * @param point1
     * @param point2
     * @param usePoint1
     * @returns
     */
    static fromTwoPoints(this: OwnerCarrier, point1: [number, number] | Point, point2: [number, number] | Point, usePoint1 = true): Line | null {
        assert.isCoordinateOrPoint(point1, "point1")
        assert.isCoordinateOrPoint(point2, "point2")
        assert.isBoolean(usePoint1, "usePoint1")
        const [x1, y1] = point1 instanceof Point ? point1.coordinate : point1
        const [x2, y2] = point2 instanceof Point ? point2.coordinate : point2
        const epsilon = optionerOf(this.owner).options.epsilon
        if (coord.isSameAs([x1, y1], [x2, y2], epsilon)) {
            console.warn("[G]The points `point1` and `point2` are the same, they can NOT determine a `Line`.")
            return null
        }
        if (math.equalTo(x1, x2, epsilon)) return usePoint1 ? new Line(this.owner, x1, y1, Infinity) : new Line(this.owner, x2, y2, Infinity)
        if (math.equalTo(y1, y2, epsilon)) return usePoint1 ? new Line(this.owner, x1, y1, 0) : new Line(this.owner, x2, y2, 0)
        const slope = (y2 - y1) / (x2 - x1)
        return usePoint1 ? new Line(this.owner, x1, y1, slope) : new Line(this.owner, x2, y2, slope)
    }
    /**
     * Determine a line from point `point` and angle `angle`.
     * @param owner
     * @param point
     * @param angle
     * @returns
     */
    static fromPointAndAngle(owner: Geomtoy, point: Point, angle: number): Line {
        const l = new Line(owner)
        l.point = point
        l.angle = angle
        return l
    }
    /**
     * Determine a line from x-intercept `xIntercept` and y-intercept `yIntercept`.
     * @param owner
     * @param xIntercept
     * @param yIntercept
     * @returns
     */
    static fromIntercepts(this: OwnerCarrier, yIntercept: number, xIntercept: number, useYInterceptionPoint = true): null | Line {
        const xInt = math.abs(xIntercept)
        const yInt = math.abs(yIntercept)

        if (xInt === Infinity && yInt === Infinity) {
            console.warn("[G]When the `xIntercept` and `yIntercept` are both `Infinity`, a `Line` can NOT be determined.")
            return null
        }
        if (xInt === Infinity) return new Line(this.owner, 0, yIntercept, 0)
        if (yInt === Infinity) return new Line(this.owner, xIntercept, 0, Infinity)
        return Line.fromTwoPoints.bind(this)([0, yIntercept], [xIntercept, 0], useYInterceptionPoint)
    }

    /**
     * Whether line `this` is the same as line `line`.
     * @param line
     * @returns
     */
    isSameAs(line: Line): boolean {
        if (this === line) return true
        const epsilon = this.options_.epsilon
        return math.equalTo(this.slope, line.slope, epsilon) && math.equalTo(this.yIntercept, line.yIntercept, epsilon)
    }
    /**
     * Move line `this` by `offsetX` and `offsetY` to get new line.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY)
    }
    /**
     * Move line `this` itself by `offsetX` and `offsetY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.coordinate = coord.move(this.coordinate, deltaX, deltaY)
        return this
    }
    /**
     * Move line `this` with `distance` along `angle` to get new line.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance)
    }
    /**
     * Move line `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        this.coordinate = coord.moveAlongAngle(this.coordinate, angle, distance)
        return this
    }

    getGeneralEquationParameters() {
        const { x, y, slope } = this
        if (slope === Infinity) return [-1, 0, x]
        if (slope === 0) return [0, -1, y]
        return [slope, -1, y - slope * x]
    }
    isPointOn(point: [number, number] | Point) {
        assert.isCoordinateOrPoint(point, "point")
        const [x, y] = point instanceof Point ? point.coordinate : point
        const [a, b, c] = this.getGeneralEquationParameters()
        const epsilon = this.options_.epsilon
        return math.equalTo(a * x + b * y + c, 0, epsilon)
    }
    isParallelToXAxis() {
        return this.slope === Infinity
    }
    isParallelToYAxis(): boolean {
        return this.slope === 0
    }
    getXWhereYEqualTo(y: number) {
        return this.slope === Infinity ? this.x : this.slope === 0 ? NaN : (y - this.y) / this.slope + this.x
    }
    getYWhereXEqualTo(x: number) {
        return this.slope === 0 ? this.y : this.slope === Infinity ? NaN : (x - this.x) * this.slope + this.y
    }
    /**
     * Get the point on line `this` where y is equal to `y`.
     * @param y
     * @returns
     */
    getPointWhereYEqualTo(y: number): null | Point {
        const x = this.getXWhereYEqualTo(y)
        if (util.isNaN(x)) return null
        return new Point(this.owner, [x, y])
    }
    /**
     * Get the point on line `this` where x is equal to `x`.
     * @param x
     * @returns
     */
    getPointWhereXEqualTo(x: number): null | Point {
        const y = this.getYWhereXEqualTo(x)
        if (util.isNaN(y)) return null
        return new Point(this.owner, [x, y])
    }

    // #region Positional relationships of line to line
    // (IdenticalTo)
    // ParallelTo
    // PerpendicularTo
    // IntersectedWith
    /**
     * Whether line `this` is parallel(including identical) to line `line`.
     * @param line
     */
    isParallelToLine(line: Line): boolean {
        if (this === line) return true
        if (this.slope === line.slope) return true
        const epsilon = this.options_.epsilon
        return math.equalTo(this.slope, line.slope, epsilon)
    }
    /**
     * Whether line `this` is perpendicular to line `line`.
     * @param line
     */
    isPerpendicularToLine(line: Line): boolean {
        const epsilon = this.options_.epsilon
        if (this.slope === Infinity || math.equalTo(line.slope, 0, epsilon)) return true
        if (line.slope === Infinity || math.equalTo(this.slope, 0, epsilon)) return true

        return math.equalTo(this.slope * line.slope, -1, epsilon)
    }
    /**
     * Whether line `this` is intersected with line `line`.
     * @param line
     */
    isIntersectedWithLine(line: Line): boolean {
        return !this.isParallelToLine(line)
    }
    /**
     * Get the intersection point with line `line`.
     * @param line
     */
    getIntersectionPointWithLine(line: Line): null | Point {
        if (this.isParallelToLine(line)) return null
        const [a1, b1, c1] = this.getGeneralEquationParameters()
        const [a2, b2, c2] = line.getGeneralEquationParameters()
        //`m` will not be equal to 0, we call `isParallelToLine` already
        const m = a1 * b2 - a2 * b1
        const x = (c2 * b1 - c1 * b2) / m
        const y = (c1 * a2 - c2 * a1) / m
        return new Point(this.owner, x, y)
    }
    // #endregion

    // #region Positional relationships of line to circle
    // IntersectedWith
    // TangentTo
    // SeparatedFrom
    /**
     * Whether line `this` is intersected with circle `circle`.
     * @param circle
     */
    isIntersectedWithCircle(circle: Circle): boolean {
        let epsilon = this.options_.epsilon
        return math.lessThan(circle.centerPoint.getSquaredDistanceBetweenLine(this), circle.radius ** 2, epsilon)
    }
    /**
     * Get the intersection points of line `this` and circle `circle`.
     * @param circle
     */
    getIntersectionPointsWithCircle(circle: Circle): null | [Point, Point] {
        if (!this.isIntersectedWithCircle(circle)) return null
        let p0 = circle.centerPoint,
            r = circle.radius,
            p1 = this.getPerpendicularPointFromPoint(p0),
            sd = p0.getSquaredDistanceBetweenPoint(p1),
            d1i = math.sqrt(r ** 2 - sd),
            a = this.angle,
            ip1 = p1.moveAlongAngle(a, d1i),
            ip2 = p1.moveAlongAngle(a + Math.PI, d1i)
        return [ip1, ip2]
    }
    /**
     * Whether line `this` is tangent to circle `circle`.
     * @param circle
     */
    isTangentToCircle(circle: Circle): boolean {
        let epsilon = this.options_.epsilon
        return math.equalTo(circle.centerPoint.getSquaredDistanceBetweenLine(this), circle.radius ** 2, epsilon)
    }
    /**
     * Get the tangency point of line `this` and circle `circle`.
     * @param circle
     */
    getTangencyPointToCircle(circle: Circle): null | Point {
        if (!this.isTangentToCircle(circle)) return null
        return this.getPerpendicularPointFromPoint(circle.centerPoint)
    }
    /**
     * Whether line `this` is separated from circle `circle`.
     * @param circle
     */
    isSeparatedFromCircle(circle: Circle): boolean {
        let epsilon = this.options_.epsilon
        return math.greaterThan(circle.centerPoint.getSquaredDistanceBetweenLine(this), circle.radius ** 2, epsilon)
    }
    // #endregion

    // #region Positional relationships of line to line segment
    // ParallelTo
    // PerpendicularTo
    // CollinearWith
    // SeparatedFrom
    // IntersectedWith
    /**
     * Whether line `this` is parallel to line segment `lineSegment`.
     * @param {LineSegment} lineSegment
     */
    isParallelToLineSegment(lineSegment: LineSegment): boolean {
        /* 
        If `line` is parallel to `lineSegment`, the signed distances of endpoints of `lineSegment` between `line` are equal,
        and we can eliminate the denominator "sqrt(a^2+b^2)", just compare the numerator.
        */
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = lineSegment
        const [a, b] = this.getGeneralEquationParameters()
        const epsilon = this.options_.epsilon
        return math.equalTo(a * x1 + b * y1, a * x2 + b * y2, epsilon)
    }
    /**
     * Whether line `this` is perpendicular to line segment `lineSegment`.
     * @param {LineSegment} lineSegment
     */
    isPerpendicularToLineSegment(lineSegment: LineSegment): boolean {
        /* 
        If `line` is perpendicular to `lineSegment`, then `lineSegment` should parallel to the line which is perpendicular to `line`.
        The perpendicular line of "y=-(a/b)x-(c/b)" is written as "y=(b/a)x-(c/b)", simplify it to "bx-ay=0".
        */
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = lineSegment
        const [a, b] = this.getGeneralEquationParameters()
        const epsilon = this.options_.epsilon
        return math.equalTo(b * x1 - a * y1, b * x2 - a * y2, epsilon)
    }
    /**
     * Whether line `this` is collinear with line segment `lineSegment`.
     * @param {LineSegment} lineSegment
     */
    isCollinearWithLineSegment(lineSegment: LineSegment): boolean {
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = lineSegment
        const [a, b, c] = this.getGeneralEquationParameters()
        const epsilon = this.options_.epsilon
        const s1 = math.strictSign(a * x1 + b * y1 + c, epsilon)
        const s2 = math.strictSign(a * x2 + b * y2 + c, epsilon)
        return s1 === 0 && s2 === 0
    }
    /**
     * Whether line `this` is separated from line segment `lineSegment`.
     * @param {LineSegment} lineSegment
     */
    isSeparatedFromLineSegment(lineSegment: LineSegment): boolean {
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = lineSegment
        const [a, b, c] = this.getGeneralEquationParameters()
        const epsilon = this.options_.epsilon
        const s1 = math.strictSign(a * x1 + b * y1 + c, epsilon)
        const s2 = math.strictSign(a * x2 + b * y2 + c, epsilon)
        return s1 * s2 === 1
    }
    /**
     * Whether line `this` is intersected with line segment `lineSegment`.
     * @param {LineSegment} lineSegment
     */
    isIntersectedWithLineSegment(lineSegment: LineSegment): boolean {
        // If `line` is intersected with `lineSegment`, the signed distance of endpoints of `lineSegment` between `line` have different sign.
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = lineSegment
        const [a, b, c] = this.getGeneralEquationParameters()
        const epsilon = this.options_.epsilon
        const s1 = math.strictSign(a * x1 + b * y1 + c, epsilon)
        const s2 = math.strictSign(a * x2 + b * y2 + c, epsilon)
        return (s1 === 0) !== (s2 === 0) || s1 * s2 === -1
    }
    /**
     * Get the intersection point of line `this` and line segment `lineSegment`
     * @param {LineSegment} lineSegment
     */
    getIntersectionPointWithLineSegment(lineSegment: LineSegment): null | Point {
        if (!this.isIntersectedWithLineSegment(lineSegment)) return null
        const w = lineSegment.getLerpingRatioByLine(this)
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = lineSegment
        return new Point(this.owner, math.lerp(x1, x2, w), math.lerp(y1, y2, w))
    }

    /**
     * 是否与`矩形rectangle`相交
     * @param {Rectangle} rectangle
     */
    _isIntersectedWithPolygon(polygon: Polygon) {
        // let

        //     s1 = LineSegment.fromPoints(rectangle.getCornerPoint("leftTop"), rectangle, p2),
        //     s2 = LineSegment.fromPoints(rectangle.p2, rectangle.p3),
        //     s3 = LineSegment.fromPoints(rectangle.p3, rectangle.p4),
        //     s4 = LineSegment.fromPoints(rectangle.p4, rectangle.p1),
        //     ret1 = this._isIntersectedWithLineSegment(s1),
        //     ret2 = this._isIntersectedWithLineSegment(s2),
        //     ret3 = this._isIntersectedWithLineSegment(s3),
        //     ret4 = this._isIntersectedWithLineSegment(s4),
        //     //去掉相交于顶点出现重复的情况
        //     ret = _.uniqWith(_.compact([ret1, ret2, ret3, ret4]), (i, j) => i.isSameAs(j))

        // if (ret) return ret
        return false
    }
    isIntersectedWithPolygon(polygon: Polygon) {
        return Boolean(this._isIntersectedWithPolygon(polygon))
    }
    getIntersectionPointWithPolygon(polygon: Polygon) {
        let ret = this._isIntersectedWithPolygon(polygon)
        if (ret) return ret
        return null
    }
    
    /**
     * Find the perpendicular line of line `this` from point `point`.
     * @param coordinate
     */
    getPerpendicularLineFromPoint(point: [number, number] | Point): Line {
        const k1 = this.slope
        const [x, y] = point instanceof Point ? point.coordinate : point
        // If two line are perpendicular to each other, the slope multiplication is equal to -1.
        const k2 = k1 === Infinity ? 0 : k1 === 0 ? Infinity : -1 / k1
        return new Line(this.owner, [x, y], k2)
    }
    /**
     * Find the perpendicular point(the foot of the perpendicular) on line `this` from point `point`.
     * @param point
     */
    // change function name
    getClosestPointFromPoint(){
        
    }

    getPerpendicularPointFromPoint(point: Point): Point {
        let [a, b, c] = this.getGeneralEquationParameters(),
            { x, y } = point,
            d = -(a * x + b * y + c) / (a ** 2 + b ** 2)
        return new Point(this.owner, [d * a + x, d * b + y])
    }
    /**
     * 若`直线this`与`直线line`平行，则返回它们之间的距离，否则返回NaN
     * @param line
     */
    getDistanceToParallelLine(line: Line): number {
        if (!this.isParallelToLine(line)) return NaN
        const [a1, b1, c1] = this.getGeneralEquationParameters()
        const [a2, b2, c2] = line.getGeneralEquationParameters()
        return Math.abs(c1 - c2) / Math.hypot(a1, b1)
    }

    getIntersectionPointsWithRectangle(rectangle: Rectangle): Point[] {
        const { originX: x, originY: y, width: w, height: h } = rectangle

        const s1 = new LineSegment(this.owner, [x, y], [x + w, y]),
            s2 = new LineSegment(this.owner, [x + w, y], [x + w, y + h]),
            s3 = new LineSegment(this.owner, [x + w, y + h], [x, y + h]),
            s4 = new LineSegment(this.owner, [x, y + h], [x, y]),
            ret1 = this.getIntersectionPointWithLineSegment(s1),
            ret2 = this.getIntersectionPointWithLineSegment(s2),
            ret3 = this.getIntersectionPointWithLineSegment(s3),
            ret4 = this.getIntersectionPointWithLineSegment(s4)

        return [ret1, ret2, ret3, ret4].filter(v => v !== null) as Point[]
    }

    getGraphics(): GraphicsCommand[] {
        const g = new Graphics()
        if (!this.isValid()) return g.commands

        const gbb = this.owner.globalBoundingBox
        const [a, b, c] = this.getGeneralEquationParameters()
        const cs: [number, number][] = []
        const [minX, minY, maxX, maxY] = [bbox.minX(gbb), bbox.minY(gbb), bbox.maxX(gbb), bbox.maxY(gbb)]

        const d1 = a * minX + b * minY + c
        const d2 = a * maxX + b * minY + c
        const d3 = a * maxX + b * maxY + c
        const d4 = a * minX + b * maxY + c
        const lerp1 = d1 / (d1 - d2)
        const lerp2 = d2 / (d2 - d3)
        const lerp3 = d3 / (d3 - d4)
        const lerp4 = d4 / (d4 - d1)

        if (math.inInterval(lerp1, 0, 1, false, true)) cs.push([math.lerp(minX, maxX, lerp1), minY])
        if (math.inInterval(lerp2, 0, 1, false, true)) cs.push([maxX, math.lerp(minY, maxY, lerp2)])
        if (math.inInterval(lerp3, 0, 1, false, true)) cs.push([math.lerp(maxX, minX, lerp3), maxY])
        if (math.inInterval(lerp4, 0, 1, false, true)) cs.push([minX, math.lerp(maxY, minY, lerp4)])
        // When `cs.length === 0`, there is no intersection between line `this` and the bbox.
        // When `cs.length === 1`, line `this` only passes through one vertex of the bbox.
        // When `cs.length === 2`, line `this` intersects the bbox or one of the lines of bbox.

        if (cs.length !== 2) {
            return g.commands
        }
        const [c1, c2] = coordArray.sortSelf(cs, this.options_.epsilon)
        g.moveTo(...c1)
        g.lineTo(...c2)

        if (this.options_.graphics.lineArrow) {
            const arrowGraphics1 = new Arrow(this.owner, c1, this.angle - Math.PI).getGraphics()
            const arrowGraphics2 = new Arrow(this.owner, c2, this.angle).getGraphics()
            g.append(arrowGraphics1)
            g.append(arrowGraphics2)
        }

        return g.commands
    }
    apply(transformation: Transformation): Shape {
        throw new Error("Method not implemented.")
    }
    clone() {
        return new Line(this.owner, this.coordinate, this.slope)
    }
    copyFrom(line: Line | null) {
        if (line === null) line = new Line(this.owner)
        this._setX(coord.x(line._coordinate))
        this._setY(coord.y(line._coordinate))
        this._setSlope(line._slope)
        return this
    }
    toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\tcoordinate: ${this.coordinate}`,
            `\tslope: ${this.slope}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n")
    }
    toArray() {
        return [this.coordinate, this.slope]
    }
    toObject() {
        return { coordinate: this.coordinate, slope: this.slope }
    }
}

validAndWithSameOwner(Line)
/**
 * @category Shape
 */
export default Line
