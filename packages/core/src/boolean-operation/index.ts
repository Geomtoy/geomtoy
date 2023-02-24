import BaseObject from "../base/BaseObject";
import Compound from "../geometries/general/Compound";
import { type FillDescription, type GeneralGeometry } from "../types";
import Chainer from "./Chainer";
import NaiveProcessor from "./naive/Processor";
import Selector from "./Selector";
import SweepLineProcessor from "./sweep-line/Processor";

export default class BooleanOperation extends BaseObject {
    private _processor;
    private _selector = new Selector();
    private _chainer = new Chainer();

    constructor(strategy: "naive" | "sweep-line" = "sweep-line") {
        super();
        this._processor = strategy === "naive" ? new NaiveProcessor() : new SweepLineProcessor();
    }

    describe(ggA: GeneralGeometry, ggB?: GeneralGeometry) {
        return this._processor.describe(ggA, ggB);
    }

    selectSelfUnion(desc: FillDescription) {
        return this._selector.selfUnion(desc);
    }
    selectUnion(desc: FillDescription) {
        return this._selector.union(desc);
    }
    selectIntersection(desc: FillDescription) {
        return this._selector.intersection(desc);
    }
    selectDifference(desc: FillDescription) {
        return this._selector.difference(desc);
    }
    selectDifferenceRev(desc: FillDescription) {
        return this._selector.differenceRev(desc);
    }
    selectExclusion(desc: FillDescription) {
        return this._selector.exclusion(desc);
    }

    chain(desc: FillDescription): Compound {
        return this._chainer.chain(desc);
    }

    private _operate(ggA: GeneralGeometry, ggB: GeneralGeometry, methodName: "selectUnion" | "selectIntersection" | "selectDifference" | "selectDifferenceRev" | "selectExclusion") {
        const desc = this.describe(ggA, ggB);
        const selected = this[methodName].call(this, desc);
        return this._chainer.chain(selected);
    }
    selfUnion(gg: GeneralGeometry) {
        const desc = this.describe(gg);
        const selected = this.selectSelfUnion(desc);
        return this._chainer.chain(selected);
    }
    union(ggA: GeneralGeometry, ggB: GeneralGeometry) {
        return this._operate(ggA, ggB, "selectUnion");
    }
    intersection(ggA: GeneralGeometry, ggB: GeneralGeometry) {
        return this._operate(ggA, ggB, "selectIntersection");
    }
    difference(ggA: GeneralGeometry, ggB: GeneralGeometry) {
        return this._operate(ggA, ggB, "selectDifference");
    }
    differenceRev(ggA: GeneralGeometry, ggB: GeneralGeometry) {
        return this._operate(ggA, ggB, "selectDifferenceRev");
    }
    exclusion(ggA: GeneralGeometry, ggB: GeneralGeometry) {
        return this._operate(ggA, ggB, "selectExclusion");
    }
}
