import { BasicSegment } from "../../types";
import SegmentWithFill from "../SegmentWithFill";
import TrajectoryID from "../TrajectoryID";
import { compareX, compareY } from "./util";

// This like a segment data while we do sweep line algorithm.
export default class MonoSegment extends SegmentWithFill {
    readonly isPrimary: boolean;

    /**
     *              y positive
     *              ^
     *              |
     *     init-----|---->term   winding -1
     *              |
     *     term<----|-----init   winding 1
     *              |
     *  ------------|----------->  x positive
     */
    // Under normal circumstances, `thisWinding` should be -1 or 1.
    // If the primary or secondary general geometry itself has coincident segments, it will be superimposed here.
    thisWinding: number = 0;
    // Also under normal circumstances, this value should be -1 or 1.
    // But we will discard the coincident segments when calculating intersection, and the discarded segment may not belongs to the same general geometry,
    // then, at this time, current remaining segment needs to carry the winding of discarded segments.
    thatWinding: number = 0;

    // Record the splitting information: which segment this is splitted from.
    // The sweep line class will remember the intersection-calculation of all the initial mono segment(the ancestor) to avoid repeated calculation.
    // In this way, the next time when encounter two segments, if their initial parent has intersection-calculated, then we can skip.
    // Why? There can no longer be a intersection between the children of two segments that have already been calculated.
    // This is "already done? - OK, skip"
    readonly parent: MonoSegment | null = null;
    // Record the birth information, the origin segment this from.
    // If we are intersection-calculating two segments with the same origin, we can skip it directly and consider it has done.
    // Why? If all special cases have been handled, then there cannot be any intersection between two segments originating from the same segment.
    // This is "needn't ? - mark done - already done? - OK, skip"
    readonly origin: BasicSegment;
    // Whether the segment is vertical.
    // The vertical segment is always line segment, because we are monotone.
    readonly isVertical: boolean;
    // Whether the enter coordinates = init coordinates or = term coordinates, (so is leave coordinates).
    readonly transposed: boolean;
    // The left(or bottom if isVertical) coordinates to enter.
    readonly enterCoordinates: [number, number];
    // The right(or top if is isVertical) coordinates to leave.
    readonly leaveCoordinates: [number, number];

    get ancestorIdList() {
        const ret: string[] = [];
        let iter: MonoSegment | null = this;
        while (iter !== null) {
            //unshift so the first element will be the most top parent, and it's more likely to have done some intersection calculations.
            ret.unshift(iter.segment.id);
            iter = iter.parent;
        }
        return ret;
    }

    constructor({
        segment,
        trajectoryID,
        isPrimary,
        origin,

        parent,
        thisWinding,
        thatWinding,
        transposed,
        isVertical
    }: {
        segment: BasicSegment;
        trajectoryID: TrajectoryID;
        isPrimary: boolean;
        origin: BasicSegment;

        parent?: MonoSegment;
        thisWinding?: number;
        thatWinding?: number;
        transposed?: boolean;
        isVertical?: boolean;
    }) {
        super(segment, trajectoryID);
        this.isPrimary = isPrimary;
        this.origin = origin;

        if (parent !== undefined) {
            this.parent = parent;
            this.thisWinding = thisWinding!;
            this.thatWinding = thatWinding!;
            this.transposed = transposed!;
            this.isVertical = isVertical!;
            const { point1Coordinates: c1, point2Coordinates: c2 } = segment;
            this.enterCoordinates = transposed ? c2 : c1;
            this.leaveCoordinates = transposed ? c1 : c2;
        } else {
            const { point1Coordinates: c1, point2Coordinates: c2 } = segment;
            const compX = compareX(c1, c2);
            const compY = compareY(c1, c2);

            if (compX === 0 && compY === 0) throw new Error("[G]The `segment` is too tiny.");

            if (compX === 0) {
                this.isVertical = true;
                // sort the endpoint coordinates in bottom->top order
                // term
                //  ↑
                // init
                if (compY < 0) (this.transposed = false), (this.thisWinding = 1);
                // init
                //  ↓
                // term
                else (this.transposed = true), (this.thisWinding = -1);
            } else {
                this.isVertical = false;
                // sort the endpoint coordinates in left->right order
                // init → term
                if (compX < 0) (this.transposed = false), (this.thisWinding = -1);
                // term ← init
                else (this.transposed = true), (this.thisWinding = 1);
            }
            this.enterCoordinates = this.transposed ? c2 : c1;
            this.leaveCoordinates = this.transposed ? c1 : c2;
        }
    }
}
