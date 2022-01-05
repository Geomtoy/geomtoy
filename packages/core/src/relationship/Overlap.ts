import LineSegment from "../shapes/basic/LineSegment";

import type { OwnerCarrier } from "../types";

class Overlap {
    static verb = "Overlaps" as const;

    static lineSegmentOverlapLineSegment(this: OwnerCarrier, lineSegment: LineSegment, otherLineSegment: LineSegment) {}
}

export default Overlap;
