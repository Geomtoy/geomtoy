import { Complex, Maths, Angle } from "../src";
import { diffFlatNumberArray } from "./util/assertion";

const expect = chai.expect;

const a = [5, 6] as [number, number];
const b = [-3, 4] as [number, number];
const c = [0, 0] as [number, number];

describe("Complex", () => {
    it("i", () => {
        expect(Complex.i()).to.deep.equal([0, 1]);
    });

    it("real part and imaginary part", () => {
        expect(Complex.real(a)).to.equal(5);
        expect(Complex.imag(a)).to.equal(6);
        expect(Complex.real([NaN, NaN], 1)).to.equal(1);
        expect(Complex.imag([NaN, NaN], 2)).to.equal(2);
    });

    it("modulus and argument", () => {
        expect(Complex.modulus(a)).to.equal(7.810249675906656);
        expect(Complex.squaredModulus(a)).to.equal(61);
        expect(Complex.argument(a)).to.equal(0.8760580505981934);

        expect(Complex.modulus(b)).to.equal(5);
        expect(Complex.squaredModulus(b)).to.equal(25);
        expect(Complex.argument(b)).to.equal(2.214297435588181);
    });

    it("from", () => {
        expect(Complex.from(Maths.PI / 4, 1)).to.deep.equal([0.7071067811865476, 0.7071067811865475]);
    });

    it("add, subtract, multiply and divide", () => {
        expect(Complex.add(a, b)).to.deep.equal([2, 10]);
        expect(Complex.add(b, a)).to.deep.equal([2, 10]);
        expect(Complex.subtract(a, b)).to.deep.equal([8, 2]);
        expect(Complex.subtract(b, a)).to.deep.equal([-8, -2]);
        expect(Complex.multiply(a, b)).to.deep.equal([-39, 2]);
        expect(Complex.multiply(b, a)).to.deep.equal([-39, 2]);
        expect(Complex.divide(a, b)).to.deep.equal([0.36, -1.52]);
        expect(Complex.divide(b, a)).to.deep.equal([0.14754098360655737, 0.6229508196721312]);

        expect(Complex.subtract(Complex.add(a, b), a)).to.be.deep.equal(b);
        expect(Complex.multiply(Complex.divide(a, b), b)).to.be.deep.equal(a);
    });

    it("negative", () => {
        expect(Complex.negative(b)).to.deep.equal([3, -4]);
        expect(Complex.negative(c)).to.deep.equal([-0, -0]);
    });

    it("reciprocal", () => {
        expect(Complex.reciprocal(b)).to.deep.equal([-0.12, -0.16]);
        expect(Complex.reciprocal([0, 0])).to.deep.equal([Infinity, Infinity]);
    });

    it("scalarMultiply", () => {
        expect(Complex.scalarMultiply(b, 2)).to.deep.equal([-6, 8]);
    });

    it("conjugate", () => {
        expect(Complex.conjugate(a)).to.deep.equal([5, -6]);
        expect(Complex.conjugate(b)).to.deep.equal([-3, -4]);
        expect(Complex.conjugate(c)).to.deep.equal([0, -0]);
    });

    it("exp", () => {
        expect(Complex.exp(a)).to.deep.equal([142.50190551820737, -41.468936789922886]);
    });

    it("trigonometric functions", () => {
        const a = [-3, 4] as [number, number];
        expect(diffFlatNumberArray(Complex.sin(a), [-3.853738037919377, -27.016813258003932])).to.be.false;
        expect(diffFlatNumberArray(Complex.cos(a), [-27.034945603074224, 3.851153334811777])).to.be.false;
        expect(diffFlatNumberArray(Complex.tan(a), [0.00018734620462948492, 0.999355987381473])).to.be.false;

        const b = Complex.negative([-3 + Maths.PI, 4]);
        const c = Complex.negative([-3, 4]);
        const d = [-3 + Maths.PI, 4];
        expect(diffFlatNumberArray(Complex.asin([-3.853738037919377, -27.016813258003932]), b)).to.be.false;
        expect(diffFlatNumberArray(Complex.acos([-27.034945603074224, 3.851153334811777]), c)).to.be.false;
        expect(diffFlatNumberArray(Complex.atan([0.00018734620462948492, 0.999355987381473]), d)).to.be.false;
    });
    it("hyperbolic functions", () => {
        const a = [-3, 4] as [number, number];
        expect(diffFlatNumberArray(Complex.sinh(a), [6.5481200409110025, -7.61923172032141])).to.be.false;
        expect(diffFlatNumberArray(Complex.cosh(a), [-6.580663040551157, 7.581552742746545])).to.be.false;
        expect(diffFlatNumberArray(Complex.tanh(a), [-1.000709536067233, 0.00490825806749606])).to.be.false;

        const b = Complex.negative([-3, 4 - Maths.PI]);
        const c = Complex.negative([-3, 4 - Maths.PI * 2]);
        const d = [-3, 4 - Maths.PI];
        expect(diffFlatNumberArray(Complex.asinh([6.5481200409110025, -7.61923172032141]), b)).to.be.false;
        expect(diffFlatNumberArray(Complex.acosh([-6.580663040551157, 7.581552742746545]), c)).to.be.false;
        expect(diffFlatNumberArray(Complex.atanh([-1.000709536067233, 0.00490825806749606]), d)).to.be.false;
    });

    it("sqrt", () => {
        expect(Complex.sqrt([3, 4])).to.deep.equal([2, 1]);
        expect(Complex.sqrt([3, -4])).to.deep.equal([2, -1]);
        expect(Complex.sqrt([-3, 4])).to.deep.equal([1, 2]);
        expect(Complex.sqrt([-3, -4])).to.deep.equal([1, -2]);
    });
});
