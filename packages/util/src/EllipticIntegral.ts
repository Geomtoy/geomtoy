/**
 * Reference:
 * @see https://www.codeproject.com/Articles/566614/Elliptic-integrals
 */

import Maths from "./Maths";

import type { StaticClass } from "./types";

interface EllipticIntegral extends StaticClass {}
class EllipticIntegral {
    /**
     * Return the complete elliptic integral of the first kind.
     * @see https://en.wikipedia.org/wiki/Carlson_symmetric_form#Complete_elliptic_integrals
     * @param ksq
     * @returns
     */
    static completeEllipticIntegralOfFirstKind(ksq: number) {
        return EllipticIntegral._rf(0, 1 - ksq, 1);
    }
    /**
     * Return the complete elliptic integral of the second kind.
     * @see https://en.wikipedia.org/wiki/Carlson_symmetric_form#Complete_elliptic_integrals
     * @param ksq
     * @returns
     */
    static completeEllipticIntegralOfSecondKind(ksq: number) {
        return EllipticIntegral._rf(0, 1 - ksq, 1) - (1 / 3) * ksq * EllipticIntegral._rd(0, 1 - ksq, 1);
    }

    /**
     * Returns the incomplete elliptic integral of the first kind.
     * @see https://en.wikipedia.org/wiki/Carlson_symmetric_form#Incomplete_elliptic_integrals
     * @param angle
     * @param ksq
     */
    static incompleteEllipticIntegralOfFirstKind(angle: number, ksq: number) {
        return Maths.sin(angle) * EllipticIntegral._rf(Maths.pow(Maths.cos(angle), 2), 1 - ksq * Maths.pow(Maths.sin(angle), 2), 1);
    }
    /**
     * Returns the incomplete elliptic integral of the second kind.
     * @see https://en.wikipedia.org/wiki/Carlson_symmetric_form#Incomplete_elliptic_integrals
     * @param angle
     * @param ksq
     */
    static incompleteEllipticIntegralOfSecondKind(angle: number, ksq: number) {
        return (
            Maths.sin(angle) * EllipticIntegral._rf(Maths.pow(Maths.cos(angle), 2), 1 - ksq * Maths.pow(Maths.sin(angle), 2), 1) -
            (1 / 3) * ksq * Maths.pow(Maths.sin(angle), 3) * EllipticIntegral._rd(Maths.pow(Maths.cos(angle), 2), 1 - ksq * Maths.pow(Maths.sin(angle), 2), 1)
        );
    }
    /**
     * Computes the $R_F$ from Carlson symmetric form
     * @see https://en.wikipedia.org/wiki/Carlson_symmetric_form#Series_Expansion
     * @param x
     * @param y
     * @param z
     */
    private static _rf(x: number, y: number, z: number) {
        let result = 0;
        let A = 0;
        let lambda = 0;
        let dx = 0;
        let dy = 0;
        let dz = 0;
        const MinError = 1e-7;

        do {
            lambda = Maths.sqrt(x * y) + Maths.sqrt(y * z) + Maths.sqrt(z * x);
            x = (x + lambda) / 4;
            y = (y + lambda) / 4;
            z = (z + lambda) / 4;
            A = (x + y + z) / 3;

            dx = 1 - x / A;
            dy = 1 - y / A;
            dz = 1 - z / A;
        } while (Maths.max(Maths.abs(dx), Maths.abs(dy), Maths.abs(dz)) > MinError);

        let E2 = 0;
        let E3 = 0;
        E2 = dx * dy + dy * dz + dz * dx;
        E3 = dy * dx * dz;

        // http://dlmf.nist.gov/19.36#E1
        result = 1 - (1 / 10) * E2 + (1 / 14) * E3 + (1 / 24) * Maths.pow(E2, 2) - (3 / 44) * E2 * E3 - (5 / 208) * Maths.pow(E2, 3) + (3 / 104) * Maths.pow(E3, 2) + (1 / 16) * Maths.pow(E2, 2) * E3;
        result *= 1 / Maths.sqrt(A);
        return result;
    }

    /**
     * Computes the $R_D$ from Carlson symmetric form
     * @see https://en.wikipedia.org/wiki/Carlson_symmetric_form#Series_Expansion
     * @param x
     * @param y
     * @param z
     */
    private static _rd(x: number, y: number, z: number) {
        let sum = 0;
        let fac = 0;
        let lambda = 0;
        let dx = 0;
        let dy = 0;
        let dz = 0;
        let A = 0;
        const MinError = 1e-7;

        sum = 0;
        fac = 1;

        do {
            lambda = Maths.sqrt(x * y) + Maths.sqrt(y * z) + Maths.sqrt(z * x);
            sum += fac / (Maths.sqrt(z) * (z + lambda));

            fac /= 4;

            x = (x + lambda) / 4;
            y = (y + lambda) / 4;
            z = (z + lambda) / 4;

            A = (x + y + 3 * z) / 5;

            dx = 1 - x / A;
            dy = 1 - y / A;
            dz = 1 - z / A;
        } while (Maths.max(Maths.abs(dx), Maths.abs(dy), Maths.abs(dz)) > MinError);

        let E2 = 0;
        let E3 = 0;
        let E4 = 0;
        let E5 = 0;
        let result = 0;
        E2 = dx * dy + dy * dz + 3 * Maths.pow(dz, 2) + 2 * dz * dx + dx * dz + 2 * dy * dz;
        E3 = Maths.pow(dz, 3) + dx * Maths.pow(dz, 2) + 3 * dx * dy * dz + 2 * dy * Maths.pow(dz, 2) + dy * Maths.pow(dz, 2) + 2 * dx * Maths.pow(dz, 2);
        E4 = dy * Maths.pow(dz, 3) + dx * Maths.pow(dz, 3) + dx * dy * Maths.pow(dz, 2) + 2 * dx * dy * Maths.pow(dz, 2);
        E5 = dx * dy * Maths.pow(dz, 3);

        // http://dlmf.nist.gov/19.36#E2
        // prettier-ignore
        result = (1 - (3 / 14) * E2 + (1 / 6) * E3 + (9 / 88) * Maths.pow(E2, 2) - (3 / 22) * E4 - (9 / 52) * E2 * E3 + (3 / 26) * E5 - (1 / 16) * Maths.pow(E2, 3) + (3 / 40) * Maths.pow(E3, 2) + (3 / 20) * E2 * E4 + (45 / 272) * Maths.pow(E2, 2) * E3 - (9 / 68) * (E3 * E4 + E2 * E5));
        result = 3.0 * sum + (fac * result) / (A * Maths.sqrt(A));
        return result;
    }
}

export default EllipticIntegral;
