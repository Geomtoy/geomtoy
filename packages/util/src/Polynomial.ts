import Maths from "./Maths";
import Complex from "./Complex";
import Type from "./Type";
import Utility from "./Utility";
import type { StaticClass } from "./types";
import rpoly from "./Polynomial.rpoly";

const MAX_ROOT_FINDING_DEGREE = 100;
/*
The polynomial here refers to the "univariate real polynomial".
*/
interface Polynomial extends StaticClass {}
class Polynomial {
    constructor() {
        throw new Error("[G]`Polynomial` can not used as a constructor.");
    }

    /**
     * The coefficient of the term at `degree`(the exponent on the variable).
     * @param p
     * @param degree
     * @param value
     */
    static coefficient(p: number[], degree: number, value?: number) {
        const d = Polynomial.degree(p);
        if (value !== undefined) p[degree - d] = value;
        return p[degree - d];
    }
    /**
     * Returns the degree of polynomial `p`.
     * @description
     * If `p` is an empty array, this method returns `-Infinity`.
     * @param p
     */
    static degree(p: number[]) {
        if (p.length > 0) return p.length - 1;
        return -Infinity;
    }
    /**
     * This method can both amend and simplify polynomial `p`.
     * @description
     * The coefficient of the highest exponent(highest order power) of polynomial `p`, that is the first element of `p` should not be 0.
     * This method trims the leading 0 of `p` and returns a new polynomial.
     * If `epsilon` is provided, the coefficients whose absolute value is less than `epsilon` will be treated as 0.
     * @throws
     * If all the coefficients are 0 or `p` is an empty array, an `Error` will be thrown.
     * @param p
     * @param epsilon
     */
    static simplify(p: number[], epsilon?: number) {
        const foundIndex = p.findIndex(c => Maths.sign(c, epsilon) !== 0);
        if (foundIndex === -1) throw new Error("[G]Zero polynomial is found.");
        return p.slice(foundIndex);
    }
    /**
     * Returns a new polynomial from `roots`.
     * @description
     * Given roots $r_1, r_2, ..., r_n$, this method returns the polynomial that factors as $(x-r_1)(x-r_2)...(x-r_n)$.
     * @note
     * - Since our polynomials only support real coefficients, hence any non-real zeroes must occur in complex conjugate pairs, so complex roots should be provided in conjugate pairs.
     * - Let's say `r` is a root, the multiplicity of `r` is `k`, then you should provide `r` `k` times. For example, if 1 is a root of multiplicity 2, then provide `[1, 1]`.
     * @throws
     * If complex roots are not in conjugate pairs, an `Error` will be thrown.
     * @param roots
     */
    static from(roots: (number | [number, number])[]) {
        let pc: [number, number][] = [[1, 0]];
        const complexRoots = Utility.sort(
            roots.filter((r): r is [number, number] => Type.isComplex(r) && Complex.imag(r) !== 0),
            [Complex.real, Complex.imag]
        );
        while (complexRoots.length > 0) {
            const [a, b] = complexRoots;
            if (b === undefined || !Utility.isEqualTo(a, Complex.conjugate(b))) {
                throw new Error("[G]The complex roots of a polynomial should be conjugate pairs.");
            }
            complexRoots.shift();
            complexRoots.shift();
        }

        roots.forEach((root, i) => {
            const cRoot = Type.isComplex(root) ? root : ([root, 0] as [number, number]);
            pc.forEach((c, j) => {
                pc[j] = Complex.add(Complex.scalarMultiply(Complex.multiply(c, cRoot), -1), j < i ? pc[j + 1] : [0, 0]);
            });
            pc.unshift([1, 0]);
        });
        return Array.from(pc, x => Complex.real(x));
    }
    /**
     * Returns a new polynomial of adding `p1` by `p2`.
     * @param p1
     * @param p2
     */
    static add(p1: number[], p2: number[]) {
        const d1 = Polynomial.degree(p1);
        const d2 = Polynomial.degree(p2);
        const dMax = Maths.max(d1, d2);
        let ret = new Array(dMax + 1).fill(0);
        p1.forEach((c, i) => {
            ret[dMax - d1 + i] += c;
        });
        p2.forEach((c, i) => {
            ret[dMax - d2 + i] += c;
        });
        return Polynomial.simplify(ret);
    }
    /**
     * Returns a new polynomial of subtracting `p1` by `p2`.
     * @param p1
     * @param p2
     */
    static subtract(p1: number[], p2: number[]) {
        return Polynomial.add(p1, Polynomial.scalarMultiply(p2, -1));
    }
    /**
     * Returns a new polynomial of multiplying `p1` by `p2`.
     * @param p1
     * @param p2
     */
    static multiply(p1: number[], p2: number[]) {
        const d1 = Polynomial.degree(p1);
        const d2 = Polynomial.degree(p2);
        let ret = new Array(d1 + d2 + 1).fill(0);
        p1.forEach((c1, i) => {
            p2.forEach((c2, j) => {
                ret[i + j] += c1 * c2;
            });
        });
        return ret;
    }
    /**
     * Returns the quotient polynomial and remainder polynomial of dividing `p1` by `p2`.
     * @param p1
     * @param p2
     */
    static divide(p1: number[], p2: number[]): [quotient: number[], remainder: number[]] {
        const d1 = Polynomial.degree(p1);
        const d2 = Polynomial.degree(p2);
        if (d2 > d1) {
            throw new Error("[G]Tried to divide by a polynomial of higher degree.");
        }
        const copy = [...p1];
        const l = d1 - d2 + 1;
        const normalizer = p2[0];
        for (let i = 0; i < l; i++) {
            copy[i] /= normalizer;
            const coef = copy[i];
            for (let j = 1; j <= d2; j++) {
                copy[i + j] -= p2[j] * coef;
            }
        }
        const q = copy.slice(0, l);
        const r = copy.slice(l);
        return [q, r] as [number[], number[]];
    }

