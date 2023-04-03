import type { StaticClass } from "./types";

interface Float extends StaticClass {}

class Float {
    constructor() {
        throw new Error("[G]`Float` can not used as a constructor.");
    }
    /**
     * Unit roundoff
     * @see https://en.wikipedia.org/wiki/Machine_epsilon
     * "The IEEE standard does not define the terms machine epsilon and unit roundoff, so differing definitions of these terms are in use, which can cause some confusion."
     * "This alternative definition is much more widespread outside academia: machine epsilon is the difference between 1 and the next larger floating point number."
     * "By this definition, $\varepsilon$ equals the value of the unit in the last place relative to 1, i.e. $b^{-(p-1)}$ (where $b$ is the base of the floating point system and $p$ is the precision)
     * and the unit roundoff is $u=\varepsilon/2$, assuming round-to-nearest mode, and $u=\varepsilon$, assuming round-by-chop."
     * @see https://en.wikipedia.org/wiki/Round-off_error#Roundoff_error_under_different_rounding_rules
     * "There are two common rounding rules, round-by-chop and round-to-nearest. The IEEE standard uses round-to-nearest."
     */
    static UNIT_ROUNDOFF = Number.EPSILON / 2; // 2 ** -53

    static MACHINE_EPSILON = Number.EPSILON; // 2 ** -52

    /**
     * Returns the sign of number `n`.
     * @summary
     * - If `n` is in $[-\infty, -\varepsilon)$, returns -1.
     * - If `n` is in $[-\varepsilon, 0)$, returns -0.
     * - If `n` is in $[0, \varepsilon]$, returns 0.
     * - If `n` is in $(\varepsilon, +\infty]$, returns 1.
     * @param n
     * @param epsilon
     */
    static sign(n: number, epsilon: number) {
        return (n < 0 ? -1 : 1) * Number(Math.abs(n) > epsilon);
    }

    /**
     * Floating point number comparison reference
     * @see https://www.learncpp.com/cpp-tutorial/relational-operators-and-floating-point-comparisons/comment-page-2/
     * @see https://randomascii.wordpress.com/2012/02/25/comparing-floating-point-numbers-2012-edition/
     * @see http://stackoverflow.com/questions/17333/most-effective-way-for-float-and-double-comparison
     * @see https://realtimecollisiondetection.net/blog/?p=89
     *
     */

    /**
     * Whether number `a` is approximately equal to number `b`.
     * @note
     * `epsilon` is used as absolute epsilon.
     * @param a
     * @param b
     * @param epsilon
     */
    static absEqualTo(a: number, b: number, epsilon: number) {
        if (Number.isNaN(a) || Number.isNaN(b)) return false;
        if (Math.abs(a) === Infinity || Math.abs(b) === Infinity) return a === b;
        return Math.abs(a - b) <= epsilon;
    }
    /**
     * Whether number `a` is definitely greater than number `b`.
     * @note
     * `epsilon` is used as absolute epsilon.
     * @param a
     * @param b
     * @param epsilon
     */
    static absGreaterThan(a: number, b: number, epsilon: number) {
        if (Number.isNaN(a) || Number.isNaN(b)) return false;
        if (Math.abs(a) === Infinity || Math.abs(b) === Infinity) return a > b;
        return a - b > epsilon;
    }
    /**
     * Whether number `a` is definitely less than number `b`.
     * `epsilon` is used as absolute epsilon.
     * @param a
     * @param b
     * @param epsilon
     */
    static absLessThan(a: number, b: number, epsilon: number) {
        if (Number.isNaN(a) || Number.isNaN(b)) return false;
        if (Math.abs(a) === Infinity || Math.abs(b) === Infinity) return b > a;
        return b - a > epsilon;
    }
    /**
     * Whether number `n` between the lower bound `l` and the upper bound `u`.
     * @note
     * `epsilon` is used as absolute epsilon.
     * @summary
     * - If `lowerOpen` = `false`, `upperOpen` = `false`, then the interval to check is $[l,u]$.
     * - If `lowerOpen` = `true`, `upperOpen` = `false`, then the interval to check is $(l,u]$.
     * - If `lowerOpen` = `false`, `upperOpen` = `true`, then the interval to check is $[l,u)$.
     * - If `lowerOpen` = `true`, `upperOpen` = `true`, then the interval to check is $(l,u)$.
     * @param n
     * @param l
     * @param u
     */
    static absBetween(n: number, l: number, u: number, lowerOpen: boolean, upperOpen: boolean, epsilon: number) {
        if (l > u) [l, u] = [u, l];
        if (Number.isNaN(n)) return false;
        return (lowerOpen ? Float.absGreaterThan(n, l, epsilon) : !Float.absLessThan(n, l, epsilon)) && (upperOpen ? Float.absLessThan(n, u, epsilon) : !Float.absGreaterThan(n, u, epsilon));
    }
    /**
     * Approximately compare number `a` and number `b` with `epsilon`.
     * @note
     * `epsilon` is used as absolute epsilon.
     * @summary
     * - If `a` is `NaN` or `b` is `NaN`, return `NaN`.
     * - If number `a` is definitely less than number `b`, returns -1.
     * - If number `a` is approximately equal to number `b`, returns 0.
     * - If number `a` is definitely greater than number `b`, returns 1.
     * @param a
     * @param b
     * @param epsilon
     */
    static absCompare(a: number, b: number, epsilon: number) {
        if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
        if (Math.abs(a) === Infinity || Math.abs(b) === Infinity) return b > a ? -1 : a > b ? 1 : 0;
        const diff = a - b;
        return Math.abs(diff) <= epsilon ? 0 : diff > epsilon ? 1 : -diff > epsilon ? -1 : 0;
    }

