import FillRuleHelper from "../helper/FillRuleHelper";

import Arc from "../geometries/basic/Arc";
import Bezier from "../geometries/basic/Bezier";
import LineSegment from "../geometries/basic/LineSegment";
import QuadraticBezier from "../geometries/basic/QuadraticBezier";
import type { FillRule } from "../types";

export default class SegmentFillAnnotation {
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
    annotate(segments: (LineSegment | Arc | Bezier | QuadraticBezier)[] | { segment: LineSegment | Arc | Bezier | QuadraticBezier }[], fillRule: FillRule) {
        if (this.portionParams.length > 0) {
            throw new Error(`[G]You need to portion \`segment\`.`);
        }
        const ret = {
            positive: false,
            negative: false
        };

        if (fillRule === "nonzero") {
            const { positive: positiveWn, negative: negativeWn } = SegmentFillAnnotation._helper.windingNumbersOfSegment(this.segment, segments);
            ret.positive = positiveWn !== 0;
            ret.negative = negativeWn !== 0;
        } else {
            const { positive: positiveCn, negative: negativeCn } = SegmentFillAnnotation._helper.crossingNumbersOfSegment(this.segment, segments);
            ret.positive = positiveCn % 2 !== 0;
            ret.negative = negativeCn % 2 !== 0;
        }
        return ret;
    }
    clone() {
        const ret = new SegmentFillAnnotation(this.segment.clone());
        ret.thisFill = { ...this.thisFill };
        ret.thatFill = { ...this.thatFill };
        return ret;
    }
}
