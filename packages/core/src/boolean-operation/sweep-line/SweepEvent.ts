import { Angle, Maths, Polynomial, Type } from "@geomtoy/util";
import Arc from "../../geometries/basic/Arc";
import Bezier from "../../geometries/basic/Bezier";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { optioner } from "../../geomtoy";
import { LinkedListNode } from "./LinkedList";
import MonoSegment from "./MonoSegment";
import { compareX, compareY } from "./util";

export default class SweepEvent {
    // the `LinkedListNode` wrap outside this sweep event, reverse reference, only existed on leave event
    status?: LinkedListNode<SweepEvent>;

    constructor(
        // the coordinates of this sweep event
        public coordinates: [number, number],
        // the mono segment this sweep event belongs to
        public mono: MonoSegment,
        // is the coordinates of this sweep event, the enter coordinates of the mono segment?
        // if `true`, this sweep event is the enter event of the mono segment
        // if `false`, this sweep event is the leave event of the mono segment
        public isEnter: boolean,
        // the other event of this sweep event, for the enter event, it's its leave event, for the leave event, it's its enter event
        public otherEvent: SweepEvent,
        // a solid/static value to compare sweep events, when coordinates of sweep events are equal
        public quickY: number = NaN
    ) {}

    /**
     * Whether the coordinates of `this` smaller than `that`.
     * @description
     * Smaller coordinates means with less x coordinate, if x equal then less y coordinate.
     * Sweep events with smaller x-coordinate, then with smaller y-coordinate have higher priority.
     * @param that
     */
    compareCoordinates(that: SweepEvent) {
        let comp: -1 | 0 | 1 = compareX(this.coordinates, that.coordinates);
        if (comp === 0) comp = compareY(this.coordinates, that.coordinates);
        return comp;
    }
    /**
     * Whether the quick-y of `this` smaller than `that`.
     * @description
     * Quick-y is a trick, in order to determine the priority of the sweep event on the y-axis.
     * * Note
     * If the coordinates of the two sweep events are the same, which sweep event is above and which segment is below(higher priority)?
     * The above and blow we are talking about here are near the coordinates.
     * If you look at the whole segment, then the two may intersect many times,
     * so it is impossible to tell who is the above and who is the below.
     * This is the core of the sweep line algorithm, even if they will intersect many times later,
     * that is in the future, but at this moment, when the sweep event occurs, their situation near the sweep event coordinates is more important.
     * The specific logic may be more, I will not expand it here.
     * Why not use the tangent vector or derivatives?
     * Because after many attempts, in the tangent situation, they cannot effectively determining this priority.
     * And according to the information I have collected, there is no other way to determine this priority.
     * And we need a result that can be stored in the sweep event without repeated calculation, then this quick-y is a very good answer.
     * @param that
     */
    compareQuickY(that: SweepEvent) {
        const testLineOffset = optioner.options.curveEpsilon;
        const y1 = Number.isNaN(this.quickY) ? (this.quickY = quickY(this, testLineOffset)) : this.quickY;
        const y2 = Number.isNaN(that.quickY) ? (that.quickY = quickY(that, testLineOffset)) : that.quickY;
        // If `quickY` is equal,there are two situations:
        // - two segments happen to intersect at the tested x-coordinate, this does't matter, the intersecting is in the future(although every near future), we will handle it later.
        // - two segment are equal, so the priority also does't matter.
        return Maths.sign(y1 - y2) as -1 | 0 | 1;
    }

    static compare(e1: SweepEvent, e2: SweepEvent) {
        let comp: -1 | 0 | 1;
        comp = e1.compareCoordinates(e2);
        if (comp !== 0) return comp;
        // now they have the same coordinates
        // leave event happens first
        if (e1.isEnter !== e2.isEnter) {
            comp = e1.isEnter ? 1 : -1;
            return comp;
        }
        // now they are the same type (enter or leave) and have the same coordinates
        comp = e1.compareQuickY(e2);
        return comp;
    }
}

