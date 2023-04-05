import { Complex, Float, Maths } from "@geomtoy/util";
import { eps } from "../geomtoy";

/**
 * Reference
 * @see https://en.wikipedia.org/wiki/Tangent_half-angle_substitution#Geometry
 * @see https://en.wikipedia.org/wiki/Bézout's_theorem
 */

/**
 * When intersection is at $\pi$, we are not able to give the root through solve the polynomial, because $\tan{\frac{\pi}{2}}=\infty$.
 * @param tanHAPoly
 * @returns
 */
export function rootMultiplicityAtPi(tanHAPoly: number[]) {
    if (Float.equalTo(tanHAPoly[0], 0, Float.UNIT_ROUNDOFF)) {
        if (Float.equalTo(tanHAPoly[1], 0, Float.UNIT_ROUNDOFF)) {
            if (Float.equalTo(tanHAPoly[2], 0, Float.UNIT_ROUNDOFF)) {
                return 3;
            }
            return 2;
        }
        return 1;
    }
    return 0;
}

/**
 * We need to check the complex roots(particularly in touch situation) for the arctangent of a complex number may approximately to be a real number(with every small imaginary part).
 * @param tanHA
 * @returns
 */
export function mapComplexAtanImagZeroToReal(tanHA: number | [number, number]) {
    if (Complex.is(tanHA)) {
        const atan = Complex.atan(tanHA);
        if (Float.equalTo(Complex.imag(atan), 0, eps.complexEpsilon)) return Maths.tan(Complex.real(atan));
        return tanHA;
    }
    return tanHA;
}
