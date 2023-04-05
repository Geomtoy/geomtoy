import { Angle, Float, Maths, Polynomial, Type } from "@geomtoy/util";
import Arc from "../../geometries/basic/Arc";
import Bezier from "../../geometries/basic/Bezier";
import LineSegment from "../../geometries/basic/LineSegment";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { eps } from "../../geomtoy";
import { mapComplexAtanImagZeroToReal, rootMultiplicityAtPi } from "../../misc/tangent-half-angle-substitution";
import { BasicSegment } from "../../types";
import SweepEvent from "./SweepEvent";

export function compareX(c1: [number, number], c2: [number, number]) {
    if (Float.equalTo(c1[0], c2[0], eps.epsilon)) return 0;
    return c1[0] < c2[0] ? -1 : 1;
}
export function compareY(c1: [number, number], c2: [number, number]) {
    if (Float.equalTo(c1[1], c2[1], eps.epsilon)) return 0;
    return c1[1] < c2[1] ? -1 : 1;
}

export function quickY(event: SweepEvent, coordinates: [number, number]) {
    if (event.mono.segment instanceof LineSegment) return quickLineSegmentY(event, coordinates);
    if (event.mono.segment instanceof QuadraticBezier) return quickQuadraticBezierY(event, coordinates);
    if (event.mono.segment instanceof Bezier) return quickBezierY(event, coordinates);
    if (event.mono.segment instanceof Arc) return quickArcY(event, coordinates);
    throw new Error("[G]Impossible.");
}

// Return the `y` on the line segment mono when `x = coordinates[0]`
function quickLineSegmentY(event: SweepEvent, coordinates: [number, number]) {
    const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = event.mono.segment;
    const [, ey] = event.mono.enterCoordinates;
    const [, ly] = event.mono.leaveCoordinates;
    const [x, y] = coordinates;

    if (event.mono.isVertical) {
        if (y < ey) return ey; // if y is below enter y , then the enter y
        if (y > ly) return ly; // if y is above leave y, then the leave y
        return y; // else the y it self
    }
    const t = (x - x1) / (x2 - x1);
    if (Float.between(t, 0, 1, false, false, eps.timeEpsilon)) return Maths.lerp(y1, y2, t);
    throw new Error("[G]This should never happen.");
}
// Return the `y` on the quadratic bezier mono when `x = coordinates[0]`
function quickQuadraticBezierY(event: SweepEvent, coordinates: [number, number]) {
    const [x] = coordinates;
    const [polyX, polyY] = (event.mono.segment as QuadraticBezier).getPolynomial();
    const tPoly = Polynomial.add(polyX, [-x]);
    const tRoots = Polynomial.roots(tPoly, eps.complexEpsilon).filter(Type.isNumber);
    for (const t of tRoots) {
        if (Float.between(t, 0, 1, false, false, eps.timeEpsilon)) return Polynomial.evaluate(polyY, t);
    }
    throw new Error("[G]This should never happen.");
}

// Return the `y` on the quadratic bezier mono when `x = coordinates[0]`
function quickBezierY(event: SweepEvent, coordinates: [number, number]) {
    const [x] = coordinates;
    const [polyX, polyY] = (event.mono.segment as Bezier).getPolynomial();
    const tPoly = Polynomial.add(polyX, [-x]);
    const tRoots = Polynomial.roots(tPoly, eps.complexEpsilon).filter(Type.isNumber);
    for (const t of tRoots) {
        if (Float.between(t, 0, 1, false, false, eps.timeEpsilon)) return Polynomial.evaluate(polyY, t);
    }
    throw new Error("[G]This should never happen.");
}

