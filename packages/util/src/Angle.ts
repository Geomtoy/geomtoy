import Math from "./Math";

import type { StaticClass } from "../types";

interface Angle extends StaticClass {}
class Angle {
    constructor() {
        throw new Error("[G]`Angle` can not used as a constructor.");
    }
    /**
     * Degree to radian factor.
     */
    static DEG2RAD = Math.PI / 180;
    /**
     * Radian to degree factor.
     */
    static RAD2DEG = 180 / Math.PI;
    /**
     * Simplify angle `a` into $[0,2\pi)$.
     * @param a
     */
    static simplify(a: number) {
        const t = a % (2 * Math.PI);
        return t < 0 ? t + 2 * Math.PI : t;
    }
    /**
     * Simplify angle `a` into $(-\pi,\pi]$.
     * @param a
     */
    static simplify2(a: number) {
        const t = a % (2 * Math.PI);
        return t > Math.PI ? t - 2 * Math.PI : t <= -Math.PI ? t + 2 * Math.PI : t;
    }
    /**
     * Convert(with loss) angle `a` into $[0,\pi]$(the principal value range of the cosine).
     * @param a
     */
    static convert(a: number) {
        const t = Angle.simplify(a);
        return t > Math.PI ? t - Math.PI : t;
    }
    /**
     * Convert(with loss) angle `a` into $[-\frac{\pi}{2},\frac{\pi}{2}]$(the principal value range of the sine).
     * @param a
     */
    static convert2(a: number) {
        const t = Angle.simplify2(a);
        return t > Math.PI / 2 ? t - Math.PI : t < -Math.PI / 2 ? t + Math.PI : t;
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
