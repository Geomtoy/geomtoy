import { Angle, Box, Coordinates, Float, Maths, Vector2 } from "@geomtoy/util";
import Arc from "../geometries/basic/Arc";
import Bezier from "../geometries/basic/Bezier";
import Line from "../geometries/basic/Line";
import LineSegment from "../geometries/basic/LineSegment";
import Point from "../geometries/basic/Point";
import QuadraticBezier from "../geometries/basic/QuadraticBezier";
import Ray from "../geometries/basic/Ray";
import { eps } from "../geomtoy";
import LineArc from "../intersection/classes/LineArc";
import LineBezier from "../intersection/classes/LineBezier";
import LineLineSegment from "../intersection/classes/LineLineSegment";
import LineQuadraticBezier from "../intersection/classes/LineQuadraticBezier";
import RayArc from "../intersection/classes/RayArc";
import RayBezier from "../intersection/classes/RayBezier";
import RayLineSegment from "../intersection/classes/RayLineSegment";
import RayQuadraticBezier from "../intersection/classes/RayQuadraticBezier";
import { getCoordinates } from "../misc/point-like";
import { BasicSegment } from "../types";

export default class FillRuleHelper {
    // line touching box vertex is also consider colliding.
    private _lineCollideBox(line: Line, box: [number, number, number, number]) {
        const [a, b, c] = line.getImplicitFunctionCoefs();
        const minX = Box.minX(box);
        const maxX = Box.maxX(box);
        const minY = Box.minY(box);
        const maxY = Box.maxY(box);
        const sign1 = Float.sign(a * minX + b * minY + c, eps.epsilon);
        const sign2 = Float.sign(a * maxX + b * minY + c, eps.epsilon);
        const sign3 = Float.sign(a * minX + b * maxY + c, eps.epsilon);
        const sign4 = Float.sign(a * maxX + b * maxY + c, eps.epsilon);

        if ((sign1 === 1 && sign2 === 1 && sign3 === 1 && sign4 === 1) || (sign1 === -1 && sign2 === -1 && sign3 === -1 && sign4 === -1)) {
            return false;
        }
        return true;
    }
    // ray touching box vertex is also consider colliding.
    private _rayCollideBox(ray: Ray, box: [number, number, number, number]) {
        const [dx, dy] = Vector2.from2(ray.angle, 1);
        const [x, y] = ray.coordinates;

        const minX = Box.minX(box);
        const maxX = Box.maxX(box);
        const minY = Box.minY(box);
        const maxY = Box.maxY(box);

        //@see https://tavianator.com/2015/ray_box_nan.html
        // But we need the touching situation, and `NaN` should always be handle first.
        // It shouldn't be done with a trick that's hard to understand,
        // so the readability of the code will be greatly reduced, although performance may be improved.
        if (dx === 0 && (minX === x || maxX === x)) return true; // handle 0/0 = NaN
        if (dy === 0 && (minY === y || maxY === y)) return true; // handle 0/0 = NaN

        const tMinX = (minX - x) / dx;
        const tMaxX = (maxX - x) / dx;
        const tMinY = (minY - y) / dy;
        const tMaxY = (maxY - y) / dy;

        const tMin = Maths.max(Maths.min(tMinX, tMaxX), Maths.min(tMinY, tMaxY));
        const tMax = Maths.min(Maths.max(tMinX, tMaxX), Maths.max(tMinY, tMaxY));
        return tMax >= Maths.max(tMin, 0);
    }

