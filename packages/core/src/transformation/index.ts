import { Math } from "@geomtoy/util";
import { validAndWithSameOwner } from "../decorator";
import Matrix from "../helper/Matrix";

import BaseObject from "../base/BaseObject";
import Point from "../shapes/basic/Point";
import Line from "../shapes/basic/Line";

import type Geomtoy from "../geomtoy";

class Transformation extends BaseObject {
    private _matrix: Matrix = Matrix.identity;

    constructor(owner: Geomtoy) {
        super(owner);
        return Object.seal(this);
    }
    /**
     * Get the matrix of transformation `this`.
     */
    get(): [number, number, number, number, number, number] {
        let { a, b, c, d, e, f } = this._matrix;
        return [a, b, c, d, e, f];
    }
    /**
     * Set the matrix of transformation `this`.
     */
    set(value: [number, number, number, number, number, number]) {
        let [a, b, c, d, e, f] = value;
        Object.assign(this._matrix, { a, b, c, d, e, f });
        return this;
    }
    /**
     * Reset transformation `this` by the identity matrix.
     */
    reset() {
        this._matrix.identitySelf();
        return this;
    }
    invert() {
        this._matrix.invertSelf();
        return this;
    }
    /**
     * Add a translation to transformation `this`.
     */
    translate(offsetX: number, offsetY: number) {
        let t = Object.assign(Matrix.identity, {
            e: offsetX,
            f: offsetY
        }) as Matrix;
        this._matrix.postMultiplySelf(t);
        return this;
    }
    /**
     * Add a rotation to transformation `this`.
     */
    rotate(angle: number, originPoint?: [number, number] | Point) {
        const t = Object.assign(Matrix.identity, {
            a: Math.cos(angle),
            b: -Math.sin(angle),
            c: Math.sin(angle),
            d: Math.cos(angle)
        });
        if (originPoint !== undefined) {
            const [x, y] = originPoint instanceof Point ? originPoint.coordinates : originPoint;
            const preTranslation = Object.assign(Matrix.identity, { e: x, f: y });
            const postTranslation = Object.assign(Matrix.identity, { e: -x, f: -y });
            t.preMultiplySelf(preTranslation);
            t.postMultiplySelf(postTranslation);
        }
        this._matrix.postMultiplySelf(t);
        return this;
    }
    /**
     * Add a scaling to transformation `this`.
     */
    scale(factorX: number, factorY: number, originPoint?: [number, number] | Point) {
        const t = Object.assign(Matrix.identity, {
            a: factorX,
            d: factorY
        });
        if (originPoint !== undefined) {
            const [x, y] = originPoint instanceof Point ? originPoint.coordinates : originPoint;
            const preTranslation = Object.assign(Matrix.identity, { e: x, f: y });
            const postTranslation = Object.assign(Matrix.identity, { e: -x, f: -y });
            t.preMultiplySelf(preTranslation);
            t.postMultiplySelf(postTranslation);
        }
        this._matrix.postMultiplySelf(t);
        return this;
    }
    /**
     * Add a skewing to transformation `this`.
     */
    skew(angleX: number, angleY: number, originPoint?: [number, number] | Point) {
        const t = Object.assign(Matrix.identity, {
            b: Math.tan(angleY),
            c: Math.tan(angleX)
        });

        if (originPoint !== undefined) {
            const [x, y] = originPoint instanceof Point ? originPoint.coordinates : originPoint;
            const preTranslation = Object.assign(Matrix.identity, { e: x, f: y });
            const postTranslation = Object.assign(Matrix.identity, { e: -x, f: -y });
            t.preMultiplySelf(preTranslation);
            t.postMultiplySelf(postTranslation);
        }
        this._matrix.postMultiplySelf(t);
        return this;
    }
    /**
     * Add a line reflection to transformation `this`.
     */
    lineReflect(line: Line) {
        const [a, b, c] = line.getGeneralEquationParameters();
        const denom = a ** 2 + b ** 2;
        const t = Object.assign(Matrix.identity, {
            a: (b ** 2 - a ** 2) / denom,
            b: -(2 * a * b) / denom,
            c: -(2 * a * b) / denom,
            d: -(b ** 2 - a ** 2) / denom,
            e: -(2 * a * c) / denom,
            f: -(2 * b * c) / denom
        }) as Matrix;
        this._matrix.postMultiplySelf(t);
        return this;
    }
    /**
     * Add a point reflection to transformation `this`.
     */
    pointReflect(point: [number, number] | Point) {
        const [x, y] = point instanceof Point ? point.coordinates : point;
        const t = Object.assign(Matrix.identity, {
            a: -1,
            d: -1,
            e: 2 * x,
            f: 2 * y
        });
        this._matrix.postMultiplySelf(t);
        return this;
    }
    /**
     * Add a matrix transformation to transformation `this`.
     */
    matrix(a: number, b: number, c: number, d: number, e: number, f: number) {
        let t = new Matrix(a, b, c, d, e, f);
        this._matrix.postMultiplySelf(t);
        return this;
    }
    /**
     * Transform `coordinates` with the current transformation
     * to the coordinates corresponding to the identity matrix (the initial state without any transformation),
     * and the visual position of the coordinates will not change.
     */
    transformCoordinates(coordinates: [number, number]): [number, number] {
        return this._matrix.transformCoordinates(coordinates);
    }
    /**
     * Transform `coordinates` corresponding to the identity matrix (the initial state without any transformation)
     * to the coordinates with the current transformation,
     * and the visual position of the coordinates will not change.
     */
    antitransformCoordinates(coordinates: [number, number]): [number, number] {
        return this._matrix.antitransformCoordinates(coordinates);
    }
    /**
     * Decompose transformation `this`.
     * @description The return object (if named `o`) means transformation `this` is equal to
     * ```javascript
     * this.reset().translate(o.translateX, o.translateY).rotate(o.rotation).scale(o.scaleX, o.scaleY).skew(o.skewX, o.skewY)
     * ```
     * @see https://frederic-wang.fr/decomposition-of-2d-transform-matrices.html
     */
    decompose() {
        let [a, b, c, d, e, f] = this.get(),
            determinant = a * d - b * c,
            rotation = 0,
            scaleX = 1,
            scaleY = 1,
            skewX = 0,
            skewY = 0;
        if (a !== 0 || b !== 0) {
            let r = Math.hypot(a, b);
            rotation = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
            scaleX = r;
            scaleY = determinant / r;
            skewX = Math.atan((a * c + b * d) / r ** 2);
        } else if (c !== 0 || d !== 0) {
            let s = Math.hypot(c, d);
            rotation = Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
            scaleX = determinant / s;
            scaleY = s;
            skewY = Math.atan((a * c + b * d) / s ** 2); //always 0
        } else {
            scaleX = 0;
            scaleY = 0;
        }
        return {
            translateX: e,
            translateY: f,
            rotation,
            scaleX,
            scaleY,
            skewX,
            skewY
        };
    }
    clone() {
        return new Transformation(this.owner).set(this.get());
    }
    copyFrom(from: BaseObject): this {
        throw new Error("Method not implemented.");
    }
    toString() {
        let [a, b, c, d, e, f] = this.get();
        //prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\ta: ${a}`,
            `\tb: ${b}`,
            `\tc: ${c}`,
            `\td: ${d}`,
            `\te: ${e}`,
            `\tf: ${f}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n")
    }
    toArray() {
        return this.get();
    }
    toObject() {
        let [a, b, c, d, e, f] = this.get();
        return { a, b, c, d, e, f };
    }
}

validAndWithSameOwner(Transformation);

export default Transformation;
