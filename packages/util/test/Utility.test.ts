import { Utility } from "../src";

const expect = chai.expect;

describe("Utility", () => {
    it("orderBy - with number", () => {
        const cs = [4, 3, 1, 2, 9, 10, 0, -1];
        Utility.sort(cs);
        expect(cs).to.deep.equal([-1, 0, 1, 2, 3, 4, 9, 10]);
    });

    it("sort - with coordinates", () => {
        const cs = [
            [1, 2],
            [4, 1],
            [1, 3],
            [2, -1],
            [0, 0]
        ];
        Utility.sort(cs, [c => c[0], c => c[1]]);
        expect(cs).to.deep.equal([
            [0, 0],
            [1, 2],
            [1, 3],
            [2, -1],
            [4, 1]
        ]);
    });
});
