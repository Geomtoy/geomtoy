import { Angle, Box, Coordinates, Maths, Vector2 } from "@geomtoy/util";
import Line from "../geometries/basic/Line";
import Ray from "../geometries/basic/Ray";
import LineSegment from "../geometries/basic/LineSegment";
import QuadraticBezier from "../geometries/basic/QuadraticBezier";
import Bezier from "../geometries/basic/Bezier";
import Arc from "../geometries/basic/Arc";
import LineLineSegment from "../relationship/classes/LineLineSegment";
import LineBezier from "../relationship/classes/LineBezier";
import LineQuadraticBezier from "../relationship/classes/LineQuadraticBezier";
import LineArc from "../relationship/classes/LineArc";
import RayLineSegment from "../relationship/classes/RayLineSegment";
import RayQuadraticBezier from "../relationship/classes/RayQuadraticBezier";
import RayBezier from "../relationship/classes/RayBezier";
import RayArc from "../relationship/classes/RayArc";
import Point from "../geometries/basic/Point";
import { optioner } from "../geomtoy";
import { getCoordinates } from "../misc/point-like";

export default class FillRuleHelper {
    // line touch box is also consider colliding.
    private _lineCollideBox(line: Line, box: [number, number, number, number]) {
        const epsilon = optioner.options.epsilon;
        const [a, b, c] = line.getImplicitFunctionCoefs();
        const minX = Box.minX(box);
        const maxX = Box.maxX(box);
        const minY = Box.minY(box);
        const maxY = Box.maxY(box);
        const sign1 = Maths.sign(a * minX + b * minY + c, epsilon);
        const sign2 = Maths.sign(a * maxX + b * minY + c, epsilon);
        const sign3 = Maths.sign(a * minX + b * maxY + c, epsilon);
        const sign4 = Maths.sign(a * maxX + b * maxY + c, epsilon);

        if ((sign1 === 1 && sign2 === 1 && sign3 === 1 && sign4 === 1) || (sign1 === -1 && sign2 === -1 && sign3 === -1 && sign4 === -1)) {
            return false;
        }
        return true;
    }
    // ray touch box is also consider colliding.
    private _rayCollideBox(ray: Ray, box: [number, number, number, number]) {
        const epsilon = optioner.options.epsilon;
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
        return !Maths.lessThan(tMax, Maths.max(tMin, 0), epsilon);
    }

    windingNumberOfPoint(point: [number, number] | Point, angle: number, segments: (LineSegment | Arc | Bezier | QuadraticBezier)[], preventOn = true) {
        const epsilon = optioner.options.epsilon;
        const coordinates = getCoordinates(point, "point");

        const ray = new Ray(coordinates, angle);
        const rv = Vector2.from2(angle, 1);

        let wn = 0;
        for (let i = 0, l = segments.length; i < l; i++) {
            const seg = segments[i];
            if (!this._rayCollideBox(ray, seg.getBoundingBox())) continue;
            const intersection: { c: [number, number]; t2?: number; a2?: number; m?: number }[] =
                seg instanceof LineSegment
                    ? new RayLineSegment(ray, seg).intersection()
                    : seg instanceof Bezier
                    ? new RayBezier(ray, seg).intersection()
                    : seg instanceof QuadraticBezier
                    ? new RayQuadraticBezier(ray, seg).intersection()
                    : new RayArc(ray, seg).intersection();

            for (const inter of intersection) {
                const { t2 = NaN, a2 = NaN, m = NaN, c } = inter;
                if (Coordinates.isEqualTo(c, coordinates)) {
                    if (preventOn) return undefined;
                    continue;
                }
                // exclude touching point
                if (m % 2 === 0) continue;

                let v = seg instanceof Arc ? seg.getTangentVectorAtAngle(a2).coordinates : seg.getTangentVectorAtTime(t2).coordinates;
                let cp = Vector2.cross(rv, v);
                // Since we have ruled out the case of touching, why is `cp` still 0 here?
                // Because the determination of crossing is odd multiplicity, but the odd multiplicity greater than 3 is both transversal and tangential.
                // Although this situation is rarely encountered naturally, unless deliberately, we still have to deal with it.
                // Here we do some trick, add a epsilon and push a little bit in the direction of the curve to avoid `cp` being 0 to determine the direction.
                if (cp === 0) {
                    seg instanceof Arc ? seg.getTangentVectorAtAngle(a2 + (seg.positive ? epsilon : -epsilon)).coordinates : seg.getTangentVectorAtTime(t2 + epsilon).coordinates;
                    cp = Vector2.cross(rv, v);
                }
                const positiveWinding = cp > 0;

                if (seg instanceof Arc) {
                    const [sa, ea] = seg.getStartEndAngles();
                    // If `ray` happens to cross the vertex, count as a half(there must be another half).
                    if (Angle.equalTo(a2, sa, epsilon) || Angle.equalTo(a2, ea, epsilon)) wn += positiveWinding ? 0.5 : -0.5;
                    else wn += positiveWinding ? 1 : -1;
                } else {
                    // If `ray` happens to cross the vertex, count as a half(there must be another half).
                    if (Maths.equalTo(t2, 0, epsilon) || Maths.equalTo(t2, 1, epsilon)) wn += positiveWinding ? 0.5 : -0.5;
                    else wn += positiveWinding ? 1 : -1;
                }
            }
        }
        return wn;
    }

