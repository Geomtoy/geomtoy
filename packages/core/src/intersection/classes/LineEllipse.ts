import { Angle, Maths, Polynomial, Type } from "@geomtoy/util";
import Ellipse from "../../geometries/basic/Ellipse";
import Line from "../../geometries/basic/Line";
import Point from "../../geometries/basic/Point";
import { eps } from "../../geomtoy";
import { cached, DISABLE_CACHE_SYMBOL } from "../../misc/decor-cached";
import { mapComplexAtanImagZeroToReal, rootMultiplicityAtPi } from "../../misc/tangent-half-angle-substitution";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";

export default class LineEllipse extends BaseIntersection {
    static override create(geometry1: Line, geometry2: Ellipse) {
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        const ret = {
            intersection: BaseIntersection.nullIntersection,
            inverse: false
        } as {
            intersection: BaseIntersection;
            inverse: boolean;
        };

        if (dg1 instanceof Line && dg2 instanceof Ellipse) {
            ret.intersection = new LineEllipse(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }

        // null or point degeneration
        return ret;
    }

    constructor(public geometry1: Line, public geometry2: Ellipse) {
        super();
    }

    @cached
    properIntersection(): {
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

        const intersection: ReturnType<typeof this.properIntersection> = [];
        const tRoots = Polynomial.roots(tPoly).map(mapComplexAtanImagZeroToReal).filter(Type.isNumber);

        const cosAndSins = tRoots.map(t => {
            const cosTheta = (1 - t ** 2) / (1 + t ** 2);
            const sinTheta = (2 * t) / (1 + t ** 2);
            return [cosTheta, sinTheta] as [number, number];
        });
        // We use `Polynomial.rootsMultiplicity` to do the tricky here to find out the multiplicity of `cosTheta` and `sinTheta`.
        const cosAndSinsM = Polynomial.rootsMultiplicity(cosAndSins, eps.trigonometricEpsilon);
        let atPi = rootMultiplicityAtPi(tPoly);
        if (atPi > 0) {
            cosAndSinsM.push({
                multiplicity: atPi,
                root: [Maths.cos(Maths.PI), Maths.sin(Maths.PI)]
            });
        }

        for (let i = 0, l = cosAndSinsM.length; i < l; i++) {
            const [cosTheta, sinTheta] = cosAndSinsM[i].root;
            let x = px1 * cosTheta + px2 * sinTheta + px3;
            let y = py1 * cosTheta + py2 * sinTheta + py3;
            //lower the calculation error
            // [x, y] = this.geometry1.getClosestPointFromPoint([x, y])[0].coordinates;

            const a = Angle.simplify(Maths.atan2(sinTheta, cosTheta));

            intersection.push({
                c: [x, y],
                a2: a,
                m: cosAndSinsM[i].multiplicity
            });
        }
        return intersection;
    }

    equal() {
        return false;
    }
    separate(): Trilean {
        return this.properIntersection().length === 0;
    }
    intersect() {
        return this.properIntersection().map(i => new Point(i.c));
    }
    strike() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 1)
            .map(i => new Point(i.c));
    }
    contact() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    cross() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 1)
            .map(i => new Point(i.c));
    }
    touch() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    block() {
        return [];
    }
    blockedBy() {
        return [];
    }
    connect() {
        return [];
    }
    coincide() {
        return [];
    }
}
