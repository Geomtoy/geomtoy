import { Float, Maths } from "@geomtoy/util";

/**
 * The coefficients of the implicit function will have rounding errors due to the calculation,
 * and some coefficients that should be 0 will appear as a very small decimals.
 * So we need special handling
 * @param coefs1
 * @param coefs2
 * @param epsilon
 * @returns
 */
export function compareImplicit(coefs1: number[], coefs2: number[], epsilon: number) {
    if (coefs1.length !== coefs2.length) return false;

    // We can't monic directly, a very small decimals may mean 0 rather than a proportional relationship between coefs.
    // But we also can't set it directly to 0, so the proportional relationship between the coefs will be broken.
    // like:
    // [-4.484155085839415e-44, -5.195122377423504e-28, -2.0062714156665674e-12, -2582.6308480000134, -5.1951223774235035e-27, -4.012542831333134e-11, -77478.92544000038, -2.006271415666567e-10, -774789.2544000037, -2582630.848000012]
    // if monic, then [1, 11585510041410620, 4.474134763987544e+31, 5.759459248311337e+46, 115855100414106190, 8.948269527975087e+32, 1.7278377744934007e+48, 4.474134763987543e+33, 1.7278377744934004e+49, 5.759459248311334e+49]
    // but actually it should be approximately equal to [0, 0, 0, 1, 0, 0, 30, 0, 300, 1000]

    const maxCoef1 = Maths.max(...coefs1.map(Maths.abs));
    const maxCoef2 = Maths.max(...coefs2.map(Maths.abs));

    // If all the coefs are too small, scale them slightly
    if (Float.equalTo(maxCoef1, 0, epsilon)) {
        // maxCoef1 < epsilon
        const scalar = (2 * epsilon) / maxCoef1;
        coefs1 = coefs1.map(c => c * scalar);
    }
    if (Float.equalTo(maxCoef2, 0, epsilon)) {
        // maxCoef2 < epsilon
        const scalar = (2 * epsilon) / maxCoef2;
        coefs2 = coefs2.map(c => c * scalar);
    }

    // Find the first approximately non-zero coef index
    const i = coefs1.findIndex(c => !Float.equalTo(c, 0, epsilon));
    // The corresponding coef of coefs2 is 0, or underflow to 0
    if (coefs2[i] === 0) return false;

    // Monic by the first non-zero coef
    coefs1 = coefs1.map(c => c / coefs1[i]);
    coefs2 = coefs2.map(c => c / coefs2[i]);

    for (let i = 0, l = coefs1.length; i < l; i++) {
        if (!Float.equalTo(coefs1[i], coefs2[i], epsilon)) return false;
    }
    return true;
}
