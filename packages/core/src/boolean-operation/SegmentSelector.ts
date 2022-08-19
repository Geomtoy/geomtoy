import SegmentFillAnnotator from "../helper/SegmentFillAnnotator";
import Description from "./Description";

export default class SegmentSelector {
    private _select(description: Description, selection: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number]) {
        const retDesc = new Description(description.fillRule);
        description.annotators.forEach(sfa => {
            let index = 0;
            index += sfa.thisFill.positive ? 8 : 0;
            index += sfa.thisFill.negative ? 4 : 0;
            index += sfa.thatFill.positive ? 2 : 0;
            index += sfa.thatFill.negative ? 1 : 0;
            if (selection[index] !== 0) {
                // copy the segment to the results, while also calculating the fill
                const copy = new SegmentFillAnnotator(sfa.segment);
                copy.thisFill.positive = selection[index] === 1;
                copy.thisFill.negative = selection[index] === -1;
                copy.thatFill.positive = false;
                copy.thatFill.negative = false;
                retDesc.annotators.push(copy);
            }
        });
        return retDesc;
    }
    selfUnion(description: Description) {
        //      this
        //   pos    neg       keep?               value
        //    0      0   =>   no                  0
        //    0      1   =>   yes filled neg     -1
        //    1      0   =>   yes filled pos      1
        //    1      1   =>   no                  0
        // prettier-ignore
        return this._select(description, [
            0,  0,  0,  0, 
           -1,  0,  0,  0, 
            1,  0,  0,  0, 
            0,  0,  0,  0
        ]);
    }

    union(description: Description) {
        //      this          that
        //   pos    neg    pos    neg       keep?               value
        //    0      0      0      0   =>   no                  0
        //    0      0      0      1   =>   yes filled neg     -1
        //    0      0      1      0   =>   yes filled pos      1
        //    0      0      1      1   =>   no                  0
        //    0      1      0      0   =>   yes filled neg     -1
        //    0      1      0      1   =>   yes filled neg     -1
        //    0      1      1      0   =>   no                  0
        //    0      1      1      1   =>   no                  0
        //    1      0      0      0   =>   yes filled pos      1
        //    1      0      0      1   =>   no                  0
        //    1      0      1      0   =>   yes filled pos      1
        //    1      0      1      1   =>   no                  0
        //    1      1      0      0   =>   no                  0
        //    1      1      0      1   =>   no                  0
        //    1      1      1      0   =>   no                  0
        //    1      1      1      1   =>   no                  0
        // prettier-ignore
        return this._select(description, [
            0, -1,  1,  0, 
           -1, -1,  0,  0, 
            1,  0,  1,  0, 
            0,  0,  0,  0
        ]);
    }
    intersection(description: Description) {
        //      this          that
        //   pos    neg    pos    neg       keep?               value
        //    0      0      0      0   =>   no                  0
        //    0      0      0      1   =>   no                  0
        //    0      0      1      0   =>   no                  0
        //    0      0      1      1   =>   no                  0
        //    0      1      0      0   =>   no                  0
        //    0      1      0      1   =>   yes filled neg     -1
        //    0      1      1      0   =>   no                  0
        //    0      1      1      1   =>   yes filled neg     -1
        //    1      0      0      0   =>   no                  0
        //    1      0      0      1   =>   no                  0
        //    1      0      1      0   =>   yes filled pos      1
        //    1      0      1      1   =>   yes filled pos      1
        //    1      1      0      0   =>   no                  0
        //    1      1      0      1   =>   yes filled neg     -1
        //    1      1      1      0   =>   yes filled pos      1
        //    1      1      1      1   =>   no                  0
        // prettier-ignore
        return this._select(description, [
            0,  0,  0,  0, 
            0, -1,  0, -1,
            0,  0,  1,  1, 
            0, -1,  1,  0
        ]);
    }
    difference(description: Description) {
        //      this          that
        //   pos    neg    pos    neg       keep?               value
        //    0      0      0      0   =>   no                  0
        //    0      0      0      1   =>   no                  0
        //    0      0      1      0   =>   no                  0
        //    0      0      1      1   =>   no                  0
        //    0      1      0      0   =>   yes filled neg     -1
        //    0      1      0      1   =>   no                  0
        //    0      1      1      0   =>   yes filled neg     -1
        //    0      1      1      1   =>   no                  0
        //    1      0      0      0   =>   yes filled pos      1
        //    1      0      0      1   =>   yes filled pos      1
        //    1      0      1      0   =>   no                  0
        //    1      0      1      1   =>   no                  0
        //    1      1      0      0   =>   no                  0
        //    1      1      0      1   =>   yes filled pos      1
        //    1      1      1      0   =>   yes filled neg     -1
        //    1      1      1      1   =>   no                  0
        // prettier-ignore
        return this._select(description, [
            0,  0,  0,  0, 
           -1,  0, -1,  0,
            1,  1,  0,  0, 
            0,  1, -1,  0
        ]);
    }
    differenceRev(description: Description) {
        //      this          that
        //   pos    neg    pos    neg       keep?               value
        //    0      0      0      0   =>   no                  0
        //    0      0      0      1   =>   yes filled neg     -1
        //    0      0      1      0   =>   yes filled pos      1
        //    0      0      1      1   =>   no                  0
        //    0      1      0      0   =>   no                  0
        //    0      1      0      1   =>   no                  0
        //    0      1      1      0   =>   yes filled pos      1
        //    0      1      1      1   =>   yes filled pos      1
        //    1      0      0      0   =>   no                  0
        //    1      0      0      1   =>   yes filled neg     -1
        //    1      0      1      0   =>   no                  0
        //    1      0      1      1   =>   yes filled neg     -1
        //    1      1      0      0   =>   no                  0
        //    1      1      0      1   =>   no                  0
        //    1      1      1      0   =>   no                  0
        //    1      1      1      1   =>   no                  0
        // prettier-ignore
        return this._select(description, [
            0, -1,  1,  0,
            0,  0,  1,  1, 
            0, -1,  0, -1, 
            0,  0,  0,  0
        ]);
    }
    exclusion(description: Description) {
        //      this          that
        //   pos    neg    pos    neg       keep?               value
        //    0      0      0      0   =>   no                  0
        //    0      0      0      1   =>   yes filled neg     -1
        //    0      0      1      0   =>   yes filled pos      1
        //    0      0      1      1   =>   no                  0
        //    0      1      0      0   =>   yes filled neg     -1
        //    0      1      0      1   =>   no                  0
        //    0      1      1      0   =>   no                  0
        //    0      1      1      1   =>   yes filled pos      1
        //    1      0      0      0   =>   yes filled pos      1
        //    1      0      0      1   =>   no                  0
        //    1      0      1      0   =>   no                  0
        //    1      0      1      1   =>   yes filled neg     -1
        //    1      1      0      0   =>   no                  0
        //    1      1      0      1   =>   yes filled pos      1
        //    1      1      1      0   =>   yes filled neg     -1
        //    1      1      1      1   =>   no                  0
        // prettier-ignore
        return this._select(description, [
            0, -1,  1,  0,
           -1,  0,  0,  1,
            1,  0,  0, -1,
            0,  1, -1,  0
        ]);
    }
}