// Return the `y` on the arc mono when `x = coordinates[0]`
function quickArcY(event: SweepEvent, coordinates: [number, number]) {
    const [x] = coordinates;
    const arc = event.mono.segment as Arc;
    const { radiusX: rx, radiusY: ry, rotation: phi, positive } = arc;
    const [cx, cy] = arc.getCenterPoint().coordinates;
    const [sa, ea] = arc.getStartEndAngles();
    const cosPhi = Maths.cos(phi);
    const sinPhi = Maths.sin(phi);
    const [px1, px2, px3] = [rx * cosPhi, -ry * sinPhi, cx]; // $[\cos(\theta),\sin(\theta),1]$
    const [py1, py2, py3] = [rx * sinPhi, ry * cosPhi, cy]; // $[\cos(\theta),\sin(\theta),1]$
    const tPoly = [-x + (-px1 + px3), 2 * px2, -x + (px1 + px3)];

    if (rootMultiplicityAtPi(tPoly) > 0) {
        const cosPi = Maths.cos(Maths.PI);
        const sinPi = Maths.sin(Maths.PI);
        const y = py1 * cosPi + py2 * sinPi + py3;
        return y;
    }
    const tRoots = Polynomial.roots(tPoly).map(mapComplexAtanImagZeroToReal).filter(Type.isNumber);

    for (const t of tRoots) {
        const cosTheta = (1 - t ** 2) / (1 + t ** 2);
        const sinTheta = (2 * t) / (1 + t ** 2);
        const a = Maths.atan2(sinTheta, cosTheta);
        if (Angle.between(a, sa, ea, positive, false, false, eps.angleEpsilon)) {
            return py1 * cosTheta + py2 * sinTheta + py3;
        }
    }
    throw new Error("[G]This should never happen.");
}

// #region Calculate the 1,2,3 derivative value of y respect to x.
/**
 * Reference:
 * @see  https://math.stackexchange.com/questions/68988/a-general-formula-for-the-n-th-derivative-of-a-parametrically-defined-function
 */
function firstDerivativeValue(dx1: number, dy1: number) {
    const num = dy1;
    const den = dx1;
    const frac = num / den;
    if (Float.equalTo(den, 0, eps.epsilon)) {
        const negative = Object.is(num, -0) || Maths.sign(num) < 0;
        return negative ? -Infinity : Infinity;
    }
    return frac;
}
function secondDerivativeValue(dx1: number, dx2: number, dy1: number, dy2: number) {
    const num = dx1 * dy2 - dy1 * dx2;
    const den = dx1 ** 3;
    const frac = num / den;
    if (Float.equalTo(den, 0, eps.epsilon)) {
        const negative = Object.is(num, -0) || Maths.sign(num) < 0;
        return negative ? -Infinity : Infinity;
    }
    return frac;
}
function thirdDerivativeValue(dx1: number, dx2: number, dx3: number, dy1: number, dy2: number, dy3: number) {
    const num = dx1 * (dy3 * dx1 - 3 * dx2 * dy2) + dy1 * (3 * dx2 * dx2 - dx3 * dx1);
    const den = dx1 ** 5;
    const frac = num / den;
    if (Float.equalTo(den, 0, eps.epsilon)) {
        const negative = Object.is(num, -0) || Maths.sign(num) < 0;
        return negative ? -Infinity : Infinity;
    }
    return frac;
}
// #endregion

