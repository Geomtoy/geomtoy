import type { StaticClass } from "./types";

interface Maths extends StaticClass {}

class Maths {
    constructor() {
        throw new Error("[G]`Maths` can not used as a constructor.");
    }
    /**
     * The mathematical constant $e$, the base of natural logarithms.
     */
    static E = Math.E;
    /**
     * The natural logarithm of 10.
     */
    static LN10 = Math.LN10;
    /**
     * The natural logarithm of 2.
     */
    static LN2 = Math.LN2;
    /**
     * The base 10 logarithm of $e$.
     */
    static LOG10E = Math.LOG10E;
    /**
     * The base 2 logarithm of $e$.
     */
    static LOG2E = Math.LOG2E;
    /**
     * The mathematical constant $\pi$, the ratio of the circumference of a circle to its diameter.
     */
    static PI = Math.PI;
    /**
     * The square root of 0.5.
     */
    static SQRT1_2 = Math.SQRT1_2;
    /**
     * The square root of 2.
     */
    static SQRT2 = Math.SQRT2;

    // #region Trigonometric functions
    /*
    @see https://en.wikipedia.org/wiki/Trigonometric_functions
    */
    /**
     * Returns the sine of number `n`.
     * @param n
     */
    static sin(n: number) {
        return Math.sin(n);
    }
    /**
     * Returns the cosine of number `n`.
     * @param n
     */
    static cos(n: number) {
        return Math.cos(n);
    }
    /**
     * Returns the secant of number `n`.
     * @note New added method, not existed in `Math`.
     * @param n
     */
    static sec(n: number) {
        return 1 / Maths.cos(n);
    }
    /**
     * Returns the cosecant of number `n`.
     * @note New added method, not existed in `Math`.
     * @param n
     */
    static csc(n: number) {
        return 1 / Maths.sin(n);
    }
    /**
     * Returns the tangent of number `n`.
     * @note Modified method, different from the one in `Math`.
     * @param n
     */
    static tan(n: number) {
        return Math.tan(n);
    }
    /**
     * Returns the cotangent of number `n`.
     * @note New added method, not existed in `Math`.
     * @param n
     */
    static cot(n: number) {
        return 1 / Maths.tan(n);
    }
    /**
     * Returns the arcsine of number `n`.
     * @param n
     */
    static asin(n: number) {
        return Math.asin(n);
    }
    /**
     * Returns the arccosine of number `n`.
     * @param n
     */
    static acos(n: number) {
        return Math.acos(n);
    }
    /**
     * Returns the arcsecant of number `n`.
     * @note New added method, not existed in `Math`.
     * @param n
     */
    static asec(n: number) {
        return Math.acos(1 / n);
    }
    /**
     * Returns the arccosecant of number `n`.
     * @note New added method, not existed in `Math`.
     * @param n
     */
    static acsc(n: number) {
        return Math.asin(1 / n);
    }
    /**
     * Returns the arctangent of number `n`.
     * @param n
     */
    static atan(n: number) {
        return Math.atan(n);
    }
    /**
     * Returns the arccotangent of number `n`.
     * @note New added method, not existed in `Math`.
     * @param n
     */
    static acot(n: number) {
        return Math.atan(1 / n);
    }
    // #endregion

