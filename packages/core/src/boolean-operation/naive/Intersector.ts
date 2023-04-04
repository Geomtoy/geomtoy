import Arc from "../../geometries/basic/Arc";
import { calcIntersection } from "../common";
import ChipSegment from "./ChipSegment";

export default class Intersector {
    result(chipSegmentA: ChipSegment, chipSegmentB: ChipSegment) {
        return calcIntersection(chipSegmentA, chipSegmentB);
    }

    splitChipSegment(chipSegment: ChipSegment, params: number[]) {
        const segments = chipSegment.segment instanceof Arc ? chipSegment.segment.splitAtAngles(params) : chipSegment.segment.splitAtTimes(params);
        const chipSegments = segments.map(
            segment =>
                new ChipSegment({
                    segment,
                    trajectoryID: chipSegment.trajectoryID
                })
        );
        return chipSegments;
    }
}
