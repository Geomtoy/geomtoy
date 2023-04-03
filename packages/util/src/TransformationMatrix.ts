import Float from "./Float";
import Maths from "./Maths";
import Matrix2 from "./Matrix2";
import Matrix3 from "./Matrix3";
import type { StaticClass } from "./types";
import Utility from "./Utility";
import Vector2 from "./Vector2";

interface TransformationMatrix extends StaticClass {}
class TransformationMatrix {
    // a c e
    // b d f
    // 0 0 1
    constructor() {
        throw new Error("[G]`TransformationMatrix` can not used as a constructor.");
    }
    static identity() {
        return [1, 0, 0, 1, 0, 0] as [number, number, number, number, number, number];
    }
    static isIdentity(m: [number, number, number, number, number, number]) {
        return Utility.is(m, TransformationMatrix.identity());
    }
    static span(m: [number, number, number, number, number, number]) {
        const [a, b, c, d] = m;
        if (Vector2.isZero([a, b]) && Vector2.isZero([c, d])) {
            // rank 0
            return 0;
        }
        if (Float.equalTo(Vector2.cross([a, b], [c, d]), 0, Float.MACHINE_EPSILON)) {
            // rank 1
            return 1;
        }
        return 2; // full rank
    }
    static multiply(m1: [number, number, number, number, number, number], m2: [number, number, number, number, number, number]) {
        const [a1, b1, c1, d1, e1, f1] = m1;
        const [a2, b2, c2, d2, e2, f2] = m2;
        const [a, c, e, b, d, f] = Matrix3.dotMatrix3([a1, c1, e1, b1, d1, f1, 0, 0, 1], [a2, c2, e2, b2, d2, f2, 0, 0, 1]);
        return [a, b, c, d, e, f] as [number, number, number, number, number, number];
    }
    static determinant(m: [number, number, number, number, number, number]) {
        const [a, b, c, d] = m;
        return Matrix2.determinant([a, c, b, d]);
    }
    static invert(m: [number, number, number, number, number, number]) {
        let [a, b, c, d, e, f] = m;
        const inverse = Matrix3.invert([a, c, e, b, d, f, 0, 0, 1]);
        if (inverse === undefined) throw new Error(`[G]\`TransformationMatrix:[a: ${a}, b: ${b}, c: ${c}, d: ${d}, e: ${e}, f: ${f}] is NOT invertible.`);
        [a, c, e, b, d, f] = inverse;
        return [a, b, c, d, e, f] as [number, number, number, number, number, number];
    }
    static isInvertible(m: [number, number, number, number, number, number]) {
        return TransformationMatrix.determinant(m) !== 0;
    }
    static transformCoordinates(m: [number, number, number, number, number, number], coordinates: [number, number]) {
        const [a, b, c, d, e, f] = m;
        const [x, y] = coordinates;
        const [xp, yp] = Matrix3.dotVector3([a, c, e, b, d, f, 0, 0, 1], [x, y, 1]);
        return [xp, yp] as [number, number];
    }
    static antitransformCoordinates(m: [number, number, number, number, number, number], coordinates: [number, number]) {
        return TransformationMatrix.transformCoordinates(TransformationMatrix.invert(m), coordinates);
    }

    /**
     * Decompose transformation `m` via the QR-like decomposition.
     * @see https://frederic-wang.fr/decomposition-of-2d-transform-matrices.html
     * @param m
     */
    static decomposeQr(m: [number, number, number, number, number, number]) {
        const [a, b, c, d, tx, ty] = m;
        const det = TransformationMatrix.determinant(m);
        let r = 0;
        let sx = 1;
        let sy = 1;
        let kx = 0;
        let ky = 0;
        if (a !== 0 || b !== 0) {
            const p = Maths.hypot(a, b);
            r = b > 0 ? Maths.acos(a / p) : -Maths.acos(a / p);
            sx = p;
            sy = det / p;
            kx = Maths.atan((a * c + b * d) / p ** 2);
        } else if (c !== 0 || d !== 0) {
            const q = Maths.hypot(c, d);
            r = Maths.PI / 2 - (d > 0 ? Maths.acos(-c / q) : -Maths.acos(c / q));
            sx = det / q;
            sy = q;
            ky = Maths.atan((a * c + b * d) / q ** 2); // always 0
        } else {
            sx = 0;
            sy = 0;
        }
        return {
            translate: [tx, ty] as [number, number],
            rotate: r,
            scale: [sx, sy] as [number, number],
            skew: [kx, ky] as [number, number]
        };
    }
    /**
     * Decompose transformation matrix `m` via SVD decomposition.
     * @see https://scicomp.stackexchange.com/questions/8899/robust-algorithm-for-2-times-2-svd
     * @see https://math.stackexchange.com/questions/861674/decompose-a-2d-arbitrary-transform-into-only-scaling-and-rotation
     * @param m
     */
    static decomposeSvd(m: [number, number, number, number, number, number]) {
        const [a, b, c, d, tx, ty] = m;

        const e = (a + d) / 2;
        const f = (a - d) / 2;
        const g = (b + c) / 2;
        const h = (b - c) / 2;
        const q = Maths.sqrt(e ** 2 + h ** 2);
        const r = Maths.sqrt(f ** 2 + g ** 2);
        const sx = q + r;
        const sy = q - r;
        const a1 = Maths.atan2(g, f);
        const a2 = Maths.atan2(h, e);
        const r1 = (a2 + a1) / 2;
        const r2 = (a2 - a1) / 2;

        return {
            translate: [tx, ty] as [number, number],
            rotate1: r1,
            scale: [sx, sy] as [number, number],
            rotate2: r2
        };
    }
    /**
     * Returns a transformation matrix of translation determined by `tx` and `ty`.
     * @param tx
     * @param ty
     */
    static translate(tx: number, ty: number) {
        return [1, 0, 0, 1, tx, ty] as [number, number, number, number, number, number];
    }
    /**
     * Returns a transformation matrix of rotation determined by `r`(angle).
     * @param r
     */
    static rotate(r: number) {
        return [Maths.cos(r), Maths.sin(r), -Maths.sin(r), Maths.cos(r), 0, 0] as [number, number, number, number, number, number];
    }
    /**
     * Returns a transformation matrix of scaling determined by `sx` and `sy`.
     * @param sx
     * @param sy
     */
    static scale(sx: number, sy: number) {
        return [sx, 0, 0, sy, 0, 0] as [number, number, number, number, number, number];
    }
    /**
     * Returns a transformation matrix of skewing determined by `kx`(angle) and `ky`(angle).
     * @param kx
     * @param ky
     */
    static skew(kx: number, ky: number) {
        return [1, Maths.tan(ky), Maths.tan(kx), 1, 0, 0] as [number, number, number, number, number, number];
    }
    /**
     * Returns a transformation matrix of line reflection determined by `a`, `b` and `c` of the implicit function of the line.
     * @param a
     * @param b
     * @param c
     */
    static lineReflect(a: number, b: number, c: number) {
        const den = a ** 2 + b ** 2;
        // prettier-ignore
        return [
            (b ** 2 - a ** 2) / den,
            -(2 * a * b) / den,
            -(2 * a * b) / den,
            -(b ** 2 - a ** 2) / den,
            -(2 * a * c) / den,
            -(2 * b * c) / den
        ] as [number,number,number,number,number,number];
    }
    /**
     * Returns a transformation matrix of point reflection determined by `x` and `y`.
     * @param x
     * @param y
     */
    static pointReflect(x: number, y: number) {
        return [-1, 0, 0, -1, 2 * x, 2 * y] as [number, number, number, number, number, number];
    }
}
export default TransformationMatrix;
