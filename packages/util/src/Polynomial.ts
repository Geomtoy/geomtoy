import Complex from "./Complex";
import Float from "./Float";
import Maths from "./Maths";
import { solve } from "./Polynomial.root";
import Type from "./Type";
import type { RootMultiplicity, StaticClass } from "./types";
import Utility from "./Utility";

const MAX_ROOT_FINDING_DEGREE = 100;

function trimLeadingZero(p: number[]) {
    while (p[0] === 0) p.shift();
    return p;
}
function findFirstNonZero(p: number[]) {
    return p.findIndex(n => n !== 0);
}

/*
The polynomial here refers to the "univariate real polynomial". 
*/
interface Polynomial extends StaticClass {}
class Polynomial {
    constructor() {
        throw new Error("[G]`Polynomial` can not used as a constructor.");
    }
    /**
     * Whether `v` is a valid polynomial.
     * @param v
     */
    static is(v: any): v is number[] {
        return Type.isArray(v) && v.length > 0 && v.every(elem => Type.isRealNumber(elem));
    }
    /**
     * Returns an empty array representing zero polynomial.
     */
    static zero() {
        return [];
    }
    /**
     * Whether polynomial `p` is a zero polynomial.
     * @param p
     */
    static isZero(p: number[]) {
        const index = findFirstNonZero(p);
        return index === -1;
    }
    /**
     * Whether polynomial `p` is a constant polynomial(including zero polynomial).
     * @param p
     */
    static isConstant(p: number[]) {
        const index = findFirstNonZero(p);
        return index === -1 || index === p.length - 1;
    }
    /**
     * The coefficient of the term at `degree`(the exponent on the variable).
     * @param p
     * @param degree
     * @param value
     */
    static coef(p: number[], degree: number, value?: number) {
        const index = p.length - 1 - degree;
        if (index < 0 || degree < 0) {
            console.warn("[G]Getting or setting coefficient failed, `NaN` will be returned.");
            return NaN;
        }

        if (value !== undefined) p[index] = value;
        return p[index];
    }
    /**
     * Returns the degree of polynomial `p`.
     * @param p
     */
    static degree(p: number[]) {
        return p.length - 1;
    }

    static standardizedDegree(p: number[]) {
        const index = findFirstNonZero(p);
        return index === -1 ? -1 : p.length - 1 - index;
    }
    /**
     * Return a new polynomial of polynomial `p` with leading 0 trimmed.
     * @description
     * If `p` is full of 0(or an empty array), a `zero polynomial` will be returned.
     * @param p
     */
    static standardize(p: number[]) {
        return trimLeadingZero([...p]);
    }

    /**
     * Returns a new polynomial of adding `p1` by `p2`.
     * @param p1
     * @param p2
     */
    static add(p1: number[], p2: number[]) {
        const d1 = Polynomial.degree(p1);
        const d2 = Polynomial.degree(p2);
        const dm = Maths.max(d1, d2);
        const s = new Array(dm + 1).fill(0);
        for (let i = 0; i <= d1; i++) {
            s[dm - d1 + i] += p1[i];
        }
        for (let j = 0; j <= d2; j++) {
            s[dm - d2 + j] += p2[j];
        }
        return trimLeadingZero(s);
    }
    /**
     * Returns a new polynomial of subtracting `p1` by `p2`.
     * @param p1
     * @param p2
     */
    static subtract(p1: number[], p2: number[]) {
        const d1 = Polynomial.degree(p1);
        const d2 = Polynomial.degree(p2);
        const dm = Maths.max(d1, d2);
        const d = new Array(dm + 1).fill(0);
        for (let i = 0; i <= d1; i++) {
            d[dm - d1 + i] += p1[i];
        }
        for (let j = 0; j <= d2; j++) {
            d[dm - d2 + j] -= p2[j];
        }
        return trimLeadingZero(d);
    }
    /**
     * Returns a new polynomial of multiplying `p1` by `p2`.
     * @param p1
     * @param p2
     */
    static multiply(p1: number[], p2: number[]) {
        const d1 = Polynomial.degree(p1);
        const d2 = Polynomial.degree(p2);
        const p = new Array(d1 + d2 + 1).fill(0);
        for (let i = 0; i <= d1; i++) {
            for (let j = 0; j <= d2; j++) {
                p[i + j] += p1[i] * p2[j];
            }
        }
        return trimLeadingZero(p);
    }
    /**
     * Returns the quotient polynomial and remainder polynomial of dividing `p1` by `p2`.
     * @param p1
     * @param p2
     */
    static divide(p1: number[], p2: number[]): [quotient: number[], remainder: number[]] {
        if (Polynomial.isZero(p2)) {
            throw new Error("[G]Tried to divide by zero polynomial.");
        }
        const d1 = Polynomial.degree(p1);
        const d2 = Polynomial.degree(p2);
        const q = [];
        const r = [...p1];
        const dd = d1 - d2;
        for (let i = 0; i <= dd; i++) {
            q[i] = r[i] / p2[0];
            for (let j = 0; j <= d2; j++) {
                r[i + j] -= q[i] * p2[j];
            }
        }
        return [trimLeadingZero(q), trimLeadingZero(r.slice(dd))];
    }

