import Point from "../src/geomtoy/Point"
import Segment from "../src/geomtoy/Segment"



test("isParallelTo", () => {
    const seg1 = new Segment(new Point(0, 1), new Point(1, 2)),
        seg2 = new Segment(new Point(1, 1), new Point(2, 2)),
        seg3 = new Segment(new Point(1, 2), new Point(2, 5))
    expect(seg1.isParallelTo(seg2)).toBe(true)
    expect(seg1.isParallelTo(seg3)).toBe(false)
})

test("isPerpendicularTo", () => {
    const seg1 = new Segment(new Point(0, 1), new Point(1, 2)),
        seg2 = new Segment(new Point(-1, 1), new Point(0, 0)),
        seg3 = new Segment(new Point(1, 2), new Point(2, 5))
    expect(seg1.isPerpendicularTo(seg2)).toBe(true)
    expect(seg1.isPerpendicularTo(seg3)).toBe(false)
})

test("isSameAs", () => {
    const seg1 = new Segment(new Point(0, 1), new Point(1, 2)),
        seg2 = new Segment(new Point(0, 1), new Point(1, 2)),
        seg3 = new Segment(new Point(-1, 1), new Point(0, 0))
    expect(seg1.isSameAs(seg2)).toBe(true)
    expect(seg1.isSameAs(seg3)).toBe(false)
})
