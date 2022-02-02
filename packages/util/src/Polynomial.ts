import type { StaticClass } from "./types";

interface Polynomial extends StaticClass {}
class Polynomial {
    constructor() {
        throw new Error("[G]`Polynomial` can not used as a constructor.");
    }

    static degree() {}

    /**
     *
     */
    static monic() {}

    /**
     * Find the real roots of the quadratic equation in one variable $ax^2+bx+c=0$
     * @param a
     * @param b
     * @param c
     */
    static quadraticRoots(a: number, b: number, c: number): number[] {
        let rs = [],
            dis = b ** 2 - 4 * a * c;
        if (dis > 0) {
            rs.push((-b + Math.sqrt(dis)) / (2 * a));
            rs.push((-b - Math.sqrt(dis)) / (2 * a));
        } else if (dis == 0) {
            rs.push(-b / (2 * a));
        }
        return rs;
    }
}
export default Polynomial;