    // #region Hyperbolic functions
    /*
    @see https://en.wikipedia.org/wiki/Hyperbolic_functions
    */
    /**
     * Returns the hyperbolic sine of number `n`.
     * @param n
     */
    static sinh(n: number) {
        return Math.sinh(n);
    }
    /**
     * Returns the hyperbolic cosine of number `n`.
     * @param n
     */
    static cosh(n: number) {
        return Math.cosh(n);
    }
    /**
     * Returns the hyperbolic secant of number `n`.
     * @note New added method, not existed in `Math`.
     * @param n
     */
    static sech(n: number) {
        return 1 / Math.cosh(n);
    }
    /**
     * Returns the hyperbolic cosecant of number `n`.
     * @note New added method, not existed in `Math`.
     * @param n
     */
    static csch(n: number) {
        return 1 / Math.sinh(n);
    }
    /**
     * Returns the hyperbolic tangent of number `n`.
     * @param n
     */
    static tanh(n: number) {
        return Math.tanh(n);
    }
    /**
     * Returns the hyperbolic cotangent of number `n`.
     * @note New added method, not existed in `Math`.
     * @param n
     */
    static coth(n: number) {
        return 1 / Math.tanh(n);
    }
    /**
     * Returns the hyperbolic arcsine of number `n`.
     * @param n
     */
    static asinh(n: number) {
        return Math.asinh(n);
    }
    /**
     * Returns the hyperbolic arccosine of number `n`.
     * @param n
     */
    static acosh(n: number) {
        return Math.acosh(n);
    }
    /**
     * Returns the hyperbolic arcsecant of number `n`.
     * @note New added method, not existed in `Math`.
     * @param n
     */
    static asech(n: number) {
        return Math.acosh(1 / n);
    }
    /**
     * Returns the hyperbolic arccosecant of number `n`.
     * @note New added method, not existed in `Math`.
     * @param n
     */
    static acsch(n: number) {
        return Math.asinh(1 / n);
    }
    /**
     * Returns the hyperbolic arctangent of number `n`.
     * @param n
     */
    static atanh(n: number) {
        return Math.atanh(n);
    }
    /**
     * Returns the hyperbolic arccotangent of number `n`.
     * @note New added method, not existed in `Math`.
     * @param n
     */
    static acoth(n: number) {
        return Math.atanh(1 / n);
    }
    // #endregion

