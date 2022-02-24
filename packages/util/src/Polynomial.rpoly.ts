/**
 * Jenkins-Traub real polynomial root finder
 *
 * Translation of `TOMS/493` from Fortran `RPOLY` to C and then to Javascript/Typescript.
 * @see http://www.netlib.org/toms/493
 *
 * This implementation of Jenkins-Traub partially adapts the original code to a C environment by restruction
 * many of the `goto` controls to better fit a block structured form. It also eliminates the global memory
 * allocation in favor of local, dynamic memory management.
 */

import type { RpolyQuadRParam, RpolyQuadSdParam, RpolyCalcParam, RpolyShfParam } from "./types";
import Angle from "./Angle";
import Maths from "./Maths";

const RAD_FAC = Angle.DEG2RAD;
const DBL_MIN = 2.2250738585072014e-308; // DBL_MIN is the smallest positive normal double.
const DBL_MAX = 1.7976931348623157e308; // DBL_MIN is largest positive double.
const LO = DBL_MIN / Number.EPSILON;
const COS94 = Maths.cos(94 * RAD_FAC);
const SIN94 = Maths.sin(94 * RAD_FAC);

/**
 * Calculates the zeros of the quadratic $a*Z^2+b*Z+c$.
 * The quadratic formula, modified to avoid overflow, is used to find the larger zero if the zeros are real and both zeros are complex.
 * The smaller real zero is found directly from the product of the zeros $\frac{c}{a}$.
 * @param a
 * @param b
 * @param c
 * @param quadRPar
 */
function quadR(a: number, b: number, c: number, quadRPar: RpolyQuadRParam) {
    quadRPar.sr = quadRPar.si = quadRPar.lr = quadRPar.li = 0;

    if (!a) {
        if (b) quadRPar.sr = -(c / b);
        return;
    }

    if (!c) {
        quadRPar.lr = -(b / a);
        return;
    }

    // Compute discriminant avoiding overflow.
    const halfB = b / 2;
    let d: number, e: number;

    if (Maths.abs(halfB) < Maths.abs(c)) {
        e = c >= 0 ? a : -a;
        e = -e + halfB * (halfB / Maths.abs(c));
        d = Maths.sqrt(Maths.abs(e)) * Maths.sqrt(Maths.abs(c));
    } else {
        e = -((a / halfB) * (c / halfB)) + 1;
        d = Maths.sqrt(Maths.abs(e)) * Maths.abs(halfB);
    }

    if (e >= 0) {
        // real zeros
        if (halfB >= 0) d = -d;
        quadRPar.lr = (-halfB + d) / a;
        if (quadRPar.lr) quadRPar.sr = c / quadRPar.lr / a;
    } else {
        // complex conjugate zeros
        quadRPar.lr = quadRPar.sr = -(halfB / a);
        quadRPar.si = Maths.abs(d / a);
        quadRPar.li = -quadRPar.si;
    }
    return;
}

/**
 * Divides `p` by the quadratic [1, `u`, `v`] placing the quotient in `q` and the remainder in `quadSdPar`.
 * @param length
 * @param u
 * @param v
 * @param p
 * @param q
 * @param quadSdPar
 */
function quadSd(length: number, u: number, v: number, p: number[], q: number[], quadSdPar: RpolyQuadSdParam) {
    q[0] = quadSdPar.b = p[0];
    q[1] = quadSdPar.a = -(u * quadSdPar.b) + p[1];

    for (let i = 2; i < length; i++) {
        q[i] = -(u * quadSdPar.a + v * quadSdPar.b) + p[i];
        quadSdPar.b = quadSdPar.a;
        quadSdPar.a = q[i];
    }
    return;
}

/**
 * Compute new estimates of the quadratic coefficients using the scalars computed in `calcSc`.
 * @param tFlag
 * @param quadSdPar
 * @param a
 * @param a1
 * @param a3
 * @param a7
 * @param b
 * @param c
 * @param d
 * @param f
 * @param g
 * @param h
 * @param u
 * @param v
 * @param polyK
 * @param N
 * @param polyP
 */
