import BaseObject from "../base/BaseObject";
import Compound from "../collection/Compound";
import Path from "../geometries/advanced/Path";
import Polygon from "../geometries/advanced/Polygon";
import Description from "./Description";
import SegmentChainer from "./SegmentChainer";
import SegmentProcessor from "./SegmentProcessor";
import SegmentSelector from "./SegmentSelector";

export default class BooleanOperation extends BaseObject {
    private _processor = new SegmentProcessor();
    private _selector = new SegmentSelector();
    private _chainer = new SegmentChainer();

    describe(advancedGeometry: Polygon | Path) {
        return this._processor.describe(advancedGeometry);
    }
    combine(descriptionA: Description, descriptionB: Description) {
        return this._processor.combine(descriptionA, descriptionB);
    }
    selectSelfUnion(description: Description) {
        return this._selector.selfUnion(description);
    }
    selectUnion(description: Description) {
        return this._selector.union(description);
    }
    selectIntersection(description: Description) {
        return this._selector.intersection(description);
    }
    selectDifference(description: Description) {
        return this._selector.difference(description);
    }
    selectDifferenceRev(description: Description) {
        return this._selector.differenceRev(description);
    }
    selectExclusion(description: Description) {
        return this._selector.exclusion(description);
    }
    chain(description: Description): Compound {
        return this._chainer.chain(description);
    }
    selfUnion(advancedGeometry: Polygon | Path) {
        const desc = this.describe(advancedGeometry);
        const selected = this.selectSelfUnion(desc);
        return this._chainer.chain(selected);
    }
    private _operate(
        advancedGeometry1: Polygon | Path,
        advancedGeometry2: Polygon | Path,
        methodName: "selectUnion" | "selectIntersection" | "selectDifference" | "selectDifferenceRev" | "selectExclusion"
    ) {
        const desc1 = this.describe(advancedGeometry1);
        const desc2 = this.describe(advancedGeometry2);
        const combined = this.combine(desc1, desc2);
        const selected = this[methodName].call(this, combined);
        return this._chainer.chain(selected);
    }
    union(advancedGeometry1: Polygon | Path, advancedGeometry2: Polygon | Path) {
        return this._operate(advancedGeometry1, advancedGeometry2, "selectUnion");
    }
    intersect(advancedGeometry1: Polygon | Path, advancedGeometry2: Polygon | Path) {
        return this._operate(advancedGeometry1, advancedGeometry2, "selectIntersection");
    }
    difference(advancedGeometry1: Polygon | Path, advancedGeometry2: Polygon | Path) {
        return this._operate(advancedGeometry1, advancedGeometry2, "selectDifference");
    }
    differenceRev(advancedGeometry1: Polygon | Path, advancedGeometry2: Polygon | Path) {
        return this._operate(advancedGeometry1, advancedGeometry2, "selectDifferenceRev");
    }
    exclusion(advancedGeometry1: Polygon | Path, advancedGeometry2: Polygon | Path) {
        return this._operate(advancedGeometry1, advancedGeometry2, "selectExclusion");
    }

    toString(): string {
        throw new Error("Method not implemented.");
    }
    toArray(): any[] {
        throw new Error("Method not implemented.");
    }
    toObject(): object {
        throw new Error("Method not implemented.");
    }
}