    static pow(p: number[], n: number) {
        let r = [1];
        if (n === 0) return r;
        for (let i = n; i > 0; i >>= 1) {
            if (i & 1) r = Polynomial.multiply(r, p);
            p = Polynomial.multiply(p, p);
        }
        return r;
    }

    static compose(p1: number[], p2: number[]) {
        return p1.reduce((acc, c) => {
            acc = Polynomial.multiply(acc, p2);
            if (acc.length === 0) {
                if (c !== 0) acc.push(c);
            } else {
                acc[acc.length - 1] += c;
            }
            return acc;
        }, [] as number[]);
    }

    /**
     * Deflate polynomial `p` with the `root`(either real or complex).
     * @param p
     * @param root
     */
    static deflate(p: number[], root: number | [number, number]) {
        if (Polynomial.isConstant(p)) throw new Error("[G]Constant polynomial can not be deflated.");
        p = [...p];
        const d = Polynomial.degree(p);
        // real root deflation
        if (Type.isNumber(root)) {
            if (root !== 0) {
                let s = 0;
                for (let i = 0; i < d; i++) {
                    p[i] = s = s * root + p[i];
                }
            }
        }
        // complex root deflation
        else {
            if (!Complex.equalTo(root, Complex.zero())) {
                // deflation in conjugate pair
                const r = -2 * Complex.real(root);
                const u = Complex.squaredModulus(root);
                p[1] -= r * p[0];
                for (let i = 2; i < d - 1; i++) {
                    p[i] = p[i] - r * p[i - 1] - u * p[i - 2];
                }
                p.length--;
            }
        }
        p.length--;
        return trimLeadingZero(p);
    }