    windingNumberOfPoint(point: [number, number] | Point, angle: number, segments: BasicSegment[]) {
        const coordinates = getCoordinates(point, "point");

        const ray = new Ray(coordinates, angle);
        const rv = Vector2.from2(angle, 1);

        let wn = 0;
        for (let i = 0, l = segments.length; i < l; i++) {
            const seg = segments[i];
            if (!this._rayCollideBox(ray, seg.getBoundingBox())) continue;
            const intersection: { c: [number, number]; t2?: number; a2?: number; m?: number }[] =
                seg instanceof LineSegment
                    ? new RayLineSegment(ray, seg).properIntersection()
                    : seg instanceof Bezier
                    ? new RayBezier(ray, seg).properIntersection()
                    : seg instanceof QuadraticBezier
                    ? new RayQuadraticBezier(ray, seg).properIntersection()
                    : new RayArc(ray, seg).properIntersection();

            for (const inter of intersection) {
                const { t2 = NaN, a2 = NaN, m = NaN, c } = inter;
                // point is on
                if (Coordinates.equalTo(c, coordinates, eps.epsilon)) return undefined;
                // exclude touching point
                if (m % 2 === 0) continue;

                const v = seg instanceof Arc ? seg.getTangentVectorAtAngle(a2).coordinates : seg.getTangentVectorAtTime(t2).coordinates;
                let cp = Vector2.cross(rv, v);
                // Since we have ruled out the case of touching, why is `cp` still 0 here?
                // Because the determination of crossing is odd multiplicity, but the odd multiplicity greater than 3 is both transversal and tangential.
                // Although this situation is rarely encountered naturally, unless deliberately, we still have to deal with it.
                // Here we do some trick, add a epsilon and push a little bit in the direction of the curve to avoid `cp` being 0 to determine the direction.
                if (cp === 0) {
                    seg instanceof Arc
                        ? seg.getTangentVectorAtAngle(a2 + (seg.positive ? eps.angleEpsilon : -eps.angleEpsilon)).coordinates
                        : seg.getTangentVectorAtTime(t2 + eps.timeEpsilon).coordinates;
                    cp = Vector2.cross(rv, v);
                }
                const positiveWinding = cp > 0;

                if (seg instanceof Arc) {
                    const [sa, ea] = seg.getStartEndAngles();
                    // If `ray` happens to cross the vertex, count as a half.
                    if (Angle.equalTo(a2, sa, eps.angleEpsilon) || Angle.equalTo(a2, ea, eps.angleEpsilon)) wn += positiveWinding ? 0.5 : -0.5;
                    else wn += positiveWinding ? 1 : -1;
                } else {
                    // If `ray` happens to cross the vertex, count as a half.
                    if (Float.equalTo(t2, 0, eps.timeEpsilon) || Float.equalTo(t2, 1, eps.timeEpsilon)) wn += positiveWinding ? 0.5 : -0.5;
                    else wn += positiveWinding ? 1 : -1;
                }
            }
        }
        // floor towards 0, ray happened to coincident with one of `segments`, point is on
        if ((wn | 0) !== wn) return undefined;
        return wn;
    }

    crossingNumberOfPoint(point: [number, number] | Point, angle: number, segments: BasicSegment[]) {
        const coordinates = getCoordinates(point, "point");

        const ray = new Ray(coordinates, angle);

        let cn = 0;
        for (let i = 0, l = segments.length; i < l; i++) {
            const seg = segments[i];
            if (!this._rayCollideBox(ray, seg.getBoundingBox())) continue;
            const intersection: { c: [number, number]; t2?: number; a2?: number; m?: number }[] =
                seg instanceof LineSegment
                    ? new RayLineSegment(ray, seg).properIntersection()
                    : seg instanceof Bezier
                    ? new RayBezier(ray, seg).properIntersection()
                    : seg instanceof QuadraticBezier
                    ? new RayQuadraticBezier(ray, seg).properIntersection()
                    : new RayArc(ray, seg).properIntersection();

            for (const inter of intersection) {
                const { t2 = NaN, a2 = NaN, m = NaN, c } = inter;
                // point is on
                if (Coordinates.equalTo(c, coordinates, eps.epsilon)) return undefined;
                // exclude touching point
                if (m % 2 === 0) continue;

                if (seg instanceof Arc) {
                    const [sa, ea] = seg.getStartEndAngles();
                    // If `ray` happens to cross the vertex, count as a half.
                    if (Angle.equalTo(a2, sa, eps.angleEpsilon) || Angle.equalTo(a2, ea, eps.angleEpsilon)) cn += 0.5;
                    else cn += 1;
                } else {
                    // If `ray` happens to cross the vertex, count as a half.
                    if (Float.equalTo(t2, 0, eps.timeEpsilon) || Float.equalTo(t2, 1, eps.timeEpsilon)) cn += 0.5;
                    else cn += 1;
                }
            }
        }
        // floor towards 0, ray happened to coincident with one of `segments`, point is on
        if ((cn | 0) !== cn) return undefined;
        return cn;
    }

