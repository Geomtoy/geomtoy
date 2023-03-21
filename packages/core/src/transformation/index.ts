import { Assert, TransformationMatrix, Type, Utility } from "@geomtoy/util";
import { validGeometryArguments } from "../misc/decor-geometry";
import EventSourceObject from "../event/EventSourceObject";
import EventTarget from "../base/EventTarget";
import type Point from "../geometries/basic/Point";
import type Line from "../geometries/basic/Line";
import { getCoordinates } from "../misc/point-like";

export default class Transformation extends EventTarget {
    private _matrix = TransformationMatrix.identity();

    constructor(matrix?: [a: number, b: number, c: number, d: number, e: number, f: number]) {
        super();
        if (matrix !== undefined) {
            this.matrix = matrix;
        }
    }
    static override events = {
        matrixChanged: "matrix" as const
    };

    private _setMatrix(value: [number, number, number, number, number, number]) {
        if (!Utility.is(this._matrix, value)) this.trigger_(new EventSourceObject(this, Transformation.events.matrixChanged));
        Object.assign(this._matrix, value);
    }
    get matrix() {
        return [...this._matrix] as [a: number, b: number, c: number, d: number, e: number, f: number];
    }
    set matrix(value) {
        const [a, b, c, d, e, f] = value;
        Assert.isRealNumber(a, "a");
        Assert.isRealNumber(b, "b");
        Assert.isRealNumber(c, "c");
        Assert.isRealNumber(d, "d");
        Assert.isRealNumber(e, "e");
        Assert.isRealNumber(f, "f");
        this._setMatrix(value);
    }

    private _withPrePostTranslation(m: [number, number, number, number, number, number], x: number, y: number) {
        return TransformationMatrix.multiply(TransformationMatrix.multiply(TransformationMatrix.translate(x, y), m), TransformationMatrix.translate(-x, -y));
    }
    private _postMultiply(m: [number, number, number, number, number, number]) {
        return TransformationMatrix.multiply(this._matrix, m);
    }
    private _preMultiply(m: [number, number, number, number, number, number]) {
        return TransformationMatrix.multiply(m, this._matrix);
    }

