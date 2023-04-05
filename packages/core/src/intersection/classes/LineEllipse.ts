import { Angle, Maths, Polynomial, Type } from "@geomtoy/util";
import SealedGeometryArray from "../../collection/SealedGeometryArray";
import Ellipse from "../../geometries/basic/Ellipse";
import Line from "../../geometries/basic/Line";
import Point from "../../geometries/basic/Point";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { mapComplexAtanImagZeroToReal, rootMultiplicityAtPi } from "../../misc/tangent-half-angle-substitution";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";

export default class LineEllipse extends BaseIntersection {
    constructor(public geometry1: Line, public geometry2: Ellipse) {
        super();
        const dg2 = geometry2.degenerate(false);
        if (dg2 instanceof Point || dg2 instanceof SealedGeometryArray) {
            this.degeneration.intersection = null;
            return this;
        }
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

    @superPreprocess("handleDegeneration")
    equal() {
        return false;
    }
    @superPreprocess("handleDegeneration")
    separate(): Trilean {
        return this.properIntersection().length === 0;
    }
    @superPreprocess("handleDegeneration")
    intersect() {
        return this.properIntersection().map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    strike() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 1)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    contact() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    cross() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 1)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        return [];
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        return [];
    }
    @superPreprocess("handleDegeneration")
    connect() {
        return [];
    }
    @superPreprocess("handleDegeneration")
    coincide() {
        return [];
    }
}
