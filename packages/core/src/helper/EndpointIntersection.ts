import { Maths, Utility, Vector2 } from "@geomtoy/util";
import Arc from "../geometries/basic/Arc";
import Bezier from "../geometries/basic/Bezier";
import LineSegment from "../geometries/basic/LineSegment";
import QuadraticBezier from "../geometries/basic/QuadraticBezier";
import Ray from "../geometries/basic/Ray";
import ArcArc from "../relationship/classes/ArcArc";
import BezierBezier from "../relationship/classes/BezierBezier";
import QuadraticBezierQuadraticBezier from "../relationship/classes/QuadraticBezierQuadraticBezier";
import RayArc from "../relationship/classes/RayArc";
import RayBezier from "../relationship/classes/RayBezier";
import RayQuadraticBezier from "../relationship/classes/RayQuadraticBezier";
import type { BasicSegment } from "../types";

const TEST_RAY_OFFSET = 2 ** -22;

// Determine a intersection at endpoint is crossing or touching.
// This is maybe a expensive work, for we are not only handle the line segment.

// Change name to VertexIntersection
export default class EndpointIntersection {
    private _segmentData(segment: BasicSegment, inOrOut: "in" | "out") {
        // prettier-ignore
        const param = inOrOut === "in"
         ? (segment instanceof Arc ? segment.getStartEndAngles()[1] : 1) 
         : (segment instanceof Arc ? segment.getStartEndAngles()[0] : 0);

        let vec = (segment instanceof Arc ? segment.getTangentVectorAtAngle(param) : segment.getTangentVectorAtTime(param)).coordinates;
        // reverse the vector respect to the intersecting point
        if (inOrOut === "in") vec = Vector2.negative(vec);
        return {
            segment,
            inOrOut,
            isLinear: this._isLinear(segment),
            param,
            vec
        };
    }

    private _isLinear(segment: BasicSegment): segment is LineSegment {
        if (segment instanceof LineSegment) return true;
        if (segment instanceof Bezier || segment instanceof QuadraticBezier) {
            const dg = segment.degenerate(false);
            return dg instanceof LineSegment;
        }
        return false;
    }

    private _rayRotation(intersection: [number, number], p1: ReturnType<typeof this._segmentData>, p2: ReturnType<typeof this._segmentData>, curvatureRotationResult: number) {
        if (curvatureRotationResult !== -2 && curvatureRotationResult !== 2) throw new Error("[G]In case, we are stupid.");
        const tangentAngle = Vector2.angle(p1.vec); // angle of p2.vec is the same
        const normalAngle = tangentAngle + (Maths.sign(curvatureRotationResult) * Maths.PI) / 2;
        const rayCoordinates = Vector2.add(intersection, Vector2.from2(normalAngle, TEST_RAY_OFFSET));
        const ray = new Ray(rayCoordinates, tangentAngle);

        // p1.segment and p2.segment should never be `LineSegment`.
        if (p1.segment instanceof LineSegment) throw new Error("[G]Impossible.");
        if (p2.segment instanceof LineSegment) throw new Error("[G]Impossible.");

        // maybe redundant
        if (p1.segment instanceof Bezier && p2.segment instanceof Bezier) {
            if (new BezierBezier(p1.segment, p2.segment).onSameTrajectory()) return 0;
        }
        if (p1.segment instanceof QuadraticBezier && p2.segment instanceof QuadraticBezier) {
            if (new QuadraticBezierQuadraticBezier(p1.segment, p2.segment).onSameTrajectory()) return 0;
        }
        if (p1.segment instanceof Arc && p2.segment instanceof Arc) {
            if (new ArcArc(p1.segment, p2.segment).onSameTrajectory()) return 0;
        }

        const inter1 = (p1.segment instanceof Bezier ? new RayBezier(ray, p1.segment) : p1.segment instanceof QuadraticBezier ? new RayQuadraticBezier(ray, p1.segment) : new RayArc(ray, p1.segment))
            .intersection()
            .map(i => ({ c: i.c, w: 1 }));
        const inter2 = (p2.segment instanceof Bezier ? new RayBezier(ray, p2.segment) : p2.segment instanceof QuadraticBezier ? new RayQuadraticBezier(ray, p2.segment) : new RayArc(ray, p2.segment))
            .intersection()
            .map(i => ({ c: i.c, w: 2 }));

        if (inter1.length === 0) throw new Error("[G]The segment is too tiny to intersect with.");
        if (inter2.length === 0) throw new Error("[G]The segment is too tiny to intersect with.");

        const inters = Utility.sortBy([...inter1, ...inter2], [i => Vector2.squaredMagnitude(Vector2.from(rayCoordinates, i.c))]);
        if (inters[0].w === 1) {
            return -(curvatureRotationResult / 2) as 1 | -1;
        } else {
            return (curvatureRotationResult / 2) as 1 | -1;
        }
    }

