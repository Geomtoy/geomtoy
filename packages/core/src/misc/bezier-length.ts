import { Maths, Polynomial } from "@geomtoy/util";
import { t24, w24 } from "./legendre-gauss-table";

function derivativeValue(t: number, polyXD: number[], polyYD: number[]) {
    const x = Polynomial.evaluate(polyXD, t);
    const y = Polynomial.evaluate(polyYD, t);
    return Maths.hypot(x, y);
}

export function bezierLength(polyXD: number[], polyYD: number[]) {
    const h = 0.5;
    const l = t24.length;
    let sum = 0;

    for (let i = 0; i < l; i++) {
        const t = h * t24[i] + h;
        sum += w24[i] * derivativeValue(t, polyXD, polyYD);
    }
    return h * sum;
}
