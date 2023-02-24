import { BasicSegment } from "../../types";
import SegmentWithFill from "../SegmentWithFill";
import TrajectoryId from "../TrajectoryId";
import { compareX, compareY } from "./util";

// This like a segment data wile we do sweep line algorithm.
export default class MonoSegment extends SegmentWithFill {
    readonly isPrimary: boolean;
    // How to determine the winding?
    // The winding view through the sweep line, left(init)->right(term) is -1, left(term)<-right(init) is 1, vertical is 0

    // Under normal circumstances, `thisWinding` should be -1 or 1 or 0(if `isVertical` = true).
    // If the primary or secondary general geometry itself has coincident segments, it will be superimposed here.
    thisWinding: number = 0;
    // Also under normal circumstances, this value should be 0.
    // But we will discard the coincident segments when calculating relation, and the discarded segment may not belongs to the same general geometry,
    // then, at this time, current remaining segment needs to carry the winding of discarded segments.
    thatWinding: number = 0;
    // Record the splitting information: which segment this is splitted from.
    // The sweep line class will remember the relation-calculation of all the initial mono segment(the ancestor) to avoid repeated calculation.
    // In this way, the next time when encounter two segments, if their initial parent has relation-calculated, then we can skip.
    // Why? There can no longer be a relation between the children of two segments that have already been calculated.
    // This is "already done? - OK, skip"
    readonly parent: MonoSegment | null = null;
    // Record the birth information, the origin segment this from.
    // If we are relation-calculating two segments with the same origin, we can skip it directly and consider it has done.
    // Why? If all special cases have been handled, then there cannot be any relation between two segments originating from the same segment.
    // This is "needn't ? - mark done - already done? - OK, skip"
    readonly origin: BasicSegment;
    // Whether the segment is vertical.
    // The vertical segment is always line segment, because we are monotone.
    readonly isVertical: boolean;
    // Whether the enter coordinates = init coordinates or = term coordinates, (so is leave coordinates).
    readonly transposed: boolean;
    // The left coordinates to enter.
    readonly enterCoordinates: [number, number];
    // The right coordinates to leave.
    readonly leaveCoordinates: [number, number];

    get ancestorUuidList() {
        const ret: string[] = [];
        let curr: MonoSegment = this;
        ret.unshift(curr.segment.uuid); //unshift so the first element will be the most top parent, and it's more likely to have done some relation calculations.
        let parent = this.parent;
        while (parent !== null) {
            ret.unshift(parent.segment.uuid);
            parent = parent.parent;
        }
        return ret;
    }

    constructor({
        segment,
        isPrimary,
        origin,
        thisWinding,
        thatWinding,
        trajectoryId,
        parent
    }: {
        segment: BasicSegment;
        isPrimary: boolean;
        thisWinding?: number;
        thatWinding?: number;
        origin: BasicSegment;
        trajectoryId: TrajectoryId;
        parent?: MonoSegment;
    }) {
        super(segment, trajectoryId);

        this.isPrimary = isPrimary;
        thisWinding !== undefined && (this.thisWinding = thisWinding);
        thatWinding !== undefined && (this.thatWinding = thatWinding);
        this.origin = origin;
        parent !== undefined && (this.parent = parent);

        const { point1Coordinates: c1, point2Coordinates: c2 } = segment;
        const compX = compareX(c1, c2);
        const compY = compareY(c1, c2);

        if (compX === 0 && compY === 0) {
            throw new Error("[G]The `segment` is too tiny.");
        }

        if (compX === 0) {
            this.isVertical = true;
            // thisWinding === undefined && (this.thisWinding = 0);
            // sort the endpoint coordinates in left->right/bottom->top order
            // term
            //  ^
            //  |
            // init
            if (compY < 0) {
                this.enterCoordinates = c1;
                this.leaveCoordinates = c2;
                this.transposed = false;
                thisWinding === undefined && (this.thisWinding = 1);
            }
            // init
            //  ^
            //  |
            // term
            else {
                this.enterCoordinates = c2;
                this.leaveCoordinates = c1;
                this.transposed = true;
                thisWinding === undefined && (this.thisWinding = -1);
            }
        } else {
            this.isVertical = false;
            // sort the endpoint coordinates in left->right/bottom->top order
            // init->term
            if (compX < 0) {
                this.enterCoordinates = c1;
                this.leaveCoordinates = c2;
                this.transposed = false;
                thisWinding === undefined && (this.thisWinding = -1);
            }
            // term<-init
            else {
                this.enterCoordinates = c2;
                this.leaveCoordinates = c1;
                this.transposed = true;
                thisWinding === undefined && (this.thisWinding = 1);
            }
        }
    }

    override superClone() {
        const ret = new SegmentWithFill(this.segment.clone(), this.trajectoryId.clone());
        ret.thisFill = { ...this.thisFill };
        ret.thatFill = { ...this.thatFill };
        return ret;
    }
}
