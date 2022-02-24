import { Polynomial } from "../src";
import { diffFlatNumberArray, diffDepth1NumberArray } from "./util/assertion";

const expect = chai.expect;

describe("Polynomial", () => {
    it("from", () => {
        expect(Polynomial.from([1]), "x-1").to.deep.equal([1, -1]);
        expect(
            Polynomial.from([
                [0, 1],
                [0, -1]
            ]),
            "(x+i)(x-i) => x^2+1"
        ).to.deep.equal([1, 0, 1]);
        expect(Polynomial.from([1, -1]), "(x-1)(x+1) => x^2-1").to.deep.equal([1, 0, -1]);
        expect(Polynomial.from([1, 1, 1]), "(x-1)(x-1)(x-1) => x^3-3x^2+3x-1").to.deep.equal([1, -3, 3, -1]);
        expect(Polynomial.from([1, [0, 1], [0, -1]]), "(x-1)(x+i)(x-i) =>  x^3-x^2+x-1").to.deep.equal([1, -1, 1, -1]);

        expect(() => Polynomial.from([[0, 1]])).to.throw();
        expect(() => Polynomial.from([[1, 0]])).not.to.throw();
    });
    it("add", () => {
        const a = [1, 2];
        const b = [1, 3, 4];
        const c = [-1, 0, 0];
        expect(Polynomial.add(a, b)).to.deep.equal([1, 4, 6]);
        expect(Polynomial.add(b, c)).to.deep.equal([3, 4]);
    });
    it("subtract", () => {
        const a = [1, 2];
        const b = [1, 3, 4];
        const c = [1, 0, 0];
        expect(Polynomial.subtract(a, b)).to.deep.equal([-1, -2, -2]);
        expect(Polynomial.subtract(b, c)).to.deep.equal([3, 4]);
    });
    it("multiply", () => {
        const a = [1, 2];
        const b = [1, 3, 4];
        expect(Polynomial.multiply(a, b)).to.deep.equal([1, 5, 10, 8]);
    });
    it("divide", () => {
        const a = [6, 5, 0, -7];
        const b = [3, -2, -1];
        let [q, r] = Polynomial.divide(a, b);
        expect(q).to.be.deep.equal([2, 3]);
        expect(r).to.be.deep.equal([8, -4]);
    });

    it("compose", () => {
        const p = [1, 1, 1, 1];
        const q = [1, 1, 1];
        expect(Polynomial.compose(p, q)).to.deep.equal([1, 3, 7, 9, 10, 6, 4]);
        expect(Polynomial.compose(q, p)).to.deep.equal([1, 2, 3, 5, 4, 3, 3]);
    });

    it("legendre", () => {
        expect(Polynomial.legendre(0)).to.deep.equal([1]);
        expect(Polynomial.legendre(1)).to.deep.equal([1, 0]);
        expect(Polynomial.legendre(2)).to.deep.equal([1.5, 0, -0.5]);
        expect(Polynomial.legendre(3)).to.deep.equal([2.5, 0, -1.5, 0]);
        expect(Polynomial.legendre(4)).to.deep.equal([4.375, 0, -3.75, 0, 0.375]);
        expect(Polynomial.legendre(5)).to.deep.equal([7.875, 0, -8.75, 0, 1.875, 0]);
        expect(Polynomial.legendre(6)).to.deep.equal([14.4375, 0, -19.6875, 0, 6.5625, 0, -0.3125]);
        expect(Polynomial.legendre(7)).to.deep.equal([26.8125, 0, -43.3125, 0, 19.6875, 0, -2.1875, 0]);
        expect(Polynomial.legendre(8)).to.deep.equal([50.2734375, 0, -93.84375, 0, 54.140625, 0, -9.84375, 0, 0.2734375]);
    });

    it("no name", () => {
        const p1 = [-3317760285, 9.12, 656907, -0.00092, -32.516];
        const p2 = [1, -0.00840227855921347, 0.006403599514621606];
        let [q, r] = Polynomial.divide(p1, p2);
        expect(diffFlatNumberArray(q, [-3317760285, -27876736.98726547, 21668287.041167907])).to.be.false;
        expect(diffFlatNumberArray(r, [360574.4421417755, -138787.54837950444])).to.be.false;
    });

    it("roots", () => {
        expect(Polynomial.roots([1, 5])).to.deep.equal([-5]);
        expect(Polynomial.roots([1, -2, 1])).to.deep.equal([1, 1]);

        const p0 = [1, -1, 1, -1];
        // prettier-ignore
        const p0Roots: (number | [number, number])[] = [
            1, 
            [0, -1], 
            [0, 1]
        ];
        expect(diffDepth1NumberArray(Polynomial.roots(p0), p0Roots)).to.be.false;

        const p1 = [-30, 0, -10, 0, 0];
        // prettier-ignore
        const p1Roots: (number|[number, number])[] = [
            0,
            0,
            [0, -0.5773502691896258],
            [0, 0.5773502691896258]
        ];
        expect(diffDepth1NumberArray(Polynomial.roots(p1), p1Roots)).to.be.false;

        const p2 = [-30, 0, 10, 0, 0];
        // prettier-ignore
        const p2Roots: (number|[number, number])[] = [
            -0.5773502691896257,
            0,
            0,
            0.5773502691896258
        ];
        expect(diffDepth1NumberArray(Polynomial.roots(p2), p2Roots)).to.be.false;

        const p3 = [0.001736, -0.0034, 627, -615, 150];
        // prettier-ignore
        const p3Roots: (number|[number, number])[] = [
            0.45454000620568863,
            0.5263238442174647, 
            [0.4888307475994833, -600.9772691739776],
            [0.4888307475994833, 600.9772691739776]
        ];
        expect(diffDepth1NumberArray(Polynomial.roots(p3), p3Roots)).to.be.false;

        const p4 = [-3317760285, 9.12, 656907, -0.00092, -32.516];
        // prettier-ignore
        const p4Roots: (number|[number, number])[] = [
            -0.009967763007283238,
            -0.009931807447891799,
            0.009931816041171777,
            0.009967757162845611
        ];
        expect(diffDepth1NumberArray(Polynomial.roots(p4), p4Roots)).to.be.false;

        const p5 = [-33.18, 0.00091, 0.0056, -7.88e-8, -2.34e-7];
        // prettier-ignore
        const p5Roots: (number|[number, number])[] = [
            -0.009622595183693952,
            -0.0087140154710689,
            0.008731370519590633,
            0.009632666295509776
        ];
        expect(diffDepth1NumberArray(Polynomial.roots(p5), p5Roots)).to.be.false;

        const p9 = [20, 1002, -0.00012, 3, 2, -3317760285, 9.12, 656907, -0.00092, -32.516];
        // prettier-ignore
        const p9Roots: (number|[number, number])[] = [
            -0.009967763003189075,
            -0.00993180745192751,
            0.00993181603700817,
            0.009967757167070124,
            37.134805196608006,
            [-49.593817338259754, -20.179051037040917],
            [-49.593817338259754, 20.179051037040917],
            [5.976414738581268, -39.02002333475521],
            [5.976414738581268, 39.02002333475521]
        ];
        expect(diffDepth1NumberArray(Polynomial.roots(p9), p9Roots)).to.be.false;
    });
});
