/**
 * Reference
 * @see https://www.codeproject.com/Articles/566614/Elliptic-integrals
 */

import { Maths } from "@geomtoy/util";

/**
 * Computes the $R_F$ from Carlson symmetric form
 * @see https://en.wikipedia.org/wiki/Carlson_symmetric_form#Series_Expansion
 * @param x
 * @param y
 * @param z
 */
function _rf(x: number, y: number, z: number) {
    let a = 0;
    let lambda = 0;
    let dx = 0;
    let dy = 0;
    let dz = 0;
    const minError = 1e-10;

    do {
        lambda = Maths.sqrt(x * y) + Maths.sqrt(y * z) + Maths.sqrt(z * x);
        x = (x + lambda) / 4;
        y = (y + lambda) / 4;
        z = (z + lambda) / 4;
        a = (x + y + z) / 3;

        dx = 1 - x / a;
        dy = 1 - y / a;
        dz = 1 - z / a;
    } while (Maths.max(Maths.abs(dx), Maths.abs(dy), Maths.abs(dz)) > minError);

    let e2 = dx * dy + dy * dz + dz * dx;
    let e3 = dy * dx * dz;

    // http://dlmf.nist.gov/19.36#E1
    let result = 1 - (1 / 10) * e2 + (1 / 14) * e3 + (1 / 24) * Maths.pow(e2, 2) - (3 / 44) * e2 * e3 - (5 / 208) * Maths.pow(e2, 3) + (3 / 104) * Maths.pow(e3, 2) + (1 / 16) * Maths.pow(e2, 2) * e3;
    result *= 1 / Maths.sqrt(a);
    return result;
}

/**
 * Computes the $R_D$ from Carlson symmetric form
 * @see https://en.wikipedia.org/wiki/Carlson_symmetric_form#Series_Expansion
 * @param x
 * @param y
 * @param z
 */
function _rd(x: number, y: number, z: number) {
    let sum = 0;
    let fac = 0;
    let lambda = 0;
    let dx = 0;
    let dy = 0;
    let dz = 0;
    let a = 0;
    const minError = 1e-10;

    sum = 0;
    fac = 1;

    do {
        lambda = Maths.sqrt(x * y) + Maths.sqrt(y * z) + Maths.sqrt(z * x);
        sum += fac / (Maths.sqrt(z) * (z + lambda));

        fac /= 4;

        x = (x + lambda) / 4;
        y = (y + lambda) / 4;
        z = (z + lambda) / 4;

        a = (x + y + 3 * z) / 5;

        dx = 1 - x / a;
        dy = 1 - y / a;
        dz = 1 - z / a;
    } while (Maths.max(Maths.abs(dx), Maths.abs(dy), Maths.abs(dz)) > minError);

    let e2 = dx * dy + dy * dz + 3 * Maths.pow(dz, 2) + 2 * dz * dx + dx * dz + 2 * dy * dz;
    let e3 = Maths.pow(dz, 3) + dx * Maths.pow(dz, 2) + 3 * dx * dy * dz + 2 * dy * Maths.pow(dz, 2) + dy * Maths.pow(dz, 2) + 2 * dx * Maths.pow(dz, 2);
    let e4 = dy * Maths.pow(dz, 3) + dx * Maths.pow(dz, 3) + dx * dy * Maths.pow(dz, 2) + 2 * dx * dy * Maths.pow(dz, 2);
    let e5 = dx * dy * Maths.pow(dz, 3);

    // http://dlmf.nist.gov/19.36#E2
    // prettier-ignore
    let  result = (1 - (3 / 14) * e2 + (1 / 6) * e3 + (9 / 88) * Maths.pow(e2, 2) - (3 / 22) * e4 - (9 / 52) * e2 * e3 + (3 / 26) * e5 - (1 / 16) * Maths.pow(e2, 3) + (3 / 40) * Maths.pow(e3, 2) + (3 / 20) * e2 * e4 + (45 / 272) * Maths.pow(e2, 2) * e3 - (9 / 68) * (e3 * e4 + e2 * e5));
    result = 3.0 * sum + (fac * result) / (a * Maths.sqrt(a));
    return result;
}

/**
 * Return the complete elliptic integral of the first kind.
 * @see https://en.wikipedia.org/wiki/Carlson_symmetric_form#Complete_elliptic_integrals
 * @param ksq
 * @returns
 */
function completeEllipticIntegralOfFirstKind(ksq: number) {
    return _rf(0, 1 - ksq, 1);
}
/**
 * Return the complete elliptic integral of the second kind.
 * @see https://en.wikipedia.org/wiki/Carlson_symmetric_form#Complete_elliptic_integrals
 * @param ksq
 * @returns
 */
function completeEllipticIntegralOfSecondKind(ksq: number) {
    return _rf(0, 1 - ksq, 1) - (1 / 3) * ksq * _rd(0, 1 - ksq, 1);
}

/**
 * Returns the incomplete elliptic integral of the first kind.
 * @see https://en.wikipedia.org/wiki/Carlson_symmetric_form#Incomplete_elliptic_integrals
 * @param angle
 * @param ksq
 */
function incompleteEllipticIntegralOfFirstKind(angle: number, ksq: number) {
    return Maths.sin(angle) * _rf(Maths.pow(Maths.cos(angle), 2), 1 - ksq * Maths.pow(Maths.sin(angle), 2), 1);
}
/**
 * Returns the incomplete elliptic integral of the second kind.
 * @see https://en.wikipedia.org/wiki/Carlson_symmetric_form#Incomplete_elliptic_integrals
 * @param angle
 * @param ksq
 */
function incompleteEllipticIntegralOfSecondKind(angle: number, ksq: number) {
    return (
        Maths.sin(angle) * _rf(Maths.pow(Maths.cos(angle), 2), 1 - ksq * Maths.pow(Maths.sin(angle), 2), 1) -
        (1 / 3) * ksq * Maths.pow(Maths.sin(angle), 3) * _rd(Maths.pow(Maths.cos(angle), 2), 1 - ksq * Maths.pow(Maths.sin(angle), 2), 1)
    );
}

export { completeEllipticIntegralOfFirstKind, completeEllipticIntegralOfSecondKind, incompleteEllipticIntegralOfFirstKind, incompleteEllipticIntegralOfSecondKind };
