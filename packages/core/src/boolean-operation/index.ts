import BaseObject from "../base/BaseObject";
import Compound from "../geometries/advanced/Compound";
import SegmentChainer from "./SegmentChainer";
import SegmentProcessor from "./SegmentProcessor";
import SegmentSelector from "./SegmentSelector";
import { type FillDescription, type AdvancedGeometry } from "../types";

export default class BooleanOperation extends BaseObject {
    private _processor = new SegmentProcessor();
    private _selector = new SegmentSelector();
    private _chainer = new SegmentChainer();

    describe(advancedGeometry: AdvancedGeometry) {
        return this._processor.describe(advancedGeometry);
    }
    combine(descriptionA: FillDescription, descriptionB: FillDescription) {
        return this._processor.combine(descriptionA, descriptionB);
    }
    selectSelfUnion(description: FillDescription) {
        return this._selector.selfUnion(description);
    }
    selectUnion(description: FillDescription) {
        return this._selector.union(description);
    }
    selectIntersection(description: FillDescription) {
        return this._selector.intersection(description);
    }
    selectDifference(description: FillDescription) {
        return this._selector.difference(description);
    }
    selectDifferenceRev(description: FillDescription) {
        return this._selector.differenceRev(description);
    }
    selectExclusion(description: FillDescription) {
        return this._selector.exclusion(description);
    }
    chain(description: FillDescription): Compound {
        return this._chainer.chain(description);
    }
    selfUnion(advancedGeometry: AdvancedGeometry) {
        const desc = this.describe(advancedGeometry);
        const selected = this.selectSelfUnion(desc);
        return this._chainer.chain(selected);
    }
    private _operate(
        advancedGeometry1: AdvancedGeometry,
        advancedGeometry2: AdvancedGeometry,
        methodName: "selectUnion" | "selectIntersection" | "selectDifference" | "selectDifferenceRev" | "selectExclusion"
    ) {
        const desc1 = this.describe(advancedGeometry1);
        const desc2 = this.describe(advancedGeometry2);
        const combined = this.combine(desc1, desc2);
        const selected = this[methodName].call(this, combined);
        return this._chainer.chain(selected);
    }
    union(advancedGeometry1: AdvancedGeometry, advancedGeometry2: AdvancedGeometry) {
        return this._operate(advancedGeometry1, advancedGeometry2, "selectUnion");
    }
    intersect(advancedGeometry1: AdvancedGeometry, advancedGeometry2: AdvancedGeometry) {
        return this._operate(advancedGeometry1, advancedGeometry2, "selectIntersection");
    }
    difference(advancedGeometry1: AdvancedGeometry, advancedGeometry2: AdvancedGeometry) {
        return this._operate(advancedGeometry1, advancedGeometry2, "selectDifference");
    }
    differenceRev(advancedGeometry1: AdvancedGeometry, advancedGeometry2: AdvancedGeometry) {
        return this._operate(advancedGeometry1, advancedGeometry2, "selectDifferenceRev");
    }
    exclusion(advancedGeometry1: AdvancedGeometry, advancedGeometry2: AdvancedGeometry) {
        return this._operate(advancedGeometry1, advancedGeometry2, "selectExclusion");
    }

    override toString() {
        return `${this.name}(${this.uuid})`;
    }
    override toArray() {
        return [];
    }
    override toObject() {
        return {};
    }
}