// Note: these derivative value is along the segment(transposed is not considered).
export function derivativeValueAtEnd(segment: BasicSegment, isInit: boolean, n: 1 | 2 | 3) {
    if (segment instanceof LineSegment) return lineSegmentDerivativeValueAtEnd(segment, isInit, n);
    if (segment instanceof QuadraticBezier) return quadraticBezierDerivativeValueAtEnd(segment, isInit, n);
    if (segment instanceof Bezier) return bezierDerivativeValueAtEnd(segment, isInit, n);
    if (segment instanceof Arc) return arcDerivativeValueAtEnd(segment, isInit, n);
    throw new Error("[G]Impossible.");
}
function lineSegmentDerivativeValueAtEnd(lineSegment: LineSegment, isInit: boolean, n: 1 | 2 | 3) {
    const [polyX, polyY] = lineSegment.getPolynomial();
    const dx1V = Polynomial.evaluate(Polynomial.derivative(polyX), isInit ? 0 : 1);
    const dy1V = Polynomial.evaluate(Polynomial.derivative(polyY), isInit ? 0 : 1);
    if (n == 1) return firstDerivativeValue(dx1V, dy1V);
    const dx2V = 0;
    const dy2V = 0;
    if (n == 2) return secondDerivativeValue(dx1V, dx2V, dy1V, dy2V);
    const dx3V = 0;
    const dy3V = 0;
    if (n == 3) return thirdDerivativeValue(dx1V, dx2V, dx3V, dy1V, dy2V, dy3V);
    throw new Error("[G]We don't need to compare higher derivative values");
}
function quadraticBezierDerivativeValueAtEnd(quadraticBezier: QuadraticBezier, isInit: boolean, n: 1 | 2 | 3) {
    const [polyX, polyY] = quadraticBezier.getPolynomial();
    const dx1V = Polynomial.evaluate(Polynomial.derivative(polyX), isInit ? 0 : 1);
    const dy1V = Polynomial.evaluate(Polynomial.derivative(polyY), isInit ? 0 : 1);
    if (n == 1) return firstDerivativeValue(dx1V, dy1V);
    const dx2V = Polynomial.evaluate(Polynomial.derivative(polyX, 2), isInit ? 0 : 1);
    const dy2V = Polynomial.evaluate(Polynomial.derivative(polyY, 2), isInit ? 0 : 1);
    if (n == 2) return secondDerivativeValue(dx1V, dx2V, dy1V, dy2V);
    const dx3V = 0;
    const dy3V = 0;
    if (n == 3) return thirdDerivativeValue(dx1V, dx2V, dx3V, dy1V, dy2V, dy3V);
    throw new Error("[G]We don't need to compare higher derivative values");
}
function bezierDerivativeValueAtEnd(bezier: Bezier, isInit: boolean, n: 1 | 2 | 3) {
    const [polyX, polyY] = bezier.getPolynomial();
    const dx1V = Polynomial.evaluate(Polynomial.derivative(polyX), isInit ? 0 : 1);
    const dy1V = Polynomial.evaluate(Polynomial.derivative(polyY), isInit ? 0 : 1);
    if (n == 1) return firstDerivativeValue(dx1V, dy1V);
    const dx2V = Polynomial.evaluate(Polynomial.derivative(polyX, 2), isInit ? 0 : 1);
    const dy2V = Polynomial.evaluate(Polynomial.derivative(polyY, 2), isInit ? 0 : 1);
    if (n == 2) return secondDerivativeValue(dx1V, dx2V, dy1V, dy2V);
    const dx3V = Polynomial.evaluate(Polynomial.derivative(polyX, 3), isInit ? 0 : 1);
    const dy3V = Polynomial.evaluate(Polynomial.derivative(polyY, 3), isInit ? 0 : 1);
    if (n == 3) return thirdDerivativeValue(dx1V, dx2V, dx3V, dy1V, dy2V, dy3V);
    throw new Error("[G]We don't need to compare higher derivative values");
}
function arcDerivativeValueAtEnd(arc: Arc, isInit: boolean, n: 1 | 2 | 3) {
    const { radiusX: rx, radiusY: ry, rotation: phi } = arc;
    const [sa, ea] = arc.getStartEndAngles();
    const cosPhi = Maths.cos(phi);
    const sinPhi = Maths.sin(phi);
    const sinA = Maths.sin(isInit ? sa : ea);
    const cosA = Maths.cos(isInit ? sa : ea);
    const dx1V = -rx * sinA * cosPhi - ry * cosA * sinPhi;
    const dy1V = -rx * sinA * sinPhi + ry * cosA * cosPhi;
    if (n == 1) return arc.positive ? firstDerivativeValue(dx1V, dy1V) : firstDerivativeValue(-dx1V, -dy1V);
    const dx2V = -rx * cosA * cosPhi + ry * sinA * sinPhi;
    const dy2V = -rx * cosA * sinPhi - ry * sinA * cosPhi;
    if (n == 2) return arc.positive ? secondDerivativeValue(dx1V, dx2V, dy1V, dy2V) : secondDerivativeValue(-dx1V, -dx2V, -dy1V, -dy2V);
    const dx3V = rx * sinA * cosPhi + ry * cosA * sinPhi;
    const dy3V = rx * sinA * sinPhi - ry * cosA * cosPhi;
    if (n == 3) return arc.positive ? thirdDerivativeValue(dx1V, dx2V, dx3V, dy1V, dy2V, dy3V) : thirdDerivativeValue(-dx1V, -dx2V, -dx3V, -dy1V, -dy2V, -dy3V);
    throw new Error("[G]We don't need to compare higher derivative values");
}
