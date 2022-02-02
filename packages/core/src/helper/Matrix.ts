import { Matrix3 } from "@geomtoy/util";
export default class Matrix {
    //
    // a c e
    // b d f
    // 0 0 1
    //
    constructor(public a: number, public b: number, public c: number, public d: number, public e: number, public f: number) {}

    static get identity() {
        return new Matrix(1, 0, 0, 1, 0, 0);
    }
    identity() {
        return this.clone().identitySelf();
    }
    identitySelf() {
        Object.assign(this, { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
        return this;
    }
    preMultiply(matrix: Matrix) {
        return this.clone().preMultiplySelf(matrix);
    }
    preMultiplySelf(matrix: Matrix) {
        Object.assign(this, Matrix.multiply(matrix, this));
        return this;
    }
    postMultiply(matrix: Matrix) {
        return this.clone().postMultiplySelf(matrix);
    }
    postMultiplySelf(matrix: Matrix) {
        Object.assign(this, Matrix.multiply(this, matrix));
        return this;
    }
    static multiply(matrix1: Matrix, matrix2: Matrix): { a: number; b: number; c: number; d: number; e: number; f: number } {
        const { a: a1, b: b1, c: c1, d: d1, e: e1, f: f1 } = matrix1;
        const { a: a2, b: b2, c: c2, d: d2, e: e2, f: f2 } = matrix2;
        const [a, c, e, b, d, f] = Matrix3.dotMatrix3([a1, c1, e1, b1, d1, f1, 0, 0, 1], [a2, c2, e2, b2, d2, f2, 0, 0, 1]);
        return { a, b, c, d, e, f };
    }
    invert() {
        return this.clone().invertSelf();
    }
    invertSelf() {
        let { a, b, c, d, e, f } = this;
        const inverse = Matrix3.invert([a, c, e, b, d, f, 0, 0, 1]);
        if (inverse === undefined) throw new Error(`[G]\`Matrix:(a: ${a}, b: ${b}, c: ${c}, d: ${d}, e: ${e}, f: ${f}) is NOT invertible.`);
        [a, c, e, b, d, f] = inverse;
        Object.assign(this, { a, b, c, d, e, f });
        return this;
    }
    transformCoordinates(coordinates: [number, number]) {
        const { a, b, c, d, e, f } = this;
        const [x, y] = coordinates;
        const [xp, yp] = Matrix3.dotVector3([a, c, e, b, d, f, 0, 0, 1], [x, y, 1]);
        return [xp, yp] as [number, number];
    }
    antitransformCoordinates(coordinates: [number, number]) {
        return this.invert().transformCoordinates(coordinates) as [number, number];
    }
    clone() {
        const { a, b, c, d, e, f } = this;
        return new Matrix(a, b, c, d, e, f);
    }
    toArray() {
        const { a, b, c, d, e, f } = this;
        return [a, b, c, d, e, f] as [number, number, number, number, number, number];
    }
    toObject() {
        const { a, b, c, d, e, f } = this;
        return { a, b, c, d, e, f };
    }
}