    /**
     * Whether number `a` is approximately equal to number `b`.
     * @note
     * `epsilon` is used as relative epsilon.
     * @param a
     * @param b
     * @param epsilon
     */
    static relEqualTo(a: number, b: number, epsilon: number) {
        if (Number.isNaN(a) || Number.isNaN(b)) return false;
        if (Math.abs(a) === Infinity || Math.abs(b) === Infinity) return a === b;
        return Math.abs(a - b) <= Math.max(Math.abs(a), Math.abs(b)) * epsilon;
    }
    /**
     * Whether number `a` is definitely greater than number `b`.
     * @note
     * `epsilon` is used as relative epsilon.
     * @param a
     * @param b
     * @param epsilon
     */
    static relGreaterThan(a: number, b: number, epsilon: number) {
        if (Number.isNaN(a) || Number.isNaN(b)) return false;
        if (Math.abs(a) === Infinity || Math.abs(b) === Infinity) return a > b;
        return a - b > Math.max(Math.abs(a), Math.abs(b)) * epsilon;
    }
    /**
     * Whether number `a` is definitely less than number `b`.
     * `epsilon` is used as relative epsilon.
     * @param a
     * @param b
     * @param epsilon
     */
    static relLessThan(a: number, b: number, epsilon: number) {
        if (Number.isNaN(a) || Number.isNaN(b)) return false;
        if (Math.abs(a) === Infinity || Math.abs(b) === Infinity) return b > a;
        return b - a > Math.max(Math.abs(a), Math.abs(b)) * epsilon;
    }
    /**
     * Whether number `n` between the lower bound `l` and the upper bound `u`.
     * @note
     * `epsilon` is used as relative epsilon.
     * @summary
     * - If `lowerOpen` = `false`, `upperOpen` = `false`, then the interval to check is $[l,u]$.
     * - If `lowerOpen` = `true`, `upperOpen` = `false`, then the interval to check is $(l,u]$.
     * - If `lowerOpen` = `false`, `upperOpen` = `true`, then the interval to check is $[l,u)$.
     * - If `lowerOpen` = `true`, `upperOpen` = `true`, then the interval to check is $(l,u)$.
     * @param n
     * @param l
     * @param u
     */
    static relBetween(n: number, l: number, u: number, lowerOpen: boolean, upperOpen: boolean, epsilon: number) {
        if (l > u) [l, u] = [u, l];
        if (Number.isNaN(n)) return false;
        return (lowerOpen ? Float.relGreaterThan(n, l, epsilon) : !Float.relLessThan(n, l, epsilon)) && (upperOpen ? Float.relLessThan(n, u, epsilon) : !Float.relGreaterThan(n, u, epsilon));
    }
    /**
     * Approximately compare number `a` and number `b` with `epsilon`.
     * @note
     * `epsilon` is used as relative epsilon.
     * @summary
     * - If `a` is `NaN` or `b` is `NaN`, return `NaN`.
     * - If number `a` is definitely less than number `b`, returns -1.
     * - If number `a` is approximately equal to number `b`, returns 0.
     * - If number `a` is definitely greater than number `b`, returns 1.
     * @param a
     * @param b
     * @param epsilon
     */
    static relCompare(a: number, b: number, epsilon: number) {
        if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
        if (Math.abs(a) === Infinity || Math.abs(b) === Infinity) return b > a ? -1 : a > b ? 1 : 0;
        const diff = a - b;
        const r = Math.max(Math.abs(a), Math.abs(b)) * epsilon;
        return Math.abs(diff) <= r ? 0 : diff > r ? 1 : -diff > r ? -1 : 0;
    }