    // #region For segment fill annotation
    /**
     * @memo
     * This is used to help determine the segment fill annotation.
     *
     * The assumption here is that from a selected point on the segment,
     * two rays are emitted in a PRD(positive rotation directions) and a NRD(negative rotation directions) of the segment, respectively.
     *
     * So the first question is what is the PRD and the NRD of the segment?
     *
     * PRD: A angle interval positively rotating from the tangent angle at the selected point to the opposite angle of it.
     * i.e If the tangent angle is 0, $(0,\pi)$ in positive rotation or $(\pi,0)$ in negative rotation is PRD.
     *
     * NRD: A angle interval negatively rotating from the tangent angle at the selected point to the opposite angle of it.
     * i.e If the tangent angle is $\frac{\pi}{2}$, $(-\frac{\pi}{2}, \frac{\pi}{2})$ in positive rotation or $(\frac{\pi}{2}, -\frac{\pi}{2})$ in negative rotation is NRD.
     *
     * What can these things do?
     * It is mainly used to determine whether there is a fill for `gg`=general geometries in the PRD or the NRD of the segment.
     * The way to determine fill here is still using the fill rule, but we make an assumption.
     * We can assume that we have a point very close to the selected point in the PRD, if it is inside `ag`,
     * it means that the PRD of the segment is filled for `ag`.
     * similarly, we can also assume that we have a point very close to the selected point in the NRD, if it is inside `ag`,
     * it means that the NRD of the segment is filled for `ag`.
     *
     * Of course, we can choose any angle in the PRD and the NRD, but here we choose the simplest - tangent angle ± $\frac{\pi}{2}$,
     * they can also be combined as a line to improve the efficiency of intersection.
     */

    private _rayAngleAndCoordinates(segment: BasicSegment) {
        let angle;
        let point;
        const middle = 0.5;
        if (segment instanceof LineSegment || segment instanceof Bezier || segment instanceof QuadraticBezier) {
            angle = segment.getTangentVectorAtTime(middle).angle; // middle time
            point = segment.getPointAtTime(middle).coordinates;
        } else {
            const [sa, ea] = segment.getStartEndAngles();
            const positive = segment.positive;
            const ma = Angle.fraction(sa, ea, positive, middle); // middle angle
            angle = segment.getTangentVectorAtAngle(ma).angle;
            point = segment.getPointAtAngle(ma).coordinates;
        }
        return [angle, point] as [number, [number, number]];
    }

