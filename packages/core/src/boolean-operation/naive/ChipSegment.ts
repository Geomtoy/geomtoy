import { BasicSegment } from "../../types";
import SegmentWithFill from "../SegmentWithFill";
import TrajectoryId from "../TrajectoryId";

export default class ChipSegment extends SegmentWithFill {
    params: number[] = [];

    constructor({ segment, trajectoryId }: { segment: BasicSegment; trajectoryId: TrajectoryId }) {
        super(segment, trajectoryId);
    }
}
