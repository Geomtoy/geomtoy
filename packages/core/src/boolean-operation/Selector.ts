import { type FillDescription } from "../types";

export default class Selector {
    private _select(description: FillDescription, selection: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number]) {
        const retDesc: FillDescription = {
            fillRule: description.fillRule,
            segmentWithFills: []
        };
        description.segmentWithFills.forEach(sf => {
            let index = 0;
            index += sf.thisFill.positive ? 8 : 0;
            index += sf.thisFill.negative ? 4 : 0;
            index += sf.thatFill.positive ? 2 : 0;
            index += sf.thatFill.negative ? 1 : 0;
            if (selection[index] !== 0) {
                // We must have a deep copy here, or will mess up during the next chaining stage.
                // This is the fill description of the boolean operation result geometry, so `thatFill` is gone, and `thisFill` will be set according to the operation.
                const copy = sf.superClone();
                copy.thisFill.positive = selection[index] === 1;
                copy.thisFill.negative = selection[index] === -1;
                copy.thatFill.positive = false;
                copy.thatFill.negative = false;
                retDesc.segmentWithFills.push(copy);
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
    differenceReverse(description: FillDescription) {
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