function newest(
    tFlag: number,
    quadSdPar: RpolyQuadSdParam,
    a: number,
    a1: number,
    a3: number,
    a7: number,
    b: number,
    c: number,
    d: number,
    f: number,
    g: number,
    h: number,
    u: number,
    v: number,
    polyK: number[],
    N: number,
    polyP: number[]
) {
    quadSdPar.b = quadSdPar.a = 0; // The quadratic is zeroed.
    if (tFlag === 3) return;

    let a4: number, a5: number;
    if (tFlag === 1) {
        a4 = a + u * b + h * f;
        a5 = c + (u + v * f) * d;
    } else {
        // tFlag === 2
        a4 = (a + g) * f + h;
        a5 = (f + u) * c + v * d;
    }
    // Evaluate new quadratic coefficients.
    let b1 = -(polyK[N - 1] / polyP[N]);
    let b2 = -(polyK[N - 2] + b1 * polyP[N - 1]) / polyP[N];
    let c1 = v * b2 * a1;
    let c2 = b1 * a7;
    let c3 = b1 * b1 * a3;
    let c4 = -(c2 + c3) + c1;
    let temp = -c4 + a5 + b1 * a4;
    if (temp) {
        quadSdPar.a = -((u * (c3 + c2) + v * (b1 * a1 + b2 * a7)) / temp) + u;
        quadSdPar.b = v * (1 + c4 / temp);
    }
    return;
}

/**
 * Calculates scalar quantities used to compute the next `polyK` and new estimates of the quadratic coefficients.
 * @param N
 * @param a
 * @param b
 * @param calcPar
 * @param polyK
 * @param u
 * @param v
 * @param polyQK
 */
function calcSc(N: number, a: number, b: number, calcPar: RpolyCalcParam, polyK: number[], u: number, v: number, polyQK: number[]) {
    // tFlag - integer variable set here indicating how the calculations are normalized to avoid overflow.
    let tFlag = 3; // `tFlag = 3` indicates the quadratic is almost a factor of `polyK`.

    // Synthetic division of `polyK` by the quadratic [1, `u`, `v`].
    const quadSdPar: RpolyQuadSdParam = { a: 0, b: 0 };
    quadSd(N, u, v, polyK, polyQK, quadSdPar);
    calcPar.c = quadSdPar.a;
    calcPar.d = quadSdPar.b;

    if (Maths.abs(calcPar.c) <= 100 * Number.EPSILON * Maths.abs(polyK[N - 1])) {
        if (Maths.abs(calcPar.d) <= 100 * Number.EPSILON * Maths.abs(polyK[N - 2])) return tFlag;
    }

    calcPar.h = v * b;
    if (Maths.abs(calcPar.d) >= Maths.abs(calcPar.c)) {
        tFlag = 2; // `tFlag = 2` indicates that all formulas are divided by `d`.
        calcPar.e = a / calcPar.d;
        calcPar.f = calcPar.c / calcPar.d;
        calcPar.g = u * b;
        calcPar.a3 = calcPar.e * (calcPar.g + a) + calcPar.h * (b / calcPar.d);
        calcPar.a1 = -a + calcPar.f * b;
        calcPar.a7 = calcPar.h + (calcPar.f + u) * a;
    } else {
        tFlag = 1; // `tFlag = 1` indicates that all formulas are divided by `c`.
        calcPar.e = a / calcPar.c;
        calcPar.f = calcPar.d / calcPar.c;
        calcPar.g = calcPar.e * u;
        calcPar.a3 = calcPar.e * a + (calcPar.g + calcPar.h / calcPar.c) * b;
        calcPar.a1 = -(a * (calcPar.d / calcPar.c)) + b;
        calcPar.a7 = calcPar.g * calcPar.d + calcPar.h * calcPar.f + a;
    }

    return tFlag;
}

/**
 * Computes the next `polyK` using the scalars computed in `calcSc`.
 * @param N
 * @param tFlag
 * @param a
 * @param b
 * @param calcPar
 * @param polyK
 * @param polyQK
 * @param polyQP
 */
