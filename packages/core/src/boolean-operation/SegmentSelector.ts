import { type FillDescription } from "../types";

export default class SegmentSelector {
    private _select(description: FillDescription, selection: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number]) {
        const retDesc: FillDescription = {
            fillRule: description.fillRule,
            annotations: []
        };
        description.annotations.forEach(sfa => {
            let index = 0;
            index += sfa.thisFill.positive ? 8 : 0;
            index += sfa.thisFill.negative ? 4 : 0;
            index += sfa.thatFill.positive ? 2 : 0;
            index += sfa.thatFill.negative ? 1 : 0;
            if (selection[index] !== 0) {
                // We must have a deep copy here, or will mess up the combined description.
                // This is the fill description of the boolean operation result geometry, so `thatFill` is gone, and `thisFill` will be set according to the operation.
                const copy = sfa.clone();
                copy.thisFill.positive = selection[index] === 1;
                copy.thisFill.negative = selection[index] === -1;
                copy.thatFill.positive = false;
                copy.thatFill.negative = false;
                retDesc.annotations.push(copy);
            }
        });
        return retDesc;
    }
    selfUnion(description: FillDescription) {
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

    union(description: FillDescription) {
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
    intersection(description: FillDescription) {
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
    difference(description: FillDescription) {
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
    differenceRev(description: FillDescription) {
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
    exclusion(description: FillDescription) {
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
