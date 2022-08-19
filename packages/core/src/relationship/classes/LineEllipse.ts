import { Angle, Maths, Polynomial, Type } from "@geomtoy/util";
import { cached } from "../../misc/decor-cache";
import BaseRelationship from "../BaseRelationship";
import Ellipse from "../../geometries/basic/Ellipse";
import Line from "../../geometries/basic/Line";
import Point from "../../geometries/basic/Point";
import { Trilean } from "../../types";
import { optioner } from "../../geomtoy";

export default class LineEllipse extends BaseRelationship {
    constructor(public geometry1: Line, public geometry2: Ellipse) {
        super();
    }

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        a2: number; // angle of `c` on `ellipse`
        m: number; // multiplicity
    }[] {
        const { radiusX: rx, radiusY: ry, centerX: cx, centerY: cy, rotation: phi } = this.geometry2;
        const [a, b, c] = this.geometry1.getImplicitFunctionCoefs();
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        // coefs of parametric equation of `ellipse`
        const [px1, px2, px3] = [rx * cosPhi, -ry * sinPhi, cx]; // $[\cos(\theta),\sin(\theta),1]$
        const [py1, py2, py3] = [rx * sinPhi, ry * cosPhi, cy]; // $[\cos(\theta),\sin(\theta),1]$
        // prettier-ignore
        let tPoly = [
            c + a *(-px1 + px3) + b *(-py1 + py3),
            2* (a* px2 + b* py2),
            c + a *(px1 + px3) + b* (py1 + py3)
        ]
        // Handle coefficient calculation underflow.
        if (tPoly[0] === 0) tPoly[0] = Number.EPSILON;
        tPoly = Polynomial.monic(tPoly);
        tPoly = tPoly.map(coef => (Maths.abs(coef) < Number.EPSILON ? Number.EPSILON : coef));

        const curveEpsilon = optioner.options.curveEpsilon;
        const intersection: ReturnType<typeof this.intersection> = [];

        let tRoots = Polynomial.roots(tPoly);
        const cosAndSins = tRoots.filter(Type.isNumber).map(t => {
            const cosTheta = (1 - t ** 2) / (1 + t ** 2);
            const sinTheta = (2 * t) / (1 + t ** 2);
            return [cosTheta, sinTheta] as [number, number];
        });
        // We use `Polynomial.rootsMultiplicity` to do the tricky here to find out the multiplicity of `cosTheta` and `sinTheta`.
        const cosAndSinsM = Polynomial.rootsMultiplicity(cosAndSins, curveEpsilon);

        for (let i = 0, l = cosAndSinsM.length; i < l; i++) {
            const [cosTheta, sinTheta] = cosAndSinsM[i].root;
            const x = px1 * cosTheta + px2 * sinTheta + px3;
            const y = py1 * cosTheta + py2 * sinTheta + py3;
            const a = Angle.simplify(Maths.atan2(sinTheta, cosTheta));

            intersection.push({
                c: [x, y],
                a2: a,
                m: cosAndSinsM[i].multiplicity
            });
        }
        return intersection;
    }

    // no equal
    separate(): Trilean {
        return this.intersection().length === 0;
    }

    // no contain
    // no containedBy

    intersect() {
        return this.intersection().map(i => new Point(i.c));
    }
    strike() {
        return this.intersection()
            .filter(i => i.m % 2 === 1)
            .map(i => new Point(i.c));
    }
    contact() {
        return this.intersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    cross() {
        return this.intersection()
            .filter(i => i.m % 2 === 1)
            .map(i => new Point(i.c));
    }
    touch() {
        return this.intersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    // no block
    // no blockedBy
    // no connect
    // no coincide
}
