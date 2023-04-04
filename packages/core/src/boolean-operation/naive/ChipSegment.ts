import { BasicSegment } from "../../types";
import SegmentWithFill from "../SegmentWithFill";
import TrajectoryID from "../TrajectoryID";

export default class ChipSegment extends SegmentWithFill {
    params: number[] = [];

    constructor({ segment, trajectoryID }: { segment: BasicSegment; trajectoryID: TrajectoryID }) {
        super(segment, trajectoryID);
    }
}