    /**
     * Rotation base on cross&dot product
     * @description
     * Return values:
    // - "1": positive rotation, angle from `p1` to `p2` in $(0,\pi]$
    // - "-1": negative rotation, angle from `p1` to `p2` in $(-\pi,0)$
    // - "0": zero rotation, angle from `p1` to `p2` is 0, need `_curvatureRotation``
     * @param p1
     * @param p2
     */
    private _vectorRotation(p1: ReturnType<typeof this._segmentData>, p2: ReturnType<typeof this._segmentData>) {
        const cp = Vector2.cross(p1.vec, p2.vec);
        const dp = Vector2.dot(p1.vec, p2.vec);
        return cp === 0 ? (dp > 0 ? 0 : 1) : cp > 0 ? 1 : -1;
    }
    /**
     * When `_vectorRotation` == 0, do this
     * @description
     * Return values:
     * - "1": positive rotation
     * - "-1": positive rotation
     * - "2": When `_vectorRotation` == 0 and curvatures are all positive, need `_rayRotation`
     * - "-2": When `_vectorRotation` == 0 and curvatures are all negative, need `_rayRotation`
     * @param p1
     * @param p2
     * @param vectorRotationResult
     */
    private _curvatureRotation(p1: ReturnType<typeof this._segmentData>, p2: ReturnType<typeof this._segmentData>, vectorRotationResult: number) {
        if (vectorRotationResult !== 0) throw new Error("[G]In case, we are stupid.");

        // triple lines bezier and double lines quadratic bezier?
        let curvature1 = !p1.isLinear ? (p1.segment instanceof Arc ? p1.segment.getCurvatureAtAngle(p1.param) : p1.segment.getCurvatureAtTime(p1.param)) : 0;
        let curvature2 = !p2.isLinear ? (p2.segment instanceof Arc ? p2.segment.getCurvatureAtAngle(p2.param) : p2.segment.getCurvatureAtTime(p2.param)) : 0;
        if (p1.inOrOut === "in") curvature1 = -curvature1; // reverse curvature1 for vector is reversed
        if (p2.inOrOut === "in") curvature2 = -curvature2; // reverse curvature1 for vector is reversed
        const c1Sign = Maths.sign(curvature1);
        const c2Sign = Maths.sign(curvature2);
        // do not use curvature1 * curvature2, it may underflow

        if (c1Sign === 0 && c2Sign === 0) {
            return vectorRotationResult; //0, they are all linear, we can do nothing about it.
        }
        if (c1Sign === 0 && c2Sign > 0) {
            return 1;
        }
        if (c1Sign === 0 && c2Sign < 0) {
            return -1;
        }
        if (c1Sign > 0 && c2Sign === 0) {
            return -1;
        }
        if (c1Sign < 0 && c2Sign === 0) {
            return 1;
        }
        if (c1Sign > 0 && c2Sign > 0) {
            return 2; // we can not determine, need `_rayRotation`
        }
        if (c1Sign < 0 && c2Sign < 0) {
            return -2; // we can not determine, need `_rayRotation`
        }
        if (c1Sign < 0 && c2Sign > 0) {
            return 1;
        }
        if (c1Sign > 0 && c2Sign < 0) {
            return -1;
        }
        throw new Error("[G]Impossible.");
    }

    private _rotation(intersection: [number, number], p1: ReturnType<typeof this._segmentData>, p2: ReturnType<typeof this._segmentData>) {
        let p1ToP2 = this._vectorRotation(p1, p2);
        if (p1ToP2 !== 0) return p1ToP2;
        p1ToP2 = this._curvatureRotation(p1, p2, p1ToP2);
        if (p1ToP2 !== -2 && p1ToP2 !== 2) return p1ToP2;
        p1ToP2 = this._rayRotation(intersection, p1, p2, p1ToP2);
        return p1ToP2;
    }

    determine(intersection: [number, number], aInSegment: BasicSegment, aOutSegment: BasicSegment, bInSegment: BasicSegment, bOutSegment: BasicSegment) {
        const aInData = this._segmentData(aInSegment, "in");
        const aOutData = this._segmentData(aOutSegment, "out");
        const bInData = this._segmentData(bInSegment, "in");
        const bOutData = this._segmentData(bOutSegment, "out");

        const aInToBIn = this._rotation(intersection, aInData, bInData);
        const aInToBOut = this._rotation(intersection, aInData, bOutData);
        const aOutToBIn = this._rotation(intersection, aOutData, bInData);
        const aOutToBOut = this._rotation(intersection, aOutData, bOutData);
        const aInToAOut = this._rotation(intersection, aInData, aOutData);
        const bIntoBOut = this._rotation(intersection, bInData, bOutData);

        if (aInToBIn === 0 || aInToBOut === 0 || aOutToBIn === 0 || aOutToBOut === 0) return "coincide";
        // now aInToBIn, aInToBOut, aOutToBIn, aOutToBOut !== 0
        if (aInToAOut === 0 || bIntoBOut === 0) return "touch";
        // all non-zero now
        // Draw a picture to comprehend this:
        // When bIntoBOut === 1, the interval between them is  xxToBin === -1 && xxToBout === 1
        // When bIntoBOut === -1,the interval between them is  xxToBin === 1 && xxToBout === -1
        // prettier-ignore
        return (
            (aInToBIn === -bIntoBOut && aInToBOut === bIntoBOut)
            !== 
            (aOutToBIn === -bIntoBOut && aOutToBOut === bIntoBOut)
            ? "cross" :"touch"
        );
    }
}