    /**
     * Reset transformation `this` by the identity matrix.
     */
    reset() {
        this._setMatrix(TransformationMatrix.identity());
        return this;
    }
    /**
     * Invert transformation `this`.
     */
    invert() {
        this._setMatrix(TransformationMatrix.invert(this._matrix));
        return this;
    }
    /**
     * Set transformation `this` to a translation with `offsetX` and `offsetY`.
     * @param offsetX
     * @param offsetY
     */
    setTranslate(offsetX: number, offsetY: number) {
        Assert.isRealNumber(offsetX, "offsetX");
        Assert.isRealNumber(offsetY, "offsetY");

        this._setMatrix(TransformationMatrix.translate(offsetX, offsetY));
        return this;
    }
    /**
     * Add a translation with `offsetX` and `offsetY` to transformation `this`.
     * @param offsetX
     * @param offsetY
     * @param preOrPost `pre` = premultiply, `post` = postmultiply(default)
     */
    addTranslate(offsetX: number, offsetY: number, preOrPost: "pre" | "post" = "post") {
        Assert.isRealNumber(offsetX, "offsetX");
        Assert.isRealNumber(offsetY, "offsetY");

        const m = TransformationMatrix.translate(offsetX, offsetY);
        this._setMatrix(preOrPost === "post" ? this._postMultiply(m) : this._preMultiply(m));
        return this;
    }
    /**
     * Set transformation `this` to a rotation with `angle` and `originPoint`(if provided).
     * @param angle
     * @param originPoint
     */
    @validGeometryArguments
    setRotate(angle: number, originPoint?: [number, number] | Point) {
        Assert.isRealNumber(angle, "angle");

        const [x, y] = originPoint == undefined ? [0, 0] : getCoordinates(originPoint, "originPoint");
        let m = TransformationMatrix.rotate(angle);
        if (x !== 0 || y !== 0) m = this._withPrePostTranslation(m, x, y);
        this._setMatrix(m);
        return this;
    }
    /**
     * Add a rotation with `angle` and `originPoint`(if provided) to transformation `this`.
     * @param angle
     * @param originPoint
     * @param preOrPost `pre` = premultiply, `post` = postmultiply(default)
     */
    addRotate(angle: number, preOrPost?: "pre" | "post"): this;
    addRotate(angle: number, originPoint?: [number, number] | Point, preOrPost?: "pre" | "post"): this;
    @validGeometryArguments
    addRotate(angle: number, a1?: any, a2?: any) {
        Assert.isRealNumber(angle, "angle");

        const preOrPost: "pre" | "post" = (Type.isString(a1) ? a1 : a2) || "post";
        const [x, y] = (Type.isArray(a1) && getCoordinates(a1 as [number, number], "originPoint")) || [0, 0];
        let m = TransformationMatrix.rotate(angle);
        if (x !== 0 || y !== 0) m = this._withPrePostTranslation(m, x, y);
        this._setMatrix(preOrPost === "post" ? this._postMultiply(m) : this._preMultiply(m));
        return this;
    }
    /**
     * Set transformation `this` to a scaling with `factorX`, `factorY` and `originPoint`(if provided).
     * @param factorX
     * @param factorY
     * @param originPoint
     */
    @validGeometryArguments
    setScale(factorX: number, factorY: number, originPoint?: [number, number] | Point) {
        Assert.isRealNumber(factorX, "factorX");
        Assert.isRealNumber(factorY, "factorY");

        const [x, y] = originPoint == undefined ? [0, 0] : getCoordinates(originPoint, "originPoint");
        let m = TransformationMatrix.scale(factorX, factorY);
        if (x !== 0 || y !== 0) m = this._withPrePostTranslation(m, x, y);
        this._setMatrix(m);
        return this;
    }
    /**
     * Add a scaling with `factorX`, `factorY` and `originPoint`(if provided) to transformation `this`.
     * @param factorX
     * @param factorY
     * @param originPoint
     * @param preOrPost `pre` = premultiply, `post` = postmultiply(default)
     */
    addScale(factorX: number, factorY: number, preOrPost?: "pre" | "post"): this;
    addScale(factorX: number, factorY: number, originPoint?: [number, number] | Point, preOrPost?: "pre" | "post"): this;
    @validGeometryArguments
    addScale(factorX: number, factorY: number, a2?: any, a3?: any) {
        Assert.isRealNumber(factorX, "factorX");
        Assert.isRealNumber(factorY, "factorY");

        const preOrPost: "pre" | "post" = (Type.isString(a2) ? a2 : a3) || "post";
        const [x, y] = (Type.isArray(a2) && getCoordinates(a2 as [number, number], "originPoint")) || [0, 0];
        let m = TransformationMatrix.scale(factorX, factorY);
        if (x !== 0 || y !== 0) m = this._withPrePostTranslation(m, x, y);
        this._setMatrix(preOrPost === "post" ? this._postMultiply(m) : this._preMultiply(m));
        return this;
    }
    /**
     * Set transformation `this` to a skewing with `angleX`, `angleY` and `originPoint`(if provided).
     * @param angleX
     * @param angleY
     * @param originPoint
     */
    @validGeometryArguments
    setSkew(angleX: number, angleY: number, originPoint?: [number, number] | Point) {
        Assert.isRealNumber(angleX, "angleX");
        Assert.isRealNumber(angleY, "angleY");

        const [x, y] = originPoint == undefined ? [0, 0] : getCoordinates(originPoint, "originPoint");
        let m = TransformationMatrix.skew(angleX, angleY);
        if (x !== 0 || y !== 0) m = this._withPrePostTranslation(m, x, y);
        this._setMatrix(m);
        return this;
    }
    /**
     * Add a skewing with `angleX`, `angleY` and `originPoint`(if provided) to transformation `this`.
     * @param angleX
     * @param angleY
     * @param originPoint
     * @param preOrPost `pre` = premultiply, `post` = postmultiply(default)
     */

    addSkew(angleX: number, angleY: number, preOrPost?: "pre" | "post"): this;
    addSkew(angleX: number, angleY: number, originPoint?: [number, number] | Point, preOrPost?: "pre" | "post"): this;
    @validGeometryArguments
    addSkew(angleX: number, angleY: number, a2?: any, a3?: any) {
        Assert.isRealNumber(angleX, "angleX");
        Assert.isRealNumber(angleY, "angleY");

        const preOrPost: "pre" | "post" = (Type.isString(a2) ? a2 : a3) || "post";
        const [x, y] = (Type.isArray(a2) && getCoordinates(a2 as [number, number], "originPoint")) || [0, 0];
        let m = TransformationMatrix.skew(angleX, angleY);
        if (x !== 0 || y !== 0) m = this._withPrePostTranslation(m, x, y);
        this._setMatrix(preOrPost === "post" ? this._postMultiply(m) : this._preMultiply(m));
        return this;
    }