    /**
     * Returns the arctangent with two numbers: `y` and `x`.
     * @see https://tc39.es/ecma262/#sec-math.atan2
     * When `y` and `x` are respectively equal to `±0`, the value of `Math.atan2` is specified rather than calculated.
     * @param y
     * @param x
     */
    static atan2(y: number, x: number) {
        return Math.atan2(y, x);
    }
    /**
     * Returns the absolute value of number `n`.
     * @param n
     */
    static abs(n: number) {
        return Math.abs(n);
    }
    /**
     * Returns the square root of number `n`.
     * @param n
     */
    static sqrt(n: number) {
        return Math.sqrt(n);
    }
    /**
     * Returns the cube root of number `n`.
     * @param n
     */
    static cbrt(n: number) {
        return Math.cbrt(n);
    }
    /**
     * Returns the base $e$(the base of natural logarithms) raised to the power of the exponent `n`.
     * @param n
     */
    static exp(n: number) {
        return Math.exp(n);
    }
    /**
     * Returns the base `b` raised to the power of the exponent `n`.
     * @param b
     * @param n
     */
    static pow(b: number, n: number) {
        return Math.pow(b, n);
    }
    /**
     * Returns the square root of the sum of squares of its arguments `values`.
     * @param values
     */
    static hypot(...values: number[]) {
        return Math.hypot(...values);
    }
    /**
     * Returns the natural logarithm (base $e$) of number `n`, or the base `b` logarithm of number `n`, if `b` is not `undefined`.
     * @note Modified method, different from the one in `Math`.
     * @param n
     */
    static log(n: number, b?: number) {
        return b === undefined ? Math.log(n) : Math.log(n) / Math.log(b);
    }
    /**
     * Returns the base 10 logarithm of number `n`.
     * @param n
     */
    static log10(n: number) {
        return Math.log10(n);
    }
    /**
     * Returns the base 2 logarithm of number `n`.
     * @param n
     */
    static log2(n: number) {
        return Math.log2(n);
    }
    /**
     * Returns accurate result of $\ln(1+n)$.
     * @param n
     */
    static log1p(n: number) {
        return Math.log1p(n);
    }
    /**
     * Returns accurate result of $e^{n}-1$.
     * @param n
     */
    static expm1(n: number) {
        return Math.expm1(n);
    }
    /**
     * Returns the smallest integer greater than or equal to number `n`.
     * @param n
     */
    static ceil(n: number) {
        return Math.ceil(n);
    }
    /**
     * Returns the largest integer less than or equal to number `n`.
     * @param n
     */
    static floor(n: number) {
        return Math.floor(n);
    }
    /**
     * Returns the value of number `n` rounded to the nearest integer.
     * @param n
     */
    static round(n: number) {
        return Math.round(n);
    }
    /**
     * Returns the integer part of number `n` by removing any fractional digits.
     * @param n
     */
    static trunc(n: number) {
        return Math.trunc(n);
    }
    /**
     * Returns a pseudorandom number in $[0,1)$.
     */
    static random() {
        return Math.random();
    }
    /**
     * Returns the larger of a set of supplied numeric expressions `values`.
     * @param values
     */
    static max(...values: number[]) {
        return Math.max(...values);
    }
    /**
     * Returns the smaller of a set of supplied numeric expressions `values`.
     * @param values
     */
    static min(...values: number[]) {
        return Math.min(...values);
    }
    /**
     * Returns the sign of number `n`.
     * @param n
     */
    static sign(n: number) {
        return Math.sign(n);
    }
    /**
     * Returns the nearest 32-bit single precision float representation of number `n`.
     * @param n
     */
    static fround(n: number) {
        return Math.fround(n);
    }
    /**
     * Returns the result of 32-bit multiplication of two numbers.
     * @param a
     * @param b
     */
    static imul(a: number, b: number) {
        return Math.imul(a, b);
    }
    /**
     * Returns the number of leading zero bits in the 32-bit binary representation of number `n`.
     * @param n
     */
    static clz32(n: number) {
        return Math.clz32(n);
    }
    /**
     * Returns the GCD(greatest common divisor) of the integers `a` and `b`.
     * @note New added method, not existed in `Math`.
     * @see https://en.wikipedia.org/wiki/Greatest_common_divisor
     * @param a
     * @param b
     */
    static gcd(a: number, b: number) {
        a = Math.abs(a);
        b = Math.abs(b);
        if (b > a) [a, b] = [b, a];
        while (true) {
            if (b === 0) return a;
            a %= b;
            if (a === 0) return b;
            b %= a;
        }
    }
    /**
     * Returns the LCM(least common multiple) of the integers `a` and `b`.
     * @note New added method, not existed in `Math`.
     * @see https://en.wikipedia.org/wiki/Least_common_multiple
     * @param a
     * @param b
     */
    static lcm(a: number, b: number) {
        a = Math.abs(a);
        b = Math.abs(b);
        return (a * b) / Maths.gcd(a, b);
    }
    /**
     * Returns the sum of supplied numeric expressions `values`.
     * @note New added method, not existed in `Math`.
     * @param values
     */
    static sum(...values: number[]) {
        return values.reduce((acc, v) => acc + v, 0);
    }
    /**
     * Returns the average of supplied numeric expressions `values`.
     * @note New added method, not existed in `Math`.
     * @param values
     */
    static avg(...values: number[]) {
        return Maths.sum(...values) / values.length;
    }
    /**
     * Lerp between `u` and `v` by `t`.
     * @note New added method, not existed in `Math`.
     * @see https://en.wikipedia.org/wiki/Linear_interpolation
     * @param u
     * @param v
     * @param t
     */
    static lerp(u: number, v: number, t: number) {
        return (1 - t) * u + t * v;
    }
    /**
     * Clamps number `n` between the lower bound `l` and the upper bound `u`.
     * @note New added method, not existed in `Math`.
     * @summary
     * - If `n` < `l`, then returns `l`.
     * - If `n` > `u`, then returns `u`.
     * - Else returns `n`.
     * @param n
     * @param l
     * @param u
     */
    static clamp(n: number, l: number, u: number): number {
        if (l > u) [l, u] = [u, l];
        return n < l ? l : n > u ? u : n;
    }
}
export default Maths;
