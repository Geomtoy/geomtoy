import Float from "./Float";
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
        return t < -Float.MACHINE_EPSILON ? t + 2 * Maths.PI : Maths.abs(t) <= Float.MACHINE_EPSILON ? 0 : t; // - (2 ** -52) + 2 * Maths.PI === 2 * Maths.PI
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
    /**
     * Get proportional(defined by `p`) intermediate angle between start angle `s` and end angle `e`.
     * @param s -start angle
     * @param e -end angle
     * @param positive -positive rotation from `s` to `e` or not
     * @param p -proportion
     */
    static fraction(s: number, e: number, positive: boolean, p: number) {
        Maths.clamp(p, 0, 1);
        s = Angle.simplify(s);
        e = Angle.simplify(e);
        if (!positive) [s, e] = [e, s];
        if (s > e) {
            const da = Maths.PI * 2 - (s - e);
            return Angle.simplify(s + da * p);
        } else {
            const da = e - s;
            return Angle.simplify(s + da * p);
        }
    }
    /**
     *
     * @param a
     * @param b
     * @param epsilon
     * @returns
     */
    static equalTo(a: number, b: number, epsilon?: number) {
        a = Angle.simplify(a);
        b = Angle.simplify(b);
        if (epsilon === undefined) return a === b;
        return Float.absEqualTo(a, b, epsilon);
    }
    /**
     * Clamp angle `a` into the `positive`(or not) sweep interval between start angle `s` and end angle `e`.
     * @param a
     * @param s
     * @param e
     * @param positive
     */
    static clamp(a: number, s: number, e: number, positive: boolean) {
        a = Angle.simplify(a);
        s = Angle.simplify(s);
        e = Angle.simplify(e);
        if (!positive) [s, e] = [e, s];
        if (s > e) {
            if (a > s || a < e) return a;
            return 2 * a > e + s ? s : e;
        } else {
            if (a > s && a < e) return a;
            // todo improve this
            // prettier-ignore
            return a <= s ? (2 * a + 2 * Maths.PI > e + s ? s : e) : (2 * a - 2 * Maths.PI > e + s ? s : e);
        }
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
            return (startOpen ? Float.absGreaterThan(a, s, epsilon) : !Float.absLessThan(a, s, epsilon)) || (endOpen ? Float.absLessThan(a, e, epsilon) : !Float.absGreaterThan(a, e, epsilon));
        } else {
            return (startOpen ? Float.absGreaterThan(a, s, epsilon) : !Float.absLessThan(a, s, epsilon)) && (endOpen ? Float.absLessThan(a, e, epsilon) : !Float.absGreaterThan(a, e, epsilon));
        }
    }
}
export default Angle;