    /**
     * Returns a new polynomial of polynomial `p` multiplying a scalar `s`.
     * @param p
     * @param s
     */
    static scalarMultiply(p: number[], s: number) {
        if (Polynomial.isZero(p)) return Polynomial.zero();
        return trimLeadingZero(p.map(c => c * s));
    }
    /**
     * Returns the monic polynomial of polynomial `p`, in which the leading coefficient is 1.
     * @param p
     */
    static monic(p: number[]) {
        if (Polynomial.isZero(p)) return Polynomial.zero();
        return p.map(coef => coef / p[0]);
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
        if (Polynomial.isZero(p)) return Type.isNumber(number) ? 0 : [0, 0];
        if (Type.isNumber(number)) {
            let acc = p[0];
            for (let i = 1; i < p.length; i++) {
                acc = acc * number + p[i];
            }
            return acc;
        }

        const r = -2 * Complex.real(number);
        const u = Complex.squaredModulus(number);
        let a = p[0];
        let b = 0;
        let c;
        for (let i = 1; i < p.length - 1; i++) {
            c = p[i] - r * a - u * b;
            b = a;
            a = c;
        }
        const acc = [p[p.length - 1] + Complex.real(number) * a - u * b, Complex.imag(number) * a];
        return acc;
    }
    /**
     * Compute the `n`th derivative of polynomial `p`.
     * @param p
     * @param n
     */
    static derivative(p: number[], n = 1): number[] {
        if (n === 0) return [...p];
        const d = Polynomial.degree(p);
        if (d < n) return Polynomial.zero();
        if (n === 1) {
            p = p.slice(0, -1);
            return p.map((c, i) => (d - i) * c);
        }
        return Polynomial.derivative(Polynomial.derivative(p, n - 1));
    }
    /**
     * Compute the `n`th antiderivative of polynomial `p`(the constant term is 0).
     * @param p
     * @param n
     */
    static antiderivative(p: number[], n = 1): number[] {
        if (n === 0) return [...p];
        const d = Polynomial.degree(p);
        if (n === 1) {
            p = [...p, 0];
            return p.map((c, i) => c / (d - i + 1));
        }
        return Polynomial.antiderivative(Polynomial.antiderivative(p, n - 1));
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

    static rootsMultiplicity<T extends number | [number, number]>(roots: T[], epsilon: number): RootMultiplicity<T>[] {
        // The `rpoly` algorithm is based on factorization,
        // so if the roots are close enough, then the average of these roots is most likely a multiple root.
        const multipleReal: number[][] = [];
        const multipleComplex: [number, number][][] = [];
        const rsCopy = [...roots];

        main: while (rsCopy.length) {
            const elem = rsCopy.shift()!;
            if (Type.isNumber(elem)) {
                for (let mr of multipleReal) {
                    if (Float.equalTo(mr[0], elem, epsilon)) {
                        mr.push(elem as number);
                        continue main;
                    }
                }
                multipleReal.push([elem]);
            } else {
                for (let mc of multipleComplex) {
                    if (Float.equalTo(Complex.real(mc[0]), Complex.real(elem), epsilon) && Float.equalTo(Complex.imag(mc[0]), Complex.imag(elem), epsilon)) {
                        mc.push(elem as [number, number]);
                        continue main;
                    }
                }
                multipleComplex.push([elem]);
            }
        }

        return [
            ...multipleReal.map(mr => {
                return { root: Maths.avg(...mr), multiplicity: mr.length } as RootMultiplicity<T>;
            }),
            ...multipleComplex.map(mc => {
                const reals = mc.map(c => Complex.real(c));
                const imags = mc.map(c => Complex.imag(c));
                return { root: [Maths.avg(...reals), Maths.avg(...imags)] as [number, number], multiplicity: mc.length } as RootMultiplicity<T>;
            })
        ];
    }
    /**
     * Returns roots of polynomial equation `p`.
     * @note
     * - Only polynomials with degree up to 100 are supported.
     * - Complex roots are present [number, number].
     * - The number of roots is the degree of `p`, in other words, the multiplicity of roots is considered.
     * - If `p` is constant polynomial, `[]` will be returned.
     * @throws
     * - If the degree of polynomial of `p` is greater than 100, an `Error` will be thrown.
     * @param p
     */
    static roots(p: number[], epsilon?: number) {
        if (Polynomial.isConstant(p)) {
            console.warn("[G]Constant polynomial does not have discrete roots.");
            return [];
        }
        p = Polynomial.standardize(p);
        const d = Polynomial.degree(p);
        if (d > MAX_ROOT_FINDING_DEGREE) throw new Error(`[G]The degree of polynomial \`p\` should not be greater than ${MAX_ROOT_FINDING_DEGREE}.`);

        const solutions: [number, number][] = [];
        solve(p, solutions);
        const roots: (number | [number, number])[] = [];

        for (let i = 1; i <= d; i++) {
            if (epsilon === undefined) {
                if (Complex.imag(solutions[i]) === 0) roots.push(Complex.real(solutions[i]));
                else roots.push(solutions[i]);
            } else {
                if (Float.equalTo(Complex.imag(solutions[i]), 0, epsilon)) roots.push(Complex.real(solutions[i]));
                else roots.push(solutions[i]);
            }
        }
        return roots;
    }
}
export default Polynomial;