    /**
     * Set transformation `this` to a line reflection with `line`.
     * @param line
     */
    @validGeometryArguments
    setLineReflect(line: Line) {
        const [a, b, c] = line.getImplicitFunctionCoefs();
        this._setMatrix(TransformationMatrix.lineReflect(a, b, c));
        return this;
    }
    /**
     * Add a line reflection with `line` to transformation `this`.
     * @param line
     * @param preOrPost `pre` = premultiply, `post` = postmultiply(default)
     */
    @validGeometryArguments
    addLineReflect(line: Line, preOrPost: "pre" | "post" = "post") {
        const [a, b, c] = line.getImplicitFunctionCoefs();
        const m = TransformationMatrix.lineReflect(a, b, c);
        this._setMatrix(preOrPost === "post" ? this._postMultiply(m) : this._preMultiply(m));
        return this;
    }
    /**
     * Set transformation `this` to a point reflection with `point`.
     * @param point
     */
    @validGeometryArguments
    setPointReflect(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        this._setMatrix(TransformationMatrix.pointReflect(x, y));
        return this;
    }
    /**
     * Add a point reflection with `point` to transformation `this`.
     * @param point
     * @param preOrPost `pre` = premultiply, `post` = postmultiply(default)
     */
    @validGeometryArguments
    addPointReflect(point: [number, number] | Point, preOrPost: "pre" | "post" = "post") {
        const [x, y] = getCoordinates(point, "point");
        const m = TransformationMatrix.pointReflect(x, y);
        this._setMatrix(preOrPost === "post" ? this._postMultiply(m) : this._preMultiply(m));
        return this;
    }
    /**
     * Set transformation `this` to a matrix.
     * @param a
     * @param b
     * @param c
     * @param d
     * @param e
     * @param f
     */
    setMatrix(a: number, b: number, c: number, d: number, e: number, f: number) {
        Assert.isRealNumber(a, "a");
        Assert.isRealNumber(b, "b");
        Assert.isRealNumber(c, "c");
        Assert.isRealNumber(d, "d");
        Assert.isRealNumber(e, "e");
        Assert.isRealNumber(f, "f");
        this._setMatrix([a, b, c, d, e, f]);
        return this;
    }
    /**
     * Add a matrix to transformation `this`.
     * @param a
     * @param b
     * @param c
     * @param d
     * @param e
     * @param f
     * @param preOrPost `pre` = premultiply, `post` = postmultiply(default)
     */
    addMatrix(a: number, b: number, c: number, d: number, e: number, f: number, preOrPost: "pre" | "post" = "post") {
        Assert.isRealNumber(a, "a");
        Assert.isRealNumber(b, "b");
        Assert.isRealNumber(c, "c");
        Assert.isRealNumber(d, "d");
        Assert.isRealNumber(e, "e");
        Assert.isRealNumber(f, "f");
        const m = [a, b, c, d, e, f] as [number, number, number, number, number, number];
        this._setMatrix(preOrPost === "post" ? this._postMultiply(m) : this._preMultiply(m));
        return this;
    }
    /**
     * Transform `coordinates` with the current transformation matrix
     * to the coordinates corresponding to the identity matrix, or you can also say,
     * map the `coordinates` of the local coordinate system to the upper tier coordinate system.
     */
    transformCoordinates(coordinates: [number, number]): [number, number] {
        return TransformationMatrix.transformCoordinates(this._matrix, coordinates);
    }
    /**
     * Transform `coordinates` corresponding to the identity matrix
     * to the coordinates with the current transformation matrix, or you can also say,
     * map the `coordinates` of upper tier coordinate system to the local coordinate system.
     */
    antitransformCoordinates(coordinates: [number, number]): [number, number] {
        return TransformationMatrix.antitransformCoordinates(this._matrix, coordinates);
    }
    /**
     * Decompose transformation `this` via the QR-like decomposition.
     * @description The return object (if named `o`) means transformation `this` is equal to
     * ```javascript
     * this.reset()
     *  .addTranslate(o.translate[0], o.translate[1])
     *  .addRotate(o.rotate)
     *  .addScale(o.scale[0], o.scale[1])
     *  .addSkew(o.skew[0], o.skew[1])
     * ```
     */
    decomposeQr() {
        return TransformationMatrix.decomposeQr(this._matrix);
    }
    /**
     * Decompose transformation `this` via SVD decomposition.
     * @description The return object (if named `o`) means transformation `this` is equal to
     * ```javascript
     * this.reset()
     *  .addTranslate(o.translate[0], o.translate[1])
     *  .addRotate(o.rotate1)
     *  .addScale(o.scale[0], o.scale[1])
     *  .addRotate(o.rotate2)
     * ```
     */
    decomposeSvd() {
        return TransformationMatrix.decomposeSvd(this._matrix);
    }

    span() {
        return TransformationMatrix.span(this._matrix);
    }
    clone() {
        return new Transformation(this._matrix);
    }
    copyFrom(transformation: Transformation | null) {
        if (transformation === null) transformation = new Transformation();
        this._setMatrix(transformation._matrix);
        return this;
    }

    override toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.id}){`,
            `\tmatrix: ${JSON.stringify(this._matrix)}`, 
            `}`
        ].join("\n")
    }
}
