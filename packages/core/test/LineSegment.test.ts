import LineSegment from "../src/geometries/basic/LineSegment";

const expect = chai.expect;
describe("LineSegment", () => {
    const seg1 = new LineSegment([0, 1], [1, 2]);
    const seg2 = new LineSegment([1, 1], [2, 2]);
    const seg3 = new LineSegment([1, 2], [2, 5]);
    it("isParallelToLineSegment", () => {
        expect(seg1.isParallelToLineSegment(seg2)).to.be.true;
        expect(seg1.isParallelToLineSegment(seg3)).to.be.false;
    });
    it("isPerpendicularTo", () => {
        const seg1 = new LineSegment([0, 1], [1, 2]);
        const seg2 = new LineSegment([-1, 1], [0, 0]);
        const seg3 = new LineSegment([1, 2], [2, 5]);
        expect(seg1.isPerpendicularToLineSegment(seg2)).to.be.true;
        expect(seg1.isPerpendicularToLineSegment(seg3)).to.be.false;
    });
});