    crossingNumberOfPoint(point: [number, number] | Point, angle: number, segments: (LineSegment | Arc | Bezier | QuadraticBezier)[], preventOn = true) {
        const epsilon = optioner.options.epsilon;
        const coordinates = getCoordinates(point, "point");

        const ray = new Ray(coordinates, angle);

        let cn = 0;
        for (let i = 0, l = segments.length; i < l; i++) {
            const seg = segments[i];
            if (!this._rayCollideBox(ray, seg.getBoundingBox())) continue;
            const intersection: { c: [number, number]; t2?: number; a2?: number; m?: number }[] =
                seg instanceof LineSegment
                    ? new RayLineSegment(ray, seg).intersection()
                    : seg instanceof Bezier
                    ? new RayBezier(ray, seg).intersection()
                    : seg instanceof QuadraticBezier
                    ? new RayQuadraticBezier(ray, seg).intersection()
                    : new RayArc(ray, seg).intersection();

            for (const inter of intersection) {
                const { t2 = NaN, a2 = NaN, m = NaN, c } = inter;
                if (Coordinates.isEqualTo(c, coordinates)) {
                    if (preventOn) return undefined;
                    continue;
                }
                // exclude touching point
                if (m % 2 === 0) continue;

                if (seg instanceof Arc) {
                    const [sa, ea] = seg.getStartEndAngles();
                    // If `ray` happens to cross the vertex, count as a half(there must be another half).
                    if (Angle.equalTo(a2, sa, epsilon) || Angle.equalTo(a2, ea, epsilon)) cn += 0.5;
                    else cn += 1;
                } else {
                    // If `ray` happens to cross the vertex, count as a half(there must be another half).
                    if (Maths.equalTo(t2, 0, epsilon) || Maths.equalTo(t2, 1, epsilon)) cn += 0.5;
                    else cn += 1;
                }
            }
        }
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
     * It is mainly used to determine whether there is a fill for `ag`=advanced geometries in the PRD or the NRD of the segment.
     * The way to determine fill here is still using the fill rule, but we make an assumption.
     * We can assume that we have a point very close to the selected point in the PRD, if it is inside `ag`,
     * it means that the PRD of the segment is filled for `ag`.
     * similarly, we can also assume that we have a point very close to the selected point in the NRD, if it is inside `ag`,
     * it means that the NRD of the segment is filled for `ag`.
     *
     * Of course, we can choose any angle in the PRD and the NRD, but here we choose the simplest - tangent angle ± $\frac{\pi}{2}$,
     * they can also be combined as a line to improve the efficiency of intersection.
     */

    private _rayAngleAndCoordinates(segment: LineSegment | Arc | Bezier | QuadraticBezier) {
        let angle, point;
        if (segment instanceof LineSegment || segment instanceof Bezier || segment instanceof QuadraticBezier) {
            const mt = 0.5; // middle time
            angle = segment.getTangentVectorAtTime(mt).angle;
            point = segment.getPointAtTime(mt).coordinates;
        } else {
            const [sa, ea] = segment.getStartEndAngles();
            const positive = segment.positive;
            const ma = Angle.middle(sa, ea, positive); // middle angle
            angle = segment.getTangentVectorAtAngle(ma).angle;
            point = segment.getPointAtAngle(ma).coordinates;
        }
        return [angle, point] as [number, [number, number]];
    }

    windingNumbersOfSegment(
        segment: LineSegment | Arc | Bezier | QuadraticBezier,
        segments: (LineSegment | Arc | Bezier | QuadraticBezier)[] | { segment: LineSegment | Arc | Bezier | QuadraticBezier }[]
    ) {
        const epsilon = optioner.options.epsilon;
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
                    ? new LineLineSegment(line, seg).intersection()
                    : seg instanceof Bezier
                    ? new LineBezier(line, seg).intersection()
                    : seg instanceof QuadraticBezier
                    ? new LineQuadraticBezier(line, seg).intersection()
                    : new LineArc(line, seg).intersection();

            for (const inter of intersection) {
                const { t2 = NaN, a2 = NaN, m = NaN, c } = inter;
                // the coordinate itself
                if (Coordinates.isEqualTo(coordinates, c, epsilon)) continue;
                // exclude touching points
                if (m % 2 === 0) continue;

                const onWhichRay = Vector2.dot(prv, Vector2.from(coordinates, c)) > 0 ? "positive" : "negative";

                let v = seg instanceof Arc ? seg.getTangentVectorAtAngle(a2).coordinates : seg.getTangentVectorAtTime(t2).coordinates;
                let cp = Vector2.cross(prv, v);
                // Since we have ruled out the case of touching, why is `cp` still 0 here?
                // Because the determination of crossing is odd multiplicity, but the odd multiplicity greater than 3 is both transversal and tangential.
                // Although this situation is rarely encountered naturally, unless deliberately, we still have to deal with it.
                // Here we do some trick, add a epsilon and push a little bit in the direction of the curve to avoid `cp` being 0 to determine the direction.
                if (cp === 0) {
                    seg instanceof Arc ? seg.getTangentVectorAtAngle(a2 + (seg.positive ? epsilon : -epsilon)).coordinates : seg.getTangentVectorAtTime(t2 + epsilon).coordinates;
                    cp = Vector2.cross(prv, v);
                }
                const positiveWinding = cp > 0;

                if (seg instanceof Arc) {
                    const [sa, ea] = seg.getStartEndAngles();
                    // If `ray` happens to cross the vertex, count as a half(there must be another half).
                    if (Angle.equalTo(a2, sa, epsilon) || Angle.equalTo(a2, ea, epsilon)) wn[onWhichRay] += positiveWinding ? 0.5 : -0.5;
                    else wn[onWhichRay] += positiveWinding ? 1 : -1;
                } else {
                    // If `ray` happens to cross the vertex, count as a half(there must be another half).
                    if (Maths.equalTo(t2, 0, epsilon) || Maths.equalTo(t2, 1, epsilon)) wn[onWhichRay] += positiveWinding ? 0.5 : -0.5;
                    else wn[onWhichRay] += positiveWinding ? 1 : -1;
                }
            }
        }

        return wn;
    }

