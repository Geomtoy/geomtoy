import { Complex, Maths } from "../src";

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
        expect(Complex.reciprocal(c)).to.deep.equal([NaN, NaN]);
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
        expect(Complex.sin(b)).to.deep.equal([-3.853738037919377, -27.016813258003932]);
        expect(Complex.cos(b)).to.deep.equal([-27.034945603074224, 3.851153334811777]);
        expect(Complex.sec(b)).to.deep.equal([-0.03625349691586887, -0.005164344607753179]);
        expect(Complex.csc(b)).to.deep.equal([-0.005174473184019398, 0.03627588962862602]);
        expect(Complex.tan(b)).to.deep.equal([0.00018734620462948492, 0.999355987381473]);
    });
});