function quickY(event: SweepEvent, testLineOffset: number) {
    return event.mono.segment instanceof Bezier
        ? quickBezierY(event, testLineOffset)
        : event.mono.segment instanceof QuadraticBezier
        ? quickQuadraticBezierY(event, testLineOffset)
        : event.mono.segment instanceof Arc
        ? quickArcY(event, testLineOffset)
        : quickLineSegmentY(event, testLineOffset);
}
function quickLineSegmentY(event: SweepEvent, testLineOffset: number) {
    const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = event.mono.segment;
    if (event.mono.isVertical) {
        // Although they are vertical, but in this case they may be thought as slightly sloping to the right or to the left, so returns the other coordinate's y
        if (event.isEnter !== event.mono.transposed) return y2;
        else return y1;
    }

    let x = event.coordinates[0];
    x = event.isEnter ? x + testLineOffset : x - testLineOffset;
    // a=1, b=0, c=-x
    const d1 = x1 - x;
    const d2 = x2 - x;
    const t = d1 / (d1 - d2);
    return Maths.lerp(y1, y2, t);
}
function quickQuadraticBezierY(event: SweepEvent, testLineOffset: number) {
    let x = event.coordinates[0];
    x = event.isEnter ? x + testLineOffset : x - testLineOffset;

    // a=1, b=0, c=-x
    const [polyX, polyY] = (event.mono.segment as QuadraticBezier).getPolynomial();
    const tPoly = Polynomial.add(polyX, [-x]);
    const tRoots = Polynomial.roots(tPoly).filter(Type.isNumber);
    const epsilon = optioner.options.epsilon;

    for (const t of tRoots) {
        if (Maths.between(t, 0, 1, false, false, epsilon)) {
            return Polynomial.evaluate(polyY, t);
        }
    }

    throw new Error("[G]The segment is too tiny to intersect with.");
}
function quickBezierY(event: SweepEvent, testLineOffset: number) {
    let x = event.coordinates[0];
    x = event.isEnter ? x + testLineOffset : x - testLineOffset;

    // a=1, b=0, c = -x
    const [polyX, polyY] = (event.mono.segment as Bezier).getPolynomial();
    const tPoly = Polynomial.add(polyX, [-x]);
    const tRoots = Polynomial.roots(tPoly).filter(Type.isNumber);
    const epsilon = optioner.options.epsilon;

    for (const t of tRoots) {
        if (Maths.between(t, 0, 1, false, false, epsilon)) {
            return Polynomial.evaluate(polyY, t);
        }
    }
    throw new Error("[G]The segment is too tiny to intersect with.");
}
function quickArcY(event: SweepEvent, testLineOffset: number) {
    let x = event.coordinates[0];
    x = event.isEnter ? x + testLineOffset : x - testLineOffset;

    // a=1, b=0, c = -x
    const arc = event.mono.segment as Arc;
    const { radiusX: rx, radiusY: ry, rotation: phi, positive } = arc;
    const [cx, cy] = arc.getCenterPoint().coordinates;
    const [sa, ea] = arc.getStartEndAngles();
    const cosPhi = Maths.cos(phi);
    const sinPhi = Maths.sin(phi);
    // coefs of parametric equation of `ellipse`
    const [px1, px2, px3] = [rx * cosPhi, -ry * sinPhi, cx]; // $[\cos(\theta),\sin(\theta),1]$
    const [py1, py2, py3] = [rx * sinPhi, ry * cosPhi, cy]; // $[\cos(\theta),\sin(\theta),1]$
    const tPoly = [-x + (-px1 + px3), 2 * px2, -x + (px1 + px3)];
    //@see https://en.wikipedia.org/wiki/Tangent_half-angle_substitution#Geometry
    if (tPoly[0] === 0) {
        const cosPi = Maths.cos(Maths.PI);
        const sinPi = Maths.sin(Maths.PI);
        const y = py1 * cosPi + py2 * sinPi + py3;
        return y;
    }
    const tRoots = Polynomial.roots(tPoly).filter(Type.isNumber);
    const epsilon = optioner.options.epsilon;
    for (const t of tRoots) {
        const cosTheta = (1 - t ** 2) / (1 + t ** 2);
        const sinTheta = (2 * t) / (1 + t ** 2);
        const a = Angle.simplify(Maths.atan2(sinTheta, cosTheta));
        if (Angle.between(a, sa, ea, positive, false, false, epsilon)) {
            return py1 * cosTheta + py2 * sinTheta + py3;
        }
    }
    throw new Error("[G]The segment is too tiny to intersect with.");
}