    /**
     * Whether number `a` is approximately equal to number `b`.
     * @note
     * `epsilon` is used as absolute epsilon and relative epsilon.
     * @param a
     * @param b
     * @param epsilon
     */
    static equalTo(a: number, b: number, epsilon: number) {
        if (Number.isNaN(a) || Number.isNaN(b)) return false;
        if (Math.abs(a) === Infinity || Math.abs(b) === Infinity) return a === b;
        const diffAbs = Math.abs(a - b);
        if (diffAbs <= epsilon) return true;
        return diffAbs <= Math.max(Math.abs(a), Math.abs(b)) * epsilon;
    }
    /**
     * Whether number `a` is definitely greater than number `b`.
     * @note
     * `epsilon` is used as absolute epsilon and relative epsilon.
     * @param a
     * @param b
     * @param epsilon
     */
    static greaterThan(a: number, b: number, epsilon: number) {
        if (Number.isNaN(a) || Number.isNaN(b)) return false;
        if (Math.abs(a) === Infinity || Math.abs(b) === Infinity) return a > b;
        const diff = a - b;
        if (Math.abs(diff) <= epsilon) return false;
        return diff > Math.max(Math.abs(a), Math.abs(b)) * epsilon;
    }
    /**
     * Whether number `a` is definitely less than number `b`.
     * @note
     * `epsilon` is used as absolute epsilon and relative epsilon.
     * @param a
     * @param b
     * @param epsilon
     */
    static lessThan(a: number, b: number, epsilon: number) {
        if (Number.isNaN(a) || Number.isNaN(b)) return false;
        if (Math.abs(a) === Infinity || Math.abs(b) === Infinity) return b > a;
        const diff = b - a;
        if (Math.abs(diff) <= epsilon) return false;
        return diff > Math.max(Math.abs(a), Math.abs(b)) * epsilon;
    }
    /**
     * Whether number `n` between the lower bound `l` and the upper bound `u`.
     * @note
     * `epsilon` is used as absolute epsilon and relative epsilon.
     * @summary
     * - If `lowerOpen` = `false`, `upperOpen` = `false`, then the interval to check is $[l,u]$.
     * - If `lowerOpen` = `true`, `upperOpen` = `false`, then the interval to check is $(l,u]$.
     * - If `lowerOpen` = `false`, `upperOpen` = `true`, then the interval to check is $[l,u)$.
     * - If `lowerOpen` = `true`, `upperOpen` = `true`, then the interval to check is $(l,u)$.
     * @param n
     * @param l
     * @param u
     */
    static between(n: number, l: number, u: number, lowerOpen: boolean, upperOpen: boolean, epsilon: number) {
        if (l > u) [l, u] = [u, l];
        if (Number.isNaN(n)) return false;
        return (lowerOpen ? Float.greaterThan(n, l, epsilon) : !Float.lessThan(n, l, epsilon)) && (upperOpen ? Float.lessThan(n, u, epsilon) : !Float.greaterThan(n, u, epsilon));
    }
    /**
     * Approximately compare number `a` and number `b` with `epsilon`.
     * @note
     * `epsilon` is used as absolute epsilon and relative epsilon.
     * @summary
     * - If `a` is `NaN` or `b` is `NaN`, return `NaN`.
     * - If number `a` is definitely less than number `b`, returns -1.
     * - If number `a` is approximately equal to number `b`, returns 0.
     * - If number `a` is definitely greater than number `b`, returns 1.
     * @param a
     * @param b
     * @param epsilon
     */
    static compare(a: number, b: number, epsilon: number) {
        if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
        if (Math.abs(a) === Infinity || Math.abs(b) === Infinity) return b > a ? -1 : a > b ? 1 : 0;
        const diff = a - b;
        const r = Math.max(Math.abs(a), Math.abs(b)) * epsilon;
        return Math.abs(diff) <= epsilon ? 0 : diff > r ? 1 : -diff > r ? -1 : 0;
    }
}
export default Float;
