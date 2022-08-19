/**
 * Reference:
 * @see https://en.wikipedia.org/wiki/Green%27s_theorem#Area_calculation
 * @see http://ich.deanmcnamee.com/graphics/2016/03/30/CurveArea.html
 *
 * @memo
 * "It will be important to use the same integral form across all types."
 *
 * So we will all use the form $\frac{1}{2}\oint_C(x\,dy-y\,dx)$.
 * This form also conforms to the Shoelace_formula(@see https://en.wikipedia.org/wiki/Shoelace_formula)
 * for area calculation of polygons.
 *
 * @why
 * Why write a function separately instead of putting it in `util`?
 * Because there is basically no other place to use integrals. And calculations of integral is not direct and fast.
 * We only implement the derivative of the polynomial now, and at most we can only implement the integral of the polynomial.
 * For the case where there are trigonometric functions, other implementations are needed.
 */

import { Angle, Maths } from "@geomtoy/util";

export function bezierPathIntegral(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
    return (x3 * (-y0 - 3 * y1 - 6 * y2) - 3 * x2 * (y0 + y1 - 2 * y3) + 3 * x1 * (-2 * y0 + y2 + y3) + x0 * (6 * y1 + 3 * y2 + y3)) / 20;
}

export function quadraticBezierPathIntegral(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number) {
    return (x2 * (-y0 - 2 * y1) + 2 * x1 * (y2 - y0) + x0 * (2 * y1 + y2)) / 6;
}

export function lineSegmentPathIntegral(x0: number, y0: number, x1: number, y1: number) {
    return (x0 * y1 - x1 * y0) / 2;
}

export function arcPathIntegral(cx: number, cy: number, rx: number, ry: number, phi: number, positive: boolean, sa: number, ea: number) {
    const cosPhi = Maths.cos(phi);
    const sinPhi = Maths.sin(phi);

    sa = Angle.simplify(sa);
    ea = Angle.simplify(ea);

    if (positive && ea < sa) ea += 2 * Maths.PI;
    if (!positive && sa < ea) sa += 2 * Maths.PI;

    // prettier-ignore
    return (
        (
            (ea - sa) * rx * ry * (cosPhi ** 2 + sinPhi ** 2) + 
            rx * (cosPhi * cy - cx * sinPhi) * (Maths.cos(sa) - Maths.cos(ea)) -
            ry * (cosPhi * cx + cy * sinPhi) * (Maths.sin(sa) - Maths.sin(ea))
        ) / 2
    );
}
