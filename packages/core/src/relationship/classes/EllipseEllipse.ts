import { Angle, Complex, Maths, Polynomial, RootMultiplicity, Type } from "@geomtoy/util";
import SealedGeometryArray from "../../collection/SealedGeometryArray";
import Ellipse from "../../geometries/basic/Ellipse";
import Point from "../../geometries/basic/Point";
import { optioner } from "../../geomtoy";
import { compareImplicit } from "../../misc/compare-implicit";
import { cached } from "../../misc/decor-cache";
import { Trilean } from "../../types";
import BaseRelationship from "../BaseRelationship";

export default class EllipseEllipse extends BaseRelationship {
    constructor(public geometry1: Ellipse, public geometry2: Ellipse) {
        super();
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);
        if (dg1 instanceof Point || dg2 instanceof Point || dg1 instanceof SealedGeometryArray || dg2 instanceof SealedGeometryArray) {
            this.degeneration.relationship = null;
            return this;
        }
    }

    @cached
    onSameTrajectory() {
        const epsilon = optioner.options.epsilon;
        const if1 = this.geometry1.getImplicitFunctionCoefs();
        const if2 = this.geometry2.getImplicitFunctionCoefs();
        return compareImplicit(if1, if2, epsilon);
    }

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        a1: number; // angle of `c` on `ellipse1`
        a2: number; // angle of `c` on `ellipse2`
        m: number; // multiplicity
    }[] {
        if (this.onSameTrajectory()) return [];
        const { radiusX: rx, radiusY: ry, centerX: cx, centerY: cy, rotation: phi } = this.geometry1;
        const [a, b, c, d, e, f] = this.geometry2.getImplicitFunctionCoefs();
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);

        // coefs of parametric equation of `ellipse1`
        const [px1, px2, px3] = [rx * cosPhi, -ry * sinPhi, cx]; // $[\cos(\theta),\sin(\theta),1]$
        const [py1, py2, py3] = [rx * sinPhi, ry * cosPhi, cy]; // $[\cos(\theta),\sin(\theta),1]$
        // Let $t=\tan(\frac{1}{2}\theta)$.
        // Then the Weierstrass substitution: $\cos(\theta)=\frac{1-t^2}{1+t^2}\quad\sin(\theta)=\frac{2t}{1+t^2}$.
        const px12 = px1 ** 2;
        const px22 = px2 ** 2;
        const px32 = px3 ** 2;
        const py12 = py1 ** 2;
        const py22 = py2 ** 2;
        const py32 = py3 ** 2;

        // prettier-ignore
        let tPoly =  [
            f - d * px1 + a * px12 + d * px3 - 2 * a * px1 * px3 + a * px32 - e * py1 + b * px1 * py1 - b * px3 * py1 + c * py12 + e * py3 - b * px1 * py3 + b * px3 * py3 - 2 * c * py1 * py3 + c * py32,
            2 * d * px2 - 4 * a * px1 * px2 + 4 * a * px2 * px3 - 2 * b * px2 * py1 + 2 * e * py2 - 2 * b * px1 * py2 + 2 * b * px3 * py2 - 4 * c * py1 * py2 + 2 * b * px2 * py3 + 4 * c * py2 * py3,
            2 * f - 2 * a * px12 + 4 * a * px22 + 2 * d * px3 + 2 * a * px32 - 2 * b * px1 * py1 - 2 * c * py12 + 4 * b * px2 * py2 + 4 * c * py22 + 2 * e * py3 + 2 * b * px3 * py3 + 2 * c * py32,
            2 * d * px2 + 4 * a * px1 * px2 + 4 * a * px2 * px3 + 2 * b * px2 * py1 + 2 * e * py2 + 2 * b * px1 * py2 + 2 * b * px3 * py2 + 4 * c * py1 * py2 + 2 * b * px2 * py3 + 4 * c * py2 * py3,
            f + d * px1 + a * px12 + d * px3 + 2 * a * px1 * px3 + a * px32 + e * py1 + b * px1 * py1 + b * px3 * py1 + c * py12 + e * py3 + b * px1 * py3 + b * px3 * py3 + 2 * c * py1 * py3 + c * py32
        ]
        //@see https://en.wikipedia.org/wiki/Tangent_half-angle_substitution#Geometry
        let intersectionAtPi: undefined | RootMultiplicity<[number, number]> = undefined;
        if (tPoly[0] === 0) {
            intersectionAtPi = {
                multiplicity: 1,
                root: [Maths.cos(Maths.PI), Maths.sin(Maths.PI)]
            };
            if (tPoly[1] === 0) {
                intersectionAtPi.multiplicity++;
            }
        }
        const curveEpsilon = optioner.options.curveEpsilon;
        const intersection: ReturnType<typeof this.intersection> = [];
        // We need to check the complex roots(particularly in touch situation) for the arctangent of a complex number may approximately to be a real number(with every small imaginary part).
        const tRoots = Polynomial.roots(tPoly)
            .map(r => {
                if (Complex.is(r)) {
                    const atan = Complex.atan(r);
                    if (Maths.equalTo(Complex.imag(atan), 0, curveEpsilon)) return Maths.tan(Complex.real(atan));
                    return r;
                }
                return r;
            })
            .filter((r): r is number => {
                return Type.isRealNumber(r);
            }); //filter the `±Infinity` and complex

        const cosAndSins = tRoots.map(t => {
            const cosTheta = (1 - t ** 2) / (1 + t ** 2);
            const sinTheta = (2 * t) / (1 + t ** 2);
            return [cosTheta, sinTheta] as [number, number];
        });

        // We use `Polynomial.rootsMultiplicity` to do the tricky here to find out the multiplicity of `cosTheta` and `sinTheta`.
        const cosAndSinsM = Polynomial.rootsMultiplicity(cosAndSins, curveEpsilon);
        if (intersectionAtPi !== undefined) cosAndSinsM.push(intersectionAtPi);

        for (let i = 0, l = cosAndSinsM.length; i < l; i++) {
            const [cosTheta, sinTheta] = cosAndSinsM[i].root;
            const x = px1 * cosTheta + px2 * sinTheta + px3;
            const y = py1 * cosTheta + py2 * sinTheta + py3;
            const a1 = Angle.simplify(Maths.atan2(sinTheta, cosTheta));
            const a2 = this.geometry2.getAngleOfPoint([x, y]); // can not return `NaN`
            intersection.push({
                c: [x, y],
                a1,
                a2,
                m: cosAndSinsM[i].multiplicity
            });
        }
        return intersection;
    }

    equal(): Trilean {
        return this.onSameTrajectory();
    }
    separate(): Trilean {
        if (!this.geometry1.isPointOutside(this.geometry2.centerCoordinates)) return false;
        if (!this.geometry2.isPointOutside(this.geometry1.centerCoordinates)) return false;
        if (this.intersection().length !== 0) return false;
        return true;
    }

    contain(): Trilean {
        if (!this.geometry1.isPointInside(this.geometry2.centerCoordinates)) return false;
        if (this.onSameTrajectory()) return false;
        if (this.intersection().length !== 0) return false;
        return true;
    }
    containedBy(): Trilean {
        if (!this.geometry2.isPointInside(this.geometry1.centerCoordinates)) return false;
        if (this.onSameTrajectory()) return false;
        if (this.intersection().length !== 0) return false;
        return true;
    }

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
    coincide() {
        if (!this.onSameTrajectory()) return [];
        return [this.geometry1.clone()];
    }
}
