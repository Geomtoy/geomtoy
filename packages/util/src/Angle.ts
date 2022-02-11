import Maths from "./Maths";

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
     * Simplify angle `a` into $[0,2\pi)$.
     * @param a
     */
    static simplify(a: number) {
        const t = a % (2 * Maths.PI);
        return t < 0 ? t + 2 * Maths.PI : t;
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
     * Convert(with loss) angle `a` into $[0,\pi]$(the principal value range of the cosine).
     * @param a
     */
    static convert(a: number) {
        const t = Angle.simplify(a);
        return t > Maths.PI ? t - Maths.PI : t;
    }
    /**
     * Convert(with loss) angle `a` into $[-\frac{\pi}{2},\frac{\pi}{2}]$(the principal value range of the sine).
     * @param a
     */
    static convert2(a: number) {
        const t = Angle.simplify2(a);
        return t > Maths.PI / 2 ? t - Maths.PI : t < -Maths.PI / 2 ? t + Maths.PI : t;
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
}
export default Angle;