    static compose(p1: number[], p2: number[]) {
        return p1.reduce((acc, c) => {
            if (acc.length == 0) {
                if (c !== 0) acc.push(c);
            } else {
                acc = Polynomial.multiply(acc, p2);
                acc[acc.length - 1] += c;
            }
            return acc;
        }, [] as number[]);
    }

    /**
     * Returns a new polynomial of polynomial `p` multiplying a scalar `s`.
     * @param p
     * @param s
     */
    static scalarMultiply(p: number[], s: number) {
        return p.map(c => c * s);
    }

    /**
     * Returns the monic polynomial of polynomial `p`, in which the leading coefficient is equal to 1.
     * @see https://en.wikipedia.org/wiki/Monic_polynomial
     * @param p
     */
    static monic(p: number[]) {
        return Polynomial.scalarMultiply(p, 1 / p[0]);
    }
    /**
     * Evaluates polynomial `p` at the real number `number`.
     * @param p
     * @param number
     */
    static evaluate(p: number[], number: number): number;
    /**
     * Evaluates polynomial `p` at the complex number `number`.
     * @param p
     * @param number
     */
    static evaluate(p: number[], number: [number, number]): [number, number];
    static evaluate(p: number[], number: number | [number, number]) {
        if (Type.isComplex(number)) {
            return p.reduce((acc, c) => Complex.add(Complex.multiply(acc, number), [c, 0] as [number, number]), [0, 0] as [number, number]);
        }
        return p.reduce((acc, c) => acc * number + c, 0);
    }
    /**
     * Compute the `n`th formal derivative of polynomial `p`.
     * @param p
     * @param n
     */
    static derivative(p: number[], n = 1): number[] {
        if (n === 0) return [...p];
        const d = Polynomial.degree(p);
        if (Polynomial.degree(p) < n) {
            throw new Error(`[G]A polynomial of degree ${p} has no ${n}-th derivative.`);
        }
        if (n === 1) return p.slice(0, -1).map((c, i) => (d - i) * c);
        return Polynomial.derivative(Polynomial.derivative(p, n - 1));
    }
    /**
     * Whether polynomial `p` is valid(is a real polynomial).
     * @param p
     */
    static isValid(p: number[]) {
        return p.every(elem => Type.isRealNumber(elem)) && p[0] !== 0;
    }
    /**
     * Returns the Legendre polynomial of degree `n`.
     * @see https://en.wikipedia.org/wiki/Legendre_polynomials
     * @param n
     */
    static legendre(n: number) {
        function tailLegendre(n: number, cn: number = 2, polyNm1: number[] = [1, 0], polyNm2: number[] = [1]): number[] {
            if (n === 0) return polyNm2;
            if (n === 1) return polyNm1;
            // prettier-ignore
            const polyN = Polynomial.scalarMultiply(
                Polynomial.add(
                    Polynomial.scalarMultiply(polyNm1.concat(0) /* degree up first */, 2 * cn - 1), 
                    Polynomial.scalarMultiply(polyNm2, -(cn - 1))
                ),
                1 / cn
            );
            return tailLegendre(n - 1, cn + 1, polyN, polyNm1);
        }
        return tailLegendre(n);
    }

    /**
     * Returns roots of polynomial equation `p`.
     * @note
     * - Only polynomials with degree up to 100 are supported.
     * - The returned roots are all present in complex number.
     * - The number of roots is the degree of `p`, in other words, the multiplicity of roots is considered.
     * - The returned roots are ordered as follows:
     *      - Pure real roots come first, then the complex roots.
     *      - For pure real roots, the one smaller comes first.
     *      - For complex roots, the one with smaller real part comes first. If the real part is equal, the one with smaller imaginary part comes first.
     *      - Complex roots come in conjugate pairs.
     * @throws
     * - If the degree of polynomial of `p` is 0, an `Error` will be thrown.
     * - If the degree of polynomial of `p` is greater than 100, an `Error` will be thrown.
     * @param p
     * @param epsilon
     */
    static roots(p: number[], epsilon?: number) {
        const d = Polynomial.degree(p);

        if (d === 0) {
            throw new Error("[G]The zero polynomial does not have discrete roots.");
        }
        if (d > MAX_ROOT_FINDING_DEGREE) {
            throw new Error(`[G]The degree of polynomial \`p\` should not be greater than ${MAX_ROOT_FINDING_DEGREE}.`);
        }

        const reals: number[] = [];
        const imags: number[] = [];
        rpoly(p, reals, imags);

        const roots: (number | [number, number])[] = [];
        for (let i = 0; i < d; i++) {
            if (imags[i] === 0) roots.push(reals[i]);
            else roots.push([reals[i], imags[i]]);
        }
        return Utility.sort(roots, [Type.isComplex, r => r]);
    }

    static interpolate() {}
    static bisection(p: number[], min: number, max: number) {}
    static rootsInInterval(p: number[], min: number, max: number) {}
}
export default Polynomial;
