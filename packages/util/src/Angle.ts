import Maths from "./Maths";
import Type from "./Type";

import type { StaticClass } from "./types";

interface Angle extends StaticClass {}
class Angle {
    constructor() {
        throw new Error("[G]`Angle` can not used as a constructor.");
    }
    /**
     * Degree to radian factor.
     */
    static DEG2RAD = Maths.PI / 180;
    /**
     * Radian to degree factor.
     */
    static RAD2DEG = 180 / Maths.PI;

    /**
     * Whether `v` is a valid angle.
     * @param v
     */
    static is(v: any): v is number {
        return Type.isRealNumber(v);
    }
    /**
     * Simplify angle `a` into $[0,2\pi)$.
     * @param a
     */
    static simplify(a: number) {
        const t = a % (2 * Maths.PI);
        return t < -Number.EPSILON ? t + 2 * Maths.PI : Maths.abs(t) < Number.EPSILON ? 0 : t; // - Number.EPSILON / 2 + 2 * Maths.PI === 2 * Maths.PI
    }
    /**
     * Simplify angle `a` into $(-\pi,\pi]$.
     * @param a
     */
    static simplify2(a: number) {
        const t = a % (2 * Maths.PI);
        return t > Maths.PI ? t - 2 * Maths.PI : t <= -Maths.PI ? t + 2 * Maths.PI : t;
    }
    /**
     * Convert(with loss) angle `a` into $[0,\pi)$.
     * @param a
     */
    static convert(a: number) {
        const t = Angle.simplify(a);
        return t >= Maths.PI ? t - Maths.PI : t;
    }

    /**
     * Convert(with loss) angle `a` into $(-\frac{\pi}{2},\frac{\pi}{2}]$.
     * @param a
     */
    static convert2(a: number) {
        const t = Angle.simplify2(a);
        return t > Maths.PI / 2 ? t - Maths.PI : t <= -Maths.PI / 2 ? t + Maths.PI : t;
    }
    /**
     * Convert the unit of angle `a` from degree to radian.
     * @param a
     */
    static degreeToRadian(a: number) {
        return a * Angle.DEG2RAD;
    }
    /**
     * Convert the unit of angle `a` from radian to degree.
     * @param a
     */
    static radianToDegree(a: number) {
        return a * Angle.RAD2DEG;
    }

    static middle(s: number, e: number, positive: boolean) {
        s = Angle.simplify(s);
        e = Angle.simplify(e);
        if (!positive) [s, e] = [e, s];
        if (s > e) {
            const da = Maths.PI * 2 - (s - e);
            return Angle.simplify(s + da / 2);
        } else {
            const da = e - s;
            return Angle.simplify(s + da / 2);
        }
    }

    static equalTo(a: number, b: number, epsilon?: number) {
        if (epsilon === undefined) return Angle.simplify(a) === Angle.simplify(b);
        return Maths.equalTo(Angle.simplify(a), Angle.simplify(b), epsilon);
    }
    static between(a: number, s: number, e: number, positive: boolean, startOpen: boolean, endOpen: boolean, epsilon?: number) {
        a = Angle.simplify(a);
        s = Angle.simplify(s);
        e = Angle.simplify(e);

        if (!positive) [s, e] = [e, s];

        if (epsilon === undefined) {
            if (s > e) {
                return (startOpen ? a > s : a >= s) || (endOpen ? a < e : a <= e);
            } else {
                return (startOpen ? a > s : a >= s) && (endOpen ? a < e : a <= e);
            }
        }

        if (s > e) {
            return (startOpen ? Maths.greaterThan(a, s, epsilon) : !Maths.lessThan(a, s, epsilon)) || (endOpen ? Maths.lessThan(a, e, epsilon) : !Maths.greaterThan(a, e, epsilon));
        } else {
            return Maths.between(a, s, e, startOpen, endOpen, epsilon);
        }
    }
}
export default Angle;
