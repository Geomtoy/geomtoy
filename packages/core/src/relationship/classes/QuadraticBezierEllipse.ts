import { Maths, Polynomial, Type } from "@geomtoy/util";
import BaseRelationship from "../BaseRelationship";
import Point from "../../geometries/basic/Point";
import { cached } from "../../misc/decor-cache";
import LineSegment from "../../geometries/basic/LineSegment";
import Ellipse from "../../geometries/basic/Ellipse";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import LineSegmentEllipse from "./LineSegmentEllipse";
import { optioner } from "../../geomtoy";

export default class QuadraticBezierEllipse extends BaseRelationship {
    constructor(public geometry1: QuadraticBezier, public geometry2: Ellipse) {
        super();
        const dg1 = geometry1.dimensionallyDegenerate();

        if (dg1) {
            this.degeneration.relationship = null;
            return this;
        }
        const ndg1 = geometry1.nonDimensionallyDegenerate();
        if (ndg1 instanceof LineSegment) {
            this.degeneration.relationship = new LineSegmentEllipse(ndg1, geometry2);
            return this;
        }
    }

    @cached
    intersection() {
        const [polyX, polyY] = this.geometry1.getPolynomial();
        const [[x2, x1, x0], [y2, y1, y0]] = [polyX, polyY];
        const { radiusX: rx, radiusY: ry, centerX: cx, centerY: cy, rotation: phi } = this.geometry2;

        const rx2 = rx ** 2;
        const ry2 = ry ** 2;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        const cosPhi2 = cosPhi ** 2;
        const sinPhi2 = sinPhi ** 2;

        // prettier-ignore
        const t0 =
            -2 * sinPhi * cosPhi * (rx2 - ry2) * (cx - x0) * (cy - y0) +
            cosPhi2 * (ry2 * (cx - x0) ** 2 + rx2 * (cy - y0) ** 2) +
            sinPhi2 * (rx2 * (cx - x0) ** 2 + ry2 * (cy - y0) ** 2) -
            rx2 * ry2;
        // prettier-ignore
        const t1 = -2 * (
            -sinPhi * cosPhi * (rx2 - ry2) * ((cy - y0) * x1 + (cx - x0) * y1) +
            cosPhi2 * (ry2 * (cx - x0) * x1 + rx2 * (cy - y0) * y1) +
            sinPhi2 * (rx2 * (cx - x0) * x1 + ry2 * (cy - y0) * y1)
            );
        // prettier-ignore
        const t2 =
            2 * sinPhi * cosPhi * (rx2 - ry2) * ((cy - y0) * x2 - x1 * y1 + (cx - x0) * y2) +
            cosPhi2 * (ry2 * (x1 ** 2 - 2 * (cx - x0) * x2) + rx2 * (y1 ** 2 - 2 * (cy - y0) * y2)) +
            sinPhi2 * (rx2 * (x1 ** 2 - 2 * (cx - x0) * x2) + ry2 * (y1 ** 2 - 2 * (cy - y0) * y2));
        // prettier-ignore
        const t3 = 2 * (
            -sinPhi * cosPhi * (rx2 - ry2) * (x2 * y1 + x1 * y2) + 
            cosPhi2 * (ry2 * x1 * x2 + rx2 * y1 * y2) +
            sinPhi2 * (rx2 * x1 * x2 + ry2 * y1 * y2)
            );
        // prettier-ignore
        const t4 = 
            -2 * sinPhi * cosPhi * (rx2 - ry2) * x2 * y2 +
            cosPhi2 * (ry2 * x2 ** 2 + rx2 * y2 ** 2) +
            sinPhi2 * (rx2 * x2 ** 2 + ry2 * y2 ** 2);

        const tPoly = [t4, t3, t2, t1, t0];
        const curveEpsilon = optioner.options.curveEpsilon;
        const epsilon = optioner.options.epsilon;

        let tRoots = Polynomial.rootsMultiplicity(Polynomial.roots(tPoly).filter(Type.isNumber), curveEpsilon);

        const intersection: {
            c: [number, number]; // coordinates of intersection
            t1: number; // time of `c` on `quadraticBezier`
            a2: number; // angle of `c` on `ellipse`
            m: number; // multiplicity
        }[] = [];
        for (let i = 0, l = tRoots.length; i < l; i++) {
            const t1 = tRoots[i].root;
            if (Maths.between(t1, 0, 1, false, false, epsilon)) {
                const x = Polynomial.evaluate(polyX, t1);
                const y = Polynomial.evaluate(polyY, t1);

                const a2 = this.geometry2.getAngleOfPoint([x, y]);
                if (!Number.isNaN(a2)) {
                    intersection.push({
                        c: [x, y],
                        t1,
                        a2,
                        m: tRoots[i].multiplicity
                    });
                }
            }
        }
        return intersection;
    }

    // no equal
    @superPreprocess("handleDegeneration")
    separate() {
        if (!this.geometry2.isPointOutside(this.geometry1.point1Coordinates)) return false;
        if (!this.geometry2.isPointOutside(this.geometry1.point2Coordinates)) return false;
        if (this.intersection().length !== 0) return false;
        return true;
    }

    // no contain
    @superPreprocess("handleDegeneration")
    containedBy() {
        if (!this.geometry2.isPointInside(this.geometry1.point1Coordinates)) return false;
        if (!this.geometry2.isPointInside(this.geometry1.point2Coordinates)) return false;
        if (this.intersection().length !== 0) return false;
        return true;
    }

    @superPreprocess("handleDegeneration")
    intersect() {
        return this.intersection().map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    strike() {
        return this.intersection()
            .filter(i => i.m % 2 === 1)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    contact() {
        return this.intersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    cross() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => i.m % 2 === 1 && Maths.between(i.t1, 0, 1, true, true, epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => i.m % 2 === 0 && Maths.between(i.t1, 0, 1, true, true, epsilon))
            .map(i => new Point(i.c));
    }
    // no block
    @superPreprocess("handleDegeneration")
    blockedBy() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => Maths.equalTo(i.t1, 0, epsilon) || Maths.equalTo(i.t1, 1, epsilon))
            .map(i => new Point(i.c));
    }
    // no connect
    // no coincide
}