    crossingNumbersOfSegment(
        segment: LineSegment | Arc | Bezier | QuadraticBezier,
        segments: (LineSegment | Arc | Bezier | QuadraticBezier)[] | { segment: LineSegment | Arc | Bezier | QuadraticBezier }[]
    ) {
        const epsilon = optioner.options.epsilon;
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
                    ? new LineLineSegment(line, seg).intersection()
                    : seg instanceof Bezier
                    ? new LineBezier(line, seg).intersection()
                    : seg instanceof QuadraticBezier
                    ? new LineQuadraticBezier(line, seg).intersection()
                    : new LineArc(line, seg).intersection();

            for (const inter of intersection) {
                const { t2 = NaN, a2 = NaN, m = NaN, c } = inter;

                // the coordinate itself
                if (Coordinates.isEqualTo(coordinates, c, epsilon)) continue;
                // exclude the touching points
                if (m % 2 === 0) continue;

                const onWhichRay = Vector2.dot(prv, Vector2.from(coordinates, c)) > 0 ? "positive" : "negative";

                if (seg instanceof Arc) {
                    const [sa, ea] = seg.getStartEndAngles();
                    // If `ray` happens to cross the vertex, count as a half(there must be another half).
                    if (Angle.equalTo(a2, sa, epsilon) || Angle.equalTo(a2, ea, epsilon)) cn[onWhichRay] += 0.5;
                    else cn[onWhichRay] += 1;
                } else {
                    // If `ray` happens to cross the vertex, count as a half(there must be another half).
                    if (Maths.equalTo(t2, 0, epsilon) || Maths.equalTo(t2, 1, epsilon)) cn[onWhichRay] += 0.5;
                    else cn[onWhichRay] += 1;
                }
            }
        }

        return cn;
    }
    // #endregion
}
