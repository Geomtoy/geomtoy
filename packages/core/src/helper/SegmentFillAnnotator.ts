import FillRuleHelper from "./FillRuleHelper";

import Arc from "../geometries/basic/Arc";
import Bezier from "../geometries/basic/Bezier";
import LineSegment from "../geometries/basic/LineSegment";
import QuadraticBezier from "../geometries/basic/QuadraticBezier";
import type { FillRule } from "../types";

export default class SegmentFillAnnotator {
    thisFill = {
        positive: false,
        negative: false
    };
    thatFill = {
        positive: false,
        negative: false
    };

    private static _helper: FillRuleHelper = new FillRuleHelper();
    constructor(public segment: LineSegment | Bezier | QuadraticBezier | Arc, public portionParams: number[] = []) {}

    reverse() {
        this.segment.reverse();
        [this.thisFill.positive, this.thisFill.negative] = [this.thisFill.negative, this.thisFill.positive];
        [this.thatFill.positive, this.thatFill.negative] = [this.thatFill.negative, this.thatFill.positive];
    }

    annotateThis(segments: (LineSegment | Arc | Bezier | QuadraticBezier)[] | { segment: LineSegment | Arc | Bezier | QuadraticBezier }[], fillRule: FillRule) {
        this.thisFill = this.annotate(segments, fillRule);
        return this;
    }
    annotateThat(segments: (LineSegment | Arc | Bezier | QuadraticBezier)[] | { segment: LineSegment | Arc | Bezier | QuadraticBezier }[], fillRule: FillRule) {
        this.thatFill = this.annotate(segments, fillRule);
        return this;
    }
    // use in the segment is from original `advancedGeometry`, but in some other structure,
    // and use to
    // 1. check the fill of sub advanced geometry(segment coincident is gone).
    //      If the positive/negative fill of the segment in original `advancedGeometry` is different from the decomposed simple one:
    //      i.e. A sub polygon it self is positive winding. but the `positiveFilling` of a whatever segment of it is false. It means
    //      in original `advancedGeometry`, there is no fill in the positive direction of the segment, but sub polygon require fill in this
    //      direction, so, the sub polygon is a hole(the area should be subtracted.)
    // 2. check the fill of the segment, when do boolean operation(segment coincident is also gone).
    annotate(segments: (LineSegment | Arc | Bezier | QuadraticBezier)[] | { segment: LineSegment | Arc | Bezier | QuadraticBezier }[], fillRule: FillRule) {
        if (this.portionParams.length > 0) {
            throw new Error(`[G]You need to portion \`segment\`.`);
        }
        const ret = {
            positive: false,
            negative: false
        };

        if (fillRule === "nonzero") {
            const { positive: positiveWn, negative: negativeWn } = SegmentFillAnnotator._helper.windingNumbersOfSegment(this.segment, segments);
            ret.positive = positiveWn !== 0;
            ret.negative = negativeWn !== 0;
        } else {
            const { positive: positiveCn, negative: negativeCn } = SegmentFillAnnotator._helper.crossingNumbersOfSegment(this.segment, segments);
            ret.positive = positiveCn % 2 !== 0;
            ret.negative = negativeCn % 2 !== 0;
        }
        return ret;
    }
}
