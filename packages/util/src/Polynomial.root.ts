import Complex from "./Complex";
import Maths from "./Maths";
import Polynomial from "./Polynomial";

// Start point on the real axis based on polynomial.
function startGuess(p: number[]) {
    let n = Polynomial.degree(p);
    let r = Maths.log(Maths.abs(Polynomial.coef(p, 0)));
    let min = Maths.exp((r - Maths.log(Maths.abs(Polynomial.coef(p, n)))) / n);
    let u;
    for (let i = 1; i < n; i++)
        if (Polynomial.coef(p, n - i) !== 0) {
            u = Maths.exp((r - Maths.log(Maths.abs(Polynomial.coef(p, n - i)))) / (n - i));
            if (u < min) min = u;
        }
    return 0.5 * min;
}
// Alter search direction and scale step.
function changeDirection(dz: [number, number], m: number) {
    let z = [0.6, 0.8] as [number, number];
    z = Complex.multiply(dz, z);
    z = Complex.multiply(z, [m, 0]);
    return z;
}

// Calculate a upper bound for the rounding errors performed in a polynomial at a complex point.
function upperBound(poly: number[], z: [number, number]) {
    let e: number;
    let n = Polynomial.degree(poly);

    if (Complex.imag(z) !== 0) {
        // Complex point
        let p = -2 * Complex.real(z);
        let q = Complex.squaredModulus(z);
        let u = Maths.sqrt(q);
        let s = 0;
        let r = Polynomial.coef(poly, n);
        e = Maths.abs(r) * (3.5 / 4.5);
        let t: number;
        for (let i = 1; i < n; i++) {
            t = Polynomial.coef(poly, n - i) - p * r - q * s;
            s = r;
            r = t;
            e = u * e + Maths.abs(t);
        }
        t = Polynomial.coef(poly, 0) + Complex.real(z) * r - q * s;
        e = u * e + Maths.abs(t);
        e = (4.5 * e - 3.5 * (Maths.abs(t) + Maths.abs(r) * u) + Maths.abs(Complex.real(z)) * Maths.abs(r)) * 0.5 * Maths.pow(2, -53 + 1);
    } else {
        // Real point
        let t = Polynomial.coef(poly, n);
        e = Maths.abs(t) * 0.5;
        for (let i = 0; i < n; i++) {
            t = t * Complex.real(z) + Polynomial.coef(poly, n - i);
            e = Maths.abs(Complex.real(z)) * e + Maths.abs(t);
        }
        e = (2 * e - Maths.abs(t)) * Maths.pow(2, -53 + 1);
    }
    return e;
}

function tryShortenSteps(p: number[], z0: [number, number], dz: [number, number], f: number) {
    let wdz = dz;
    let n = Polynomial.degree(p);
    let zBest = Complex.subtract(z0, dz);
    let fBest = f;
    for (let i = 1; i <= n; i++) {
        wdz = Complex.multiply(wdz, [0.5, 0]);
        let wz = Complex.subtract(z0, wdz);
        let fwz = Polynomial.evaluate(p, wz);
        let wf = Complex.modulus(fwz);
        if (wf >= fBest) {
            // No improvement, discard last try step.
            break;
        }
        fBest = wf;
        zBest = wz;
        // Improved, continue stepping.
        if (i == 2) {
            wdz = changeDirection(wdz, 0.5);
            zBest = Complex.subtract(z0, wdz);
            fwz = Polynomial.evaluate(p, zBest);
            wf = Complex.modulus(fwz);
            break;
        }
    }
    return zBest;
}

// Quadratic complex equation. Works for both real and complex coefficients
// Res contains the result as complex roots. a.length is 2 or 3.
function quadratic(p: number[], res: [number, number][]) {
    if (Polynomial.degree(p) == 2) {
        const [a, b, c] = p;
        if (b === 0) {
            const dis = -c / a;
            if (dis < 0) {
                res[1] = [0, Maths.sqrt(-dis)];
                res[2] = [0, -Complex.imag(res[1])];
            } else {
                res[1] = [Maths.sqrt(dis), 0];
                res[2] = [-Complex.real(res[1]), 0];
            }
        } else {
            const dis = 1 - (4 * a * c) / b ** 2;
            if (dis < 0) {
                res[1] = [-b / (2 * a), (b * Maths.sqrt(-dis)) / (2 * a)];
                res[2] = Complex.conjugate(res[1]);
            } else {
                res[1] = [((-1 - Maths.sqrt(dis)) * b) / (2 * a), 0];
                res[2] = [c / (a * Complex.real(res[1])), 0];
            }
        }
    } else if (Polynomial.degree(p) == 1) {
        const [a, b] = p;
        res[1] = [-b / a, 0];
    }
}

function newtonConverging(fz0: [number, number], fz1: [number, number], z0: [number, number], z: [number, number], f: number, ff: number) {
    // Determine if we are within the convergent disc as outline by Ostrowski Theorem 7.1 in the book Solutions of Equations and systems of equations
    const fwz = Complex.subtract(fz0, fz1);
    const wz = Complex.subtract(z0, z);
    const f2 = Complex.modulus(Complex.divide(fwz, wz));
    const u = Complex.modulus(fz1);
    return f2 / u > u / f / 2 || ff != f ? false : true;
}