    windingNumbersOfSegment(segment: BasicSegment, segments: BasicSegment[] | { segment: BasicSegment }[]) {
        const [angle, coordinates] = this._rayAngleAndCoordinates(segment);
        const pra = angle + Maths.PI / 2; // positive ray angle
        const line = Line.fromPointAndAngle(coordinates, pra);
        const prv = Vector2.from2(pra, 1);

        const wn = { positive: 0, negative: 0 };

        for (let i = 0, l = segments.length; i < l; i++) {
            const seg = (segments[i] as any)?.segment || segments[i];
            if (!this._lineCollideBox(line, seg.getBoundingBox())) continue;

            const intersection: { c: [number, number]; t2?: number; a2?: number; m?: number }[] =
                seg instanceof LineSegment
                    ? new LineLineSegment(line, seg).properIntersection()
                    : seg instanceof Bezier
                    ? new LineBezier(line, seg).properIntersection()
                    : seg instanceof QuadraticBezier
                    ? new LineQuadraticBezier(line, seg).properIntersection()
                    : new LineArc(line, seg).properIntersection();

            for (const inter of intersection) {
                const { t2 = NaN, a2 = NaN, m = NaN, c } = inter;
                // the coordinate itself
                if (Coordinates.equalTo(coordinates, c, eps.epsilon)) continue;
                // exclude touching points
                if (m % 2 === 0) continue;

                const onWhichRay = Vector2.dot(prv, Vector2.from(coordinates, c)) > 0 ? "positive" : "negative";

                const v = seg instanceof Arc ? seg.getTangentVectorAtAngle(a2).coordinates : seg.getTangentVectorAtTime(t2).coordinates;
                let cp = Vector2.cross(prv, v);
                // Since we have ruled out the case of touching, why is `cp` still 0 here?
                // Because the determination of crossing is odd multiplicity, but the odd multiplicity greater than 3 is both transversal and tangential.
                // Although this situation is rarely encountered naturally, unless deliberately, we still have to deal with it.
                // Here we do some trick, add a epsilon and push a little bit in the direction of the curve to avoid `cp` being 0 to determine the direction.
                if (cp === 0) {
                    seg instanceof Arc
                        ? seg.getTangentVectorAtAngle(a2 + (seg.positive ? eps.angleEpsilon : -eps.angleEpsilon)).coordinates
                        : seg.getTangentVectorAtTime(t2 + eps.timeEpsilon).coordinates;
                    cp = Vector2.cross(prv, v);
                }
                const positiveWinding = cp > 0;

                if (seg instanceof Arc) {
                    const [sa, ea] = seg.getStartEndAngles();
                    // If `ray` happens to cross the vertex, count as a half(there must be another half).
                    if (Angle.equalTo(a2, sa, eps.angleEpsilon) || Angle.equalTo(a2, ea, eps.angleEpsilon)) wn[onWhichRay] += positiveWinding ? 0.5 : -0.5;
                    else wn[onWhichRay] += positiveWinding ? 1 : -1;
                } else {
                    // If `ray` happens to cross the vertex, count as a half(there must be another half).
                    if (Float.equalTo(t2, 0, eps.timeEpsilon) || Float.equalTo(t2, 1, eps.timeEpsilon)) wn[onWhichRay] += positiveWinding ? 0.5 : -0.5;
                    else wn[onWhichRay] += positiveWinding ? 1 : -1;
                }
            }
        }
        return wn;
    }

    crossingNumbersOfSegment(segment: BasicSegment, segments: BasicSegment[] | { segment: BasicSegment }[]) {
        const [angle, coordinates] = this._rayAngleAndCoordinates(segment);
        const pra = angle + Maths.PI / 2; // positive ray angle
        const line = Line.fromPointAndAngle(coordinates, pra);
        const prv = Vector2.from2(pra, 1);

        const cn = { positive: 0, negative: 0 };

        for (let i = 0, l = segments.length; i < l; i++) {
            const seg = (segments[i] as any)?.segment || segments[i];
            // getBoundingBox is all stated by the segment themselves
            if (!this._lineCollideBox(line, seg.getBoundingBox())) continue;

            const intersection: { c: [number, number]; t2?: number; a2?: number; m?: number }[] =
                seg instanceof LineSegment
                    ? new LineLineSegment(line, seg).properIntersection()
                    : seg instanceof Bezier
                    ? new LineBezier(line, seg).properIntersection()
                    : seg instanceof QuadraticBezier
                    ? new LineQuadraticBezier(line, seg).properIntersection()
                    : new LineArc(line, seg).properIntersection();

            for (const inter of intersection) {
                const { t2 = NaN, a2 = NaN, m = NaN, c } = inter;

                // the coordinate itself
                if (Coordinates.equalTo(coordinates, c, eps.epsilon)) continue;
                // exclude the touching points
                if (m % 2 === 0) continue;

                const onWhichRay = Vector2.dot(prv, Vector2.from(coordinates, c)) > 0 ? "positive" : "negative";

                if (seg instanceof Arc) {
                    const [sa, ea] = seg.getStartEndAngles();
                    // If `ray` happens to cross the vertex, count as a half(there must be another half).
                    if (Angle.equalTo(a2, sa, eps.angleEpsilon) || Angle.equalTo(a2, ea, eps.angleEpsilon)) cn[onWhichRay] += 0.5;
                    else cn[onWhichRay] += 1;
                } else {
                    // If `ray` happens to cross the vertex, count as a half(there must be another half).
                    if (Float.equalTo(t2, 0, eps.timeEpsilon) || Float.equalTo(t2, 1, eps.timeEpsilon)) cn[onWhichRay] += 0.5;
                    else cn[onWhichRay] += 1;
                }
            }
        }
        return cn;
    }
    // #endregion
}