function nextK(N: number, tFlag: number, a: number, b: number, calcPar: RpolyCalcParam, polyK: number[], polyQK: number[], polyQP: number[]) {
    if (tFlag === 3) {
        // Use unscaled form of the recurrence.
        polyK[1] = polyK[0] = 0;
        for (let i = 2; i < N; i++) polyK[i] = polyQK[i - 2];
        return;
    }

    let temp = tFlag === 1 ? b : a;

    if (Maths.abs(calcPar.a1) > 10 * Number.EPSILON * Maths.abs(temp)) {
        // Use scaled form of the recurrence.
        calcPar.a7 /= calcPar.a1;
        calcPar.a3 /= calcPar.a1;
        polyK[0] = polyQP[0];
        polyK[1] = -(polyQP[0] * calcPar.a7) + polyQP[1];

        for (let i = 2; i < N; i++) polyK[i] = -(polyQP[i - 1] * calcPar.a7) + polyQK[i - 2] * calcPar.a3 + polyQP[i];
    } else {
        // If `a1` is nearly zero, use a special form of the recurrence.
        polyK[0] = 0;
        polyK[1] = -(polyQP[0] * calcPar.a7);
        for (let i = 2; i < N; i++) polyK[i] = -(polyQP[i - 1] * calcPar.a7) + polyQK[i - 2] * calcPar.a3;
    }
    return;
}

/**
 * Variable-shift iteration for a quadratic factor converges only if the zeros are equimodular or nearly so.
 * @param N
 * @param shfPar
 * @param u
 * @param v
 * @param polyQP
 * @param NN
 * @param quadSdPar
 * @param polyP
 * @param polyQK
 * @param calcPar
 * @param polyK
 */
function quadIt(
    N: number,
    shfPar: RpolyShfParam,
    u: number,
    v: number,
    polyQP: number[],
    NN: number,
    quadSdPar: RpolyQuadSdParam,
    polyP: number[],
    polyQK: number[],
    calcPar: RpolyCalcParam,
    polyK: number[]
) {
    shfPar.nz = 0;

    const quadRPar: RpolyQuadRParam = { sr: 0, si: 0, lr: 0, li: 0 };

    let tFlag: number;
    let triedFlag = true;

    let mp: number;
    let omp = 0;
    let relstp = 0;

    let i = 0;
    while (true) {
        quadR(1, u, v, quadRPar);
        shfPar.szr = quadRPar.sr;
        shfPar.szi = quadRPar.si;
        shfPar.lzr = quadRPar.lr;
        shfPar.lzi = quadRPar.li;

        // Break if roots of the quadratic are real and not close to multiple or nearly equal and of opposite sign.
        if (Maths.abs(Maths.abs(shfPar.szr) - Maths.abs(shfPar.lzr)) > 0.01 * Maths.abs(shfPar.lzr)) break;

        // Evaluate polynomial by quadratic synthetic division.
        quadSd(NN, u, v, polyP, polyQP, quadSdPar);

        mp = Maths.abs(-(shfPar.szr * quadSdPar.b) + quadSdPar.a) + Maths.abs(shfPar.szi * quadSdPar.b);

        // Compute a rigorous bound on the rounding error in evaluating `polyP`.
        let zm = Maths.sqrt(Maths.abs(v));
        let ee = 2 * Maths.abs(polyQP[0]);
        let t = -(shfPar.szr * quadSdPar.b);

        for (let ii = 1; ii < N; ii++) ee = ee * zm + Maths.abs(polyQP[ii]);
        ee = ee * zm + Maths.abs(t + quadSdPar.a);
        ee = (9 * ee + 2 * Maths.abs(t) - 7 * (Maths.abs(quadSdPar.a + t) + zm * Maths.abs(quadSdPar.b))) * Number.EPSILON;

        // Iteration has converged sufficiently if the polynomial value is less than 20 times this bound.
        if (mp <= 20 * ee) {
            shfPar.nz = 2;
            break;
        }

        i++;

        // Stop iteration after 20 steps.
        if (i > 20) break;

        if (i > 1) {
            if (triedFlag && relstp <= 0.01 && mp >= omp) {
                // A cluster appears to be stalling the convergence. 5 fixed shift steps are taken with `u`, `v` close to the cluster.
                relstp = relstp < Number.EPSILON ? Maths.sqrt(Number.EPSILON) : Maths.sqrt(relstp);

                u -= u * relstp;
                v += v * relstp;

                quadSd(NN, u, v, polyP, polyQP, quadSdPar);

                for (let ii = 0; ii < 5; ii++) {
                    tFlag = calcSc(N, quadSdPar.a, quadSdPar.b, calcPar, polyK, u, v, polyQK);
                    nextK(N, tFlag, quadSdPar.a, quadSdPar.b, calcPar, polyK, polyQK, polyQP);
                }

                triedFlag = false;
                i = 0;
            }
        }

        omp = mp;

        // Calculate next `polyK` and new `u` and `v`.
        tFlag = calcSc(N, quadSdPar.a, quadSdPar.b, calcPar, polyK, u, v, polyQK);
        nextK(N, tFlag, quadSdPar.a, quadSdPar.b, calcPar, polyK, polyQK, polyQP);
        tFlag = calcSc(N, quadSdPar.a, quadSdPar.b, calcPar, polyK, u, v, polyQK);
        newest(tFlag, quadSdPar, quadSdPar.a, calcPar.a1, calcPar.a3, calcPar.a7, quadSdPar.b, calcPar.c, calcPar.d, calcPar.f, calcPar.g, calcPar.h, u, v, polyK, N, polyP);
        let ui = quadSdPar.a;
        let vi = quadSdPar.b;

        // If `vi` is zero, the iteration is not converging.
        if (!vi) break;

        relstp = Maths.abs((-v + vi) / vi);
        u = ui;
        v = vi;
    }

    return;
}