export function solve(p: number[], solutions: [number, number][]) {
    let z0 = Complex.zero();
    let fz0: [number, number];
    let z = Complex.zero();
    let dz: [number, number];
    let dz0: [number, number];
    let fz1: [number, number];
    let fz2: [number, number];
    let fz: [number, number];
    let u: number;
    let r: number;
    let r0: number;
    let f: number;
    let f0: number;
    let f1: number;
    let ff: number;
    let eps: number;
    let n: number;
    let iterCnt: number;
    let stage1: boolean;

    p = [...p];

    // Eliminate all zero roots.
    while (Polynomial.coef(p, 0) === 0) {
        solutions[Polynomial.degree(p)] = Complex.zero();
        p = Polynomial.deflate(p, 0);
    }

    while (Polynomial.degree(p) > 2) {
        // Loop as long as we have more than a quadratic polynomial.

        // Stage 0. Setup the iteration
        n = Polynomial.degree(p);
        u = startGuess(p); // Find a suitable radius where all roots are outside the circle with radius u
        let p1 = Polynomial.derivative(p);
        z0 = Complex.zero();
        ff = f0 = Maths.abs(Polynomial.coef(p, 0));
        fz0 = [Polynomial.coef(p, 1), 0] as [number, number];

        if (Complex.equalTo(fz0, Complex.zero()) === true) z = [1, 0] as [number, number];
        else z = Complex.divide(Complex.negative([Polynomial.coef(p, 0), 0]), [Polynomial.coef(p, 1), 0]);
        z = Complex.multiply(Complex.divide(z, [Complex.modulus(z), 0]), [u, 0]);

        dz = z;
        fz = Polynomial.evaluate(p, z);
        f = Complex.modulus(fz);
        r0 = 5 * u;
        eps = 2 * n * f0 * Maths.pow(2, -53);
        // Start main iteration for polynomial.
        // Stage 1: stop condition: $|f(z)|<eps$
        for (iterCnt = 0; Complex.equalTo(Complex.add(z, dz), z) == false && f > eps && iterCnt < 50; iterCnt++) {
            // Find first prime or approximation
            fz1 = Polynomial.evaluate(p1, z);
            f1 = Complex.modulus(fz1);

            if (f1 === 0) {
                // is first prime == 0 then change direction and continue
                dz0 = dz;
                dz = changeDirection(dz, 5.0);
                z = Complex.subtract(z0, dz);
                fz = Polynomial.evaluate(p, z);
                f = Complex.modulus(fz);
                continue;
            } else {
                dz = Complex.divide(fz, fz1);
                // Calculate which stage we are on using fz0,fz1,z0,z,f,ff
                stage1 = !newtonConverging(fz0, fz1, z0, z, f, ff);
                // End stage calculation
                // Check for oversized steps
                r = Complex.modulus(dz);
                if (r > r0) {
                    dz0 = dz;
                    dz = changeDirection(dz, r0 / r);
                    r = Complex.modulus(dz);
                }
                r0 = 5 * r;
            }
            z0 = z;
            f0 = f;
            fz0 = fz1;
            // Determine the multiplication of dz step size
            // Inner loop
            let domain_error = true;
            for (; domain_error === true; ) {
                domain_error = false;
                z = Complex.subtract(z0, dz);
                fz = Polynomial.evaluate(p, z);
                ff = f = Complex.modulus(fz);
                if (stage1 == true) {
                    // Try multiple steps or shorten steps depending of f is an improvement or not

                    if (f > f0) {
                        z = tryShortenSteps(p, z0, dz, f);
                        fz = Polynomial.evaluate(p, z);
                        f = Complex.modulus(fz);
                    } else {
                        // Try multiple steps in the same direction optimizing multiple roots iterations
                        for (
                            var m = 2;
                            m <= n;
                            m++ // The step size depends on the method
                        ) {
                            var wz, fwz, fw;
                            wz = Complex.subtract(z0, Complex.multiply([m, 0], dz));
                            fwz = Polynomial.evaluate(p, wz);
                            fw = Complex.modulus(fwz);

                            if (fw >= f) {
                                // No improvement, discard last try step
                                break;
                            }
                            z = wz;
                            f = fw;
                            fz = fwz;
                        }
                    }
                } else {
                    // calculate the upper bound of errors using Adam's test
                    eps = upperBound(p, z);
                    // In Stage 2, new stop condition: |f(z)|< eps
                }

                // Any domain error
                if (r < Complex.modulus(z) * Maths.pow(2, -26) && f >= f0) {
                    z = z0;
                    dz0 = dz;
                    dz = changeDirection(dz, 0.5);

                    if (Complex.equalTo(Complex.add(z, dz), z) == false) domain_error = true;
                }
            }
        }

        if (Maths.abs(Complex.real(z)) >= Maths.abs(Complex.imag(z))) {
            z0 = [Complex.real(z), 0];
        } else {
            z0 = [0, Complex.imag(z)];
        }
        fz = Polynomial.evaluate(p, z0);
        if (Complex.modulus(fz) <= f) {
            z = z0;
            f = Complex.modulus(fz);
        }

        if (iterCnt >= 50) {
            console.warn("[G]Exceed limit of iteration steps.");
        }

        if (Complex.imag(z) == 0) {
            // Deflate the real root
            solutions[n] = z;
            p = Polynomial.deflate(p, Complex.real(z));
        } else {
            // Deflate the complex conjugated root
            solutions[n] = z;
            solutions[n - 1] = Complex.conjugate(z);
            p = Polynomial.deflate(p, z);
        }
    }

    // The last 1 or 2 roots are found directly
    if (Polynomial.degree(p) > 0) {
        quadratic(p, solutions);
    }
}
