import { Coordinates, Utility } from "../src";

const expect = chai.expect;

describe("Utility", () => {
    it("sortBy - with coordinates", () => {
        const cs = [
            [1, 2],
            [4, 1],
            [1, 3],
            [2, -1],
            [0, 0]
        ] as [number, number][];
        Utility.sortBy(cs, [Coordinates.x, Coordinates.y]);
        expect(cs).to.deep.equal([
            [0, 0],
            [1, 2],
            [1, 3],
            [2, -1],
            [4, 1]
        ]);
    });
});
