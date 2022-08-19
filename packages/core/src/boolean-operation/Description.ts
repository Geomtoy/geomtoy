import type SegmentFillAnnotator from "../helper/SegmentFillAnnotator";
import type { FillRule } from "../types";

export default class Description {
    constructor(public fillRule: FillRule, public annotators: SegmentFillAnnotator[] = []) {}

    clone() {
        const ret = new Description(this.fillRule);
        ret.annotators = [...this.annotators];
        return ret;
    }
}
