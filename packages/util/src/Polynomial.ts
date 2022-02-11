import Maths from "./Maths";

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
     * Returns roots of $ax+b=0$
     * @param a
     * @param b
     */
    static roots(a: number, b: number): number[];
    /**
     * Returns roots of $ax^2+bx+c=0$
     * @param a
     * @param b
     * @param c
     */
    static roots(a: number, b: number, c: number): number[];
    /**
     * Returns roots of $ax^3+bx^2+cx+d=0$
     * @param a
     * @param b
     * @param c
     * @param d
     */
    static roots(a: number, b: number, c: number, d: number): number[];
    /**
     * Returns roots of $ax^4+bx^3+cx^2+dx+e=0$
     * @param a
     * @param b
     * @param c
     * @param d
     * @param e
     */
    static roots(a: number, b: number, c: number, d: number, e: number): number[];
    static roots(a0: number, a1?: number, a2?: number, a3?: number, a4?: number, a5?: number) {
        if (a5 !== undefined) {
            return [];
        }
        return [];
    }
    /**
     *
     * @param a
     * @param b
     * @param c
     */

    /**
     * Returns the roots of the quadratic equation in one variable $ax^2+bx+c=0$
     * @param coefs`[a, b, c]`
     * @returns
     */
    static quadraticRoots(coefs: [a: number, b: number, c: number]): number[] {
        const [a, b, c] = coefs;
        let rs = [],
            dis = b ** 2 - 4 * a * c;
        if (dis > 0) {
            rs.push((-b + Maths.sqrt(dis)) / (2 * a));
            rs.push((-b - Maths.sqrt(dis)) / (2 * a));
        } else if (dis == 0) {
            rs.push(-b / (2 * a));
        }
        return rs;
    }
}
export default Polynomial;