/**
 * Variable-shift iteration for a real zero.
 * @param shfPar
 * @param quadSdPar
 * @param N
 * @param polyP
 * @param NN
 * @param polyQP
 * @param polyK
 * @param polyQK
 */
function realIt(shfPar: RpolyShfParam, quadSdPar: RpolyQuadSdParam, N: number, polyP: number[], NN: number, polyQP: number[], polyK: number[], polyQK: number[]) {
    shfPar.nz = 0;

    let iFlag = false;
    let s = quadSdPar.a;
    let t = 0;

    let mp: number;
    let omp = 0;

    let i = 0;
    while (true) {
        let pv;
        polyQP[0] = pv = polyP[0];

        // Evaluate `polyP` at `s`.
        for (let ii = 1; ii < NN; ii++) polyQP[ii] = pv = pv * s + polyP[ii];

        mp = Maths.abs(pv);

        // Compute a rigorous bound on the error in evaluating `polyP`.
        let ee = 0.5 * Maths.abs(polyQP[0]);
        for (let ii = 1; ii < NN; ii++) ee = ee * Maths.abs(s) + Maths.abs(polyQP[ii]);

        // Iteration has converged sufficiently if the polynomial value is less than 20 times this bound.
        if (mp <= 20 * Number.EPSILON * (2 * ee - mp)) {
            shfPar.nz = 1;
            shfPar.szr = s;
            shfPar.szi = 0;
            break;
        }

        i++;

        // Stop iteration after 10 steps.
        if (i > 10) break;

        if (i > 1) {
            if (Maths.abs(t) <= 0.001 * Maths.abs(-t + s) && mp > omp) {
                // A cluster of zeros near the real axis has been encountered.
                // Break with iFlag set to initiate a quadratic iteration.
                iFlag = true;
                quadSdPar.a = s;
                break;
            }
        }

        // Break if the polynomial value has increased significantly.

        omp = mp;

        // Compute `t`, the next `polyK` and the new iterate.
        let kv;
        polyQK[0] = kv = polyK[0];
        for (let ii = 1; ii < N; ii++) polyQK[ii] = kv = kv * s + polyK[ii];

        if (Maths.abs(kv) > Maths.abs(polyK[N - 1]) * 10 * Number.EPSILON) {
            // Use the scaled form of the recurrence if the value of `polyK` at `s` is non-zero.
            t = -(pv / kv);
            polyK[0] = polyQP[0];
            for (let ii = 1; ii < N; ii++) polyK[ii] = t * polyQK[ii - 1] + polyQP[ii];
        } else {
            // Use unscaled form
            polyK[0] = 0;
            for (let ii = 1; ii < N; ii++) polyK[ii] = polyQK[ii - 1];
        }

        kv = polyK[0];
        for (let ii = 1; ii < N; ii++) kv = kv * s + polyK[ii];

        t = Maths.abs(kv) > Maths.abs(polyK[N - 1]) * 10 * Number.EPSILON ? -(pv / kv) : 0;
        s += t;
    }

    return iFlag;
}

