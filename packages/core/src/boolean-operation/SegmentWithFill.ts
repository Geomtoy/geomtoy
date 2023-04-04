import { BasicSegment } from "../types";
import TrajectoryID from "./TrajectoryID";

export default class SegmentWithFill {
    thisFill = {
        positive: false,
        negative: false
    };
    thatFill = {
        positive: false,
        negative: false
    };

    constructor(
        public readonly segment: BasicSegment,
        // Record the coincident segment with common trajectory.
        // Then when chaining, they are considered to be on the same trajectory and can be combined if their fill are the same.
        // Note: segments that do not originate from the same origin can be on the same trajectory.
        public readonly trajectoryID: TrajectoryID
    ) {}

    superClone() {
        const ret = new SegmentWithFill(this.segment.clone(), this.trajectoryID.clone());
        ret.thisFill = { ...this.thisFill };
        ret.thatFill = { ...this.thatFill };
        return ret;
    }

    reverse() {
        this.segment.reverse();
        [this.thisFill.positive, this.thisFill.negative] = [this.thisFill.negative, this.thisFill.positive];
        [this.thatFill.positive, this.thatFill.negative] = [this.thatFill.negative, this.thatFill.positive];
    }
}
