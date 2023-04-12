import { DISABLE_STATE_SYMBOL } from "../misc/decor-stated";
import { BasicSegment } from "../types";
import TrajectoryId from "./TrajectoryId";

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
        // Then when chaining, they are considered to be on the same trajectory and can be merged if their fill are the same.
        // Note: segments that do not originate from the same origin can be on the same trajectory.
        public trajectoryId: TrajectoryId
    ) {
        // disable the event handling, it's not necessary.
        segment.mute();
        // skip validation, it' not necessary.
        segment.skipValidation = true;
        // disable state, it's not necessary.
        segment[DISABLE_STATE_SYMBOL] = true;
    }

    superClone() {
        const ret = new SegmentWithFill(this.segment.clone(), this.trajectoryId);
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