/**
 * Computes up to `shfIt` fixed shift `polyK`, testing for convergence in the linear or quadratic case.
 * Initiates one of the variable shift iterations and returns with the number of zeros found.
 * @param origLength
 * @param shfIt
 * @param xx
 * @param bound
 * @param polyK
 * @param N
 * @param polyP
 * @param NN
 * @param polyQP
 * @param shfPar
 */
function fxShf(origLength: number, shfIt: number, xx: number, bound: number, polyK: number[], N: number, polyP: number[], NN: number, polyQP: number[], shfPar: RpolyShfParam) {
    shfPar.nz = 0; // number of zeros found

    const quadSdPar: RpolyQuadSdParam = { a: 0, b: 0 };
    const calcPar: RpolyCalcParam = {
        a1: 0,
        a3: 0,
        a7: 0,
        c: 0,
        d: 0,
        e: 0,
        f: 0,
        g: 0,
        h: 0
    };

    const polyQK = new Array(origLength);
    const polySVK = new Array(origLength);

    const u = -(2 * bound * xx);
    const v = bound;

    let betas = 0.25;
    let betav = 0.25;
    let ots = 0;
    let otv = 0;
    let oss = bound * xx;
    let ovv = bound;

    // Evaluate polynomial by synthetic division.
    quadSd(NN, u, v, polyP, polyQP, quadSdPar);
    let a = quadSdPar.a;
    let b = quadSdPar.b;
    let tFlag = calcSc(N, a, b, calcPar, polyK, u, v, polyQK);

    for (let i = 0; i < shfIt; i++) {
        // Calculate next `polyK` and estimate `v`.
        nextK(N, tFlag, a, b, calcPar, polyK, polyQK, polyQP);
        tFlag = calcSc(N, a, b, calcPar, polyK, u, v, polyQK);

        // Use `quadSdPar` for passing in uu and vv instead of defining a brand-new variable.
        // quadSdPar.a = ui, quadSdPar.b = vi
        newest(tFlag, quadSdPar, a, calcPar.a1, calcPar.a3, calcPar.a7, b, calcPar.c, calcPar.d, calcPar.f, calcPar.g, calcPar.h, u, v, polyK, N, polyP);
        let ui = quadSdPar.a;
        let vi = quadSdPar.b;

        // Estimate `s`.
        let ss = polyK[N - 1] != 0 ? -(polyP[N] / polyK[N - 1]) : 0;
        let vv = quadSdPar.b;

        let ts = 1;
        let tv = 1;

        if (i && tFlag != 3) {
            // Compute relative measures of convergence of `s` and `v` sequences.
            if (vv != 0) tv = Maths.abs((vv - ovv) / vv);
            if (ss != 0) ts = Maths.abs((ss - oss) / ss);

            // If decreasing, multiply the two most recent convergence measures.
            let tvv = tv < otv ? tv * otv : 1;
            let tss = ts < ots ? ts * ots : 1;

            // Compare with convergence criteria.
            let vPass = tvv < betav;
            let sPass = tss < betas;

            if (sPass || vPass) {
                // At least one sequence has passed the convergence test. Store variables before iterating.
                for (let ii = 0; ii < N; ii++) polySVK[ii] = polyK[ii];

                let s = ss;
                // Choose iteration according to the fastest converging sequence.
                let sTry = false;
                let vTry = false;
                do {
                    // Begin each loop by assuming `realIt` will be called UNLESS `iFlag` changed below.
                    let iFlag = true;

                    if (sPass && (!vPass || tss < tvv)) {
                        // Do nothing. Provides a quick "short circuit".
                    } else {
                        quadIt(N, shfPar, ui, vi, polyQP, NN, quadSdPar, polyP, polyQK, calcPar, polyK);

                        a = quadSdPar.a;
                        b = quadSdPar.b;

                        if (shfPar.nz > 0) return;

                        // Quadratic iteration has failed. Flag that it has been tried and decrease the convergence criterion.
                        vTry = true;
                        betav *= 0.25;

                        // Try linear iteration if it has not been tried and the s sequence is converging.
                        if (sTry || !sPass) iFlag = false;
                        else for (let ii = 0; ii < N; ii++) polyK[ii] = polySVK[ii];
                    }

                    if (iFlag) {
                        // Use quadSdPar for passing in s instead of defining a brand-new variable.
                        // quadSdPar.a = s
                        quadSdPar.a = s;
                        iFlag = realIt(shfPar, quadSdPar, N, polyP, NN, polyQP, polyK, polyQK);
                        s = quadSdPar.a;

                        if (shfPar.nz > 0) return;

                        // Linear iteration has failed. Flag that it has been tried and decrease the convergence criterion.
                        sTry = true;
                        betas *= 0.25;

                        if (iFlag) {
                            // If linear iteration signals an almost double real zero, attempt quadratic iteration.
                            ui = -(s + s);
                            vi = s * s;
                            continue;
                        }
                    }

                    // Restore variables.
                    for (let ii = 0; ii < N; ii++) polyK[ii] = polySVK[ii];

                    // Try quadratic iteration if it has not been tried and the v sequence is converging.
                } while (vPass && !vTry);

                // Re-compute `polyQP` and scalar values to continue the second stage.
                quadSd(NN, u, v, polyP, polyQP, quadSdPar);
                a = quadSdPar.a;
                b = quadSdPar.b;

                tFlag = calcSc(N, a, b, calcPar, polyK, u, v, polyQK);
            }
        }
        ovv = vv;
        oss = ss;
        otv = tv;
        ots = ts;
    }

    return;
}

