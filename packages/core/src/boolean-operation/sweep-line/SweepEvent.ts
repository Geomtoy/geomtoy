import { Coordinates, Maths } from "@geomtoy/util";
import { eps } from "../../geomtoy";
import Transformation from "../../transformation";
import { BasicSegment } from "../../types";
import { LinkedListNode } from "./LinkedList";
import MonoSegment from "./MonoSegment";
import { compareX, compareY, derivativeValueAtEnd } from "./util";

const ROTATION_FOR_INF_DERIVATIVE = Maths.PI / 4;

/**
 * What to do when the first derivative start to be infinity:
 * 1. According to the sign of the first infinity derivative, determine whether the segment is curving up or down at `this.coordinates`.
 * 2. Assuming a rotation performing on the segments. Since the rotation does not change the relative relationship between segments, but
 * it allows us to calculate the derivatives without encountering infinity.
 * - If the segment is curving up with first derivative being positive infinity, then rotate the mono segment `-ROTATION`.
 * - If the segment is curving down with first derivative being negative infinity, then rotate the mono segment `ROTATION`.
 * @param segment
 * @param sign
 * @param origin
 */
function rotateSegment(segment: BasicSegment, sign: number, origin: [number, number]) {
    let t = new Transformation();
    if (sign > 0) {
        t.setRotate(-ROTATION_FOR_INF_DERIVATIVE, origin);
    } else {
        t.setRotate(ROTATION_FOR_INF_DERIVATIVE, origin);
    }
    return segment.apply(t);
}

export default class SweepEvent {
    // the `LinkedListNode` wrap outside this sweep event, reverse reference, only existed on leave event
    status?: LinkedListNode<SweepEvent>;

    constructor(
        // the mono segment this sweep event belongs to
        public mono: MonoSegment,
        // is the coordinates of this sweep event, the enter coordinates of the mono segment?
        // if `true`, this sweep event is the enter event of the mono segment
        // if `false`, this sweep event is the leave event of the mono segment
        public readonly isEnter: boolean,
        // the other event of this sweep event, for the enter event, it's its leave event, for the leave event, it's its enter event
        public otherEvent: SweepEvent
    ) {}

    private _derivativeInfo: {
        first: number; //the fist derivative value of `y` respect to `x` of this.mono.segment, could be ±infinity
        // If the first derivative is already ±infinity, and it is still impossible to draw a conclusion,
        // we need a higher derivative to compare, but since the first derivative is already infinity,
        // directly calculating the higher derivatives will still get infinity, and cannot be compared.
        // So we rotate the segment so that its second derivative starts to be calculated on the rotated segment.
        rotatedSegment: undefined | BasicSegment;
        second: number; //the second derivative value of `y` respect to `x` of this.mono.segment
        rotatedSecond: number; // the second derivative value of `y` respect to `x` of rotatedSegment
        third: number; //the third derivative value of `y` respect to `x` of this.mono.segment
        rotatedThird: number; // the third derivative value of `y` respect to `x` of rotatedSegment
    } = {
        first: NaN,
        rotatedSegment: undefined,
        second: NaN,
        rotatedSecond: NaN,
        third: NaN,
        rotatedThird: NaN
    };

    get segment() {
        return this.mono.segment;
    }
    // the coordinates of this sweep event
    get coordinates() {
        return this.isEnter ? this.mono.enterCoordinates : this.mono.leaveCoordinates;
    }
    get isInit() {
        return this.isEnter !== this.mono.transposed;
    }

    private _resetDerivativeInfo() {
        this._derivativeInfo.first = NaN;
        this._derivativeInfo.rotatedSegment = undefined;
        this._derivativeInfo.second = NaN;
        this._derivativeInfo.rotatedSecond = NaN;
        this._derivativeInfo.third = NaN;
        this._derivativeInfo.rotatedThird = NaN;
    }

    update(mono: MonoSegment) {
        if (this.isEnter) {
            if (!Coordinates.equalTo(this.mono.enterCoordinates, mono.enterCoordinates, eps.epsilon)) this._resetDerivativeInfo();
        } else {
            if (!Coordinates.equalTo(this.mono.leaveCoordinates, mono.leaveCoordinates, eps.epsilon)) this._resetDerivativeInfo();
        }
        this.mono = mono;
    }

