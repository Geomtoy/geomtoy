import { BasicSegment } from "../../types";
import SegmentWithFill from "../SegmentWithFill";
import TrajectoryId from "../TrajectoryId";

export default class ChipSegment extends SegmentWithFill {
    params: number[] = [];

    constructor({ segment, trajectoryId }: { segment: BasicSegment; trajectoryId: TrajectoryId }) {
        super(segment, trajectoryId);
    }
    override superClone() {
        const ret = new SegmentWithFill(this.segment.clone(), this.trajectoryId.clone());
        ret.thisFill = { ...this.thisFill };
        ret.thatFill = { ...this.thatFill };
        return ret;
    }
}
