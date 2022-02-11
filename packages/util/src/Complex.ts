import Vector2 from "./Vector2";
import Maths from "./Maths";

import type { StaticClass } from "./types";

interface Complex extends StaticClass {}
class Complex {
    /**
     * The imaginary unit, the square root of -1.
     */
    static i() {
        return [0, 1] as [number, number];
    }
    /**
     * The `real` part (first entry) of complex number `c`.
     * @param c
     * @param real
     */
    static real(c: [number, number], real?: number) {
        if (real !== undefined) c[0] = real;
        return c[0];
    }
    /**
     * The `imag(imaginary)` part (second entry) of complex number `c`.
     * @param c
     * @param imag
     */
    static imag(c: [number, number], imag?: number) {
        if (imag !== undefined) c[1] = imag;
        return c[1];
    }
    /**
     * Whether complex number `c` is purely real number.
     * @param c
     */
    static isPurelyReal(c: [number, number]) {
        return c[1] === 0;
    }
    /**
     * Whether complex number `c` is purely imaginary number.
     * @param c
     */
    static isPurelyImag(c: [number, number]) {
        return c[0] === 0;
    }
    /**
     * The modulus of complex number `c`.
     * @param c
     */
    static modulus(c: [number, number]) {
        return Vector2.magnitude(c);
    }
    /**
     * The squared modulus of complex number `c`.
     * @param c
     */
    static squaredModulus(c: [number, number]) {
        return Vector2.squaredMagnitude(c);
    }
    /**
     * The argument of complex number `c`.
     * @param c
     */
    static argument(c: [number, number]) {
        return Vector2.angle(c);
    }
    /**
     * Returns a new complex number from argument `a` and modulus `m`
     * @param a
     * @param m
     */
    static from(a: number, m: number) {
        return Vector2.from2(a, m);
    }
    /**
     * Returns a new complex number of complex number `c1` adding complex number `c2`.
     * @param c1
     * @param c2
     */
    static add(c1: [number, number], c2: [number, number]) {
        return Vector2.add(c1, c2);
    }
    /**
     * Returns a new complex number of complex number `c1` subtracting complex number `c2`.
     * @param c1
     * @param c2
     */
    static subtract(c1: [number, number], c2: [number, number]) {
        return Complex.add(c1, Complex.negative(c2));
    }
    /**
     * Returns a new complex number of complex number `c1` multiplying complex number `c2`.
     * @param c1
     * @param c2
     */
    static multiply(c1: [number, number], c2: [number, number]) {
        const [re1, im1] = c1;
        const [re2, im2] = c2;
        return [re1 * re2 - im1 * im2, re1 * im2 + im1 * re2] as [number, number];
    }
    /**
     * Returns a new complex number of complex number `c1` dividing complex number `c2`.
     * @param c1
     * @param c2
     */
    static divide(c1: [number, number], c2: [number, number]) {
        return Complex.multiply(c1, Complex.reciprocal(c2));
    }
    /**
     * Returns the negative of complex number `c`.
     * @param c
     */
    static negative(c: [number, number]) {
        return Vector2.negative(c);
    }
    /**
     * Returns the reciprocal of complex number `c`.
     * @param c
     */
    static reciprocal(c: [number, number]) {
        const [re, im] = c;
        const d = re ** 2 + im ** 2;
        return [re / d, -im / d] as [number, number];
    }
    /**
     * Returns a new complex number of complex number `c` multiplying a scalar `s`.
     * @param c
     * @param s
     */
    static scalarMultiply(c: [number, number], s: number) {
        return Vector2.scalarMultiply(c, s);
    }
    /**
     * Returns the conjugate of complex number `c`.
     * @param c
     */
    static conjugate(c: [number, number]) {
        return [c[0], -c[1]] as [number, number];
    }
    /**
     * Return the base $e$(the base of natural logarithms) raised to the power of the complex exponent `c`.
     * @param c
     */
    static exp(c: [number, number]) {
        const [re, im] = c;
        return [Maths.exp(re) * Maths.cos(im), Maths.exp(re) * Maths.sin(im)] as [number, number];
    }
    /**
     * Return the sine of complex number `c`.
     * @param c
     */
    static sin(c: [number, number]) {
        const [re, im] = c;
        return [Maths.sin(re) * Maths.cosh(im), Maths.cos(re) * Maths.sinh(im)] as [number, number];
    }
    /**
     * Return the cosine of complex number `c`.
     * @param c
     */
    static cos(c: [number, number]) {
        const [re, im] = c;
        return [Maths.cos(re) * Maths.cosh(im), -Maths.sin(re) * Maths.sinh(im)] as [number, number];
    }
    /**
     * Return the secant of complex number `c`.
     * @param c
     */
    static sec(c: [number, number]) {
        return Complex.reciprocal(Complex.cos(c));
    }
    /**
     * Return the cosecant of complex number `c`.
     * @param c
     */
    static csc(c: [number, number]) {
        return Complex.reciprocal(Complex.sin(c));
    }
    /**
     * Return the tangent of complex number `c`.
     * @param c
     */
    static tan(c: [number, number]) {
        return Complex.divide(Complex.sin(c), Complex.cos(c));
    }
    /**
     * Return the cotangent of complex number `c`.
     * @param c
     */
    static cot(c: [number, number]) {
        return Complex.divide(Complex.cos(c), Complex.sin(c));
    }
}

export default Complex;