    private _getDerivativeValue(n: 1 | 2 | 3) {
        if (n === 1) {
            if (Number.isNaN(this._derivativeInfo.first)) {
                const value = derivativeValueAtEnd(this.mono.segment, this.isInit, 1);
                // Change the sign of first derivative for infinity, if transposed.
                if (!Number.isFinite(value)) {
                    this._derivativeInfo.first = (this.mono.transposed ? -1 : 1) * value;
                } else {
                    this._derivativeInfo.first = value;
                }
            }
            return this._derivativeInfo.first;
        }
        if (n === 2) {
            if (Number.isFinite(this._derivativeInfo.first)) {
                if (Number.isNaN(this._derivativeInfo.second)) this._derivativeInfo.second = derivativeValueAtEnd(this.mono.segment, this.isInit, 2);
                return this._derivativeInfo.second;
            } else {
                if (this._derivativeInfo.rotatedSegment === undefined) {
                    this._derivativeInfo.rotatedSegment = rotateSegment(this.mono.segment, Maths.sign(this._derivativeInfo.first), this.coordinates);
                }
                if (Number.isNaN(this._derivativeInfo.rotatedSecond)) this._derivativeInfo.rotatedSecond = derivativeValueAtEnd(this._derivativeInfo.rotatedSegment!, this.isInit, 2);
                return this._derivativeInfo.rotatedSecond;
            }
        }
        if (n === 3) {
            if (Number.isFinite(this._derivativeInfo.first)) {
                if (Number.isNaN(this._derivativeInfo.third)) this._derivativeInfo.third = derivativeValueAtEnd(this.mono.segment, this.isInit, 3);
                return this._derivativeInfo.third;
            } else {
                // this._derivativeInfo.rotatedSegment !== undefined, we must have done it.
                if (Number.isNaN(this._derivativeInfo.rotatedThird)) this._derivativeInfo.rotatedThird = derivativeValueAtEnd(this._derivativeInfo.rotatedSegment!, this.isInit, 3);
                return this._derivativeInfo.rotatedThird;
            }
        }
        throw new Error("[G]Impossible.");
    }
    /**
     * Whether the coordinates of `this` smaller than `that`.
     * @description
     * Smaller coordinates means with less x coordinate, if x equal then less y coordinate.
     * Sweep events with smaller x-coordinate, then with smaller y-coordinate have higher priority.
     * @param that
     */
    compareCoordinates(that: SweepEvent) {
        let comp = compareX(this.coordinates, that.coordinates);
        if (comp === 0) comp = compareY(this.coordinates, that.coordinates);
        return comp;
    }

    compareDerivativeValues(that: SweepEvent) {
        const thisFDV = this._getDerivativeValue(1);
        const thatFDV = that._getDerivativeValue(1);
        if (!Maths.equalTo(thisFDV, thatFDV, eps.epsilon)) {
            const result = thisFDV > thatFDV ? 1 : -1;
            // For enter coordinates, the greater derivative means upper location,
            // but for the leave coordinates, the greater derivative means lower location.
            return this.isEnter ? result : -result;
        }

        const thisSDV = this._getDerivativeValue(2);
        const thatSDV = that._getDerivativeValue(2);
        if (!Maths.equalTo(thisSDV, thatSDV, eps.epsilon)) {
            const result = thisSDV > thatSDV ? 1 : -1;
            return this.isEnter ? result : -result;
        }

        const thisTDV = this._getDerivativeValue(3);
        const thatTDV = that._getDerivativeValue(3);
        if (!Maths.equalTo(thisTDV, thatTDV, eps.epsilon)) {
            const result = thisTDV > thatTDV ? 1 : -1;
            return this.isEnter ? result : -result;
        }
        return 0;
    }

    /**
     * The main purpose of this method is to determine the sequence of events,
     * This order of events is very important for the sweep line algorithm.
     * - Basically, events with smaller coordinates (first x, then y) happen first.
     * - If two different typed(enter or leave) events have the same coordinates, the leave event happens first.
     * - If two events have the same coordinates and their event types are the same, then the derivative is needed to determine exactly who is above and who is below,
     *   and the below one happens first.
     *
     * Why does this order matter?
     * Because this order determines the processing of events - the order of intersecting.
     * The sweep line algorithm is from x-infi to x+infi, and at each x from y-infi to y+infi, finding the intersection and splitting process.
     *
     * @param e1
     * @param e2
     */
    static compare(e1: SweepEvent, e2: SweepEvent) {
        // for a mono, its enter event happen first
        if (e1.mono === e2.mono) return e1.isEnter ? -1 : 1;
        // now different monos
        const comp1 = e1.compareCoordinates(e2);
        // smaller coordinates event happen first
        if (comp1 !== 0) return comp1;
        // now they have the same coordinates
        // leave event happens first
        if (e1.isEnter !== e2.isEnter) return e1.isEnter ? 1 : -1;
        // now they are at the same coordinates with the same type (enter or leave)
        const comp2 = e1.compareDerivativeValues(e2);
        return comp2;
    }
}