/**
 * Main entry of the algorithm.
 * @param poly
 * @param zeroR
 * @param zeroI
 */
export default function rpoly(poly: number[], zeroR: number[], zeroI: number[]) {
    const origDegree = poly.length - 1;
    const origLength = poly.length;

    const polyP = new Array(origLength);
    const polyPT = new Array(origLength);
    const polyK = new Array(origLength);
    const polyQP = new Array(origLength);

    // Copy the original polynomial, in the following processing, we will change its coefficients.
    for (let i = 0; i < origLength; i++) polyP[i] = poly[i];

    const shfPar: RpolyShfParam = { nz: 0, lzi: 0, lzr: 0, szi: 0, szr: 0 };
    const quadRPar: RpolyQuadRParam = { sr: 0, si: 0, lr: 0, li: 0 };

    let N = origDegree;
    // Remove zeros at the origin, if any.
    for (let i = origDegree; i > 0; i--) {
        if (polyP[i] === 0) {
            N--;
            zeroR[origDegree - i] = zeroI[origDegree - i] = 0;
            continue;
        }
        break;
    }
    let NN = N + 1;

    // main loop
    while (N > 0) {
        // Start the algorithm for one zero.
        if (N <= 2) {
            // Calculate the final zero or pair of zeros.
            if (N < 2) {
                zeroR[origDegree - 1] = -(polyP[1] / polyP[0]);
                zeroI[origDegree - 1] = 0;
            } else {
                quadR(polyP[0], polyP[1], polyP[2], quadRPar);
                zeroR[origDegree - 2] = quadRPar.sr;
                zeroI[origDegree - 2] = quadRPar.si;
                zeroR[origDegree - 1] = quadRPar.lr;
                zeroI[origDegree - 1] = quadRPar.li;
            }
            break;
        }

        // Find the largest and smallest moduli of the coefficients.
        let [moduliMax, moduliMin] = [0, DBL_MAX];
        for (let i = 0; i < NN; i++) {
            const coefAbs = Maths.abs(polyP[i]);
            if (coefAbs > moduliMax) moduliMax = coefAbs;
            if (coefAbs != 0 && coefAbs < moduliMin) moduliMin = coefAbs;
        }

        // Scale if there are large or very small coefficients.
        // Computes a scale factor to multiply the coefficients of the polynomial.
        // The scaling is done to avoid overflow and to avoid undetected underflow interfering with the convergence criterion.
        // The factor is a power of the base 2.
        let sc = LO / moduliMin;
        if ((sc <= 1 && moduliMax >= 10) || (sc > 1 && DBL_MAX / sc >= moduliMax)) {
            if (sc === 0) sc = DBL_MIN;
            const factor = Maths.pow(2, Maths.floor(Maths.LOG2E * Maths.log(sc) + 0.5));
            if (factor != 1) for (let i = 0; i < NN; i++) polyP[i] *= factor;
        }

        // Compute lower bound on moduli of zeros.
        for (let i = 0; i < NN; i++) polyPT[i] = Maths.abs(polyP[i]);

        // Compute upper estimate of bound.
        let xm = Maths.exp((Maths.log(polyPT[N]) - Maths.log(polyPT[0])) / N);

        if (polyPT[N - 1] !== 0) {
            // If Newton step at the origin is better, use it.
            let xNewton = polyPT[N] / polyPT[N - 1];
            if (xNewton < xm) xm = xNewton;
        }
        polyPT[N] = -polyPT[N];

        // Chop the interval (0, `xm`) until `value` of `polyPT` at `xm` <= 0.
        let x;
        let dx;
        let value = 0;
        do {
            x = dx = xm;
            xm *= 0.1;
            for (let i = 1; i < NN; i++) value = value * xm + polyPT[i];
        } while (value > 0);

        // Do Newton iteration until `x` converges to two decimal places.
        while (Maths.abs(dx / x) > 0.005) {
            let df = polyPT[0];
            let ff = polyPT[0];
            for (let i = 1; i < N; i++) {
                ff = x * ff + polyPT[i];
                df = x * df + ff;
            }
            ff = x * ff + polyPT[N];
            dx = ff / df;
            x -= dx;
        }
        const bound = x;

        // Compute the derivative as the initial `polyK` and do 5 steps with no shift.
        for (let i = 1; i < N; i++) polyK[i] = ((N - i) * polyP[i]) / N;
        polyK[0] = polyP[0];

        let aa = polyP[N];
        let bb = polyP[N - 1];
        let cc;
        let zeroK = polyK[N - 1] === 0;

        for (let i = 0; i < 5; i++) {
            cc = polyK[N - 1];
            if (zeroK) {
                // Use unscaled form of recurrence.
                for (let ii = 0; ii < N - 1; ii++) {
                    polyK[N - 1 - ii] = polyK[N - 1 - ii - 1];
                }
                polyK[0] = 0;
                zeroK = polyK[N - 1] === 0;
            } else {
                // Used scaled form of recurrence if value of `polyK` at 0 is nonzero.
                const t = -aa / cc;
                for (let ii = 0; ii < N - 1; ii++) {
                    polyK[N - 1 - ii] = t * polyK[N - 1 - ii - 1] + polyP[N - 1 - ii];
                }
                polyK[0] = polyP[0];
                zeroK = Maths.abs(polyK[N - 1]) <= Maths.abs(bb) * Number.EPSILON * 10;
            }
        }

        // Save `polyK` for restarts with new shifts.
        const polySVK = new Array(origLength);
        for (let i = 0; i < N; i++) polySVK[i] = polyK[i];
        // Loop to select the quadratic corresponding to each new shift.
        let [xx, yy] = [Maths.SQRT1_2, -Maths.SQRT1_2];
        let it = 1;
        for (; it <= 20; it++) {
            // Quadratic corresponds to a double shift to a non-real point and its complex conjugate.
            // The point has modulus BND and amplitude rotated by 94 degrees from the previous shift.
            [xx, yy] = [-SIN94 * yy + COS94 * xx, SIN94 * xx + COS94 * yy];

            // Second stage calculation, fixed quadratic.
            fxShf(origLength, 20 * it, xx, bound, polyK, N, polyP, NN, polyQP, shfPar);

            if (shfPar.nz) {
                // The second stage jumps directly to one of the third stage iterations and returns here if successful.
                // Deflate the polynomial, store the zero or zeros, and return to the main algorithm.
                zeroR[origDegree - N] = shfPar.szr;
                zeroI[origDegree - N] = shfPar.szi;
                if (shfPar.nz != 1) {
                    zeroR[origDegree - N + 1] = shfPar.lzr;
                    zeroI[origDegree - N + 1] = shfPar.lzi;
                }
                NN -= shfPar.nz;
                N = NN - 1;
                for (let i = 0; i < NN; i++) polyP[i] = polyQP[i];
                break;
            } else {
                // If the iteration is unsuccessful, another quadratic is chosen after restoring `polyK`.
                for (let i = 0; i < N; i++) polyK[i] = polySVK[i];
            }
        }

        // Throw error if no convergence with 20 shifts.
        if (it > 20) {
            throw new Error("[G]No convergence with 20 shifts, root finding failed.");
        }
    }
    return;
}
