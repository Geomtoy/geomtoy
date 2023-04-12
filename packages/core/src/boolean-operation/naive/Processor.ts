import { Angle, Coordinates, Float, Utility } from "@geomtoy/util";
import Arc from "../../geometries/basic/Arc";
import Bezier from "../../geometries/basic/Bezier";
import LineSegment from "../../geometries/basic/LineSegment";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { eps } from "../../geomtoy";
import FillRuleHelper from "../../helper/FillRuleHelper";
import { FillDescription, FillRule, GeneralGeometry } from "../../types";
import TrajectoryID from "../TrajectoryID";
import ChipSegment from "./ChipSegment";
import Intersector from "./Intersector";

export default class Processor {
    intersector = new Intersector();

    private _preprocess(gg: GeneralGeometry) {
        const segments = gg.getSegments(true, true);
        const ret: ChipSegment[] = [];
        for (const segment of segments) {
            if (segment instanceof LineSegment) {
                ret.push(...this._chipLineSegment(segment));
            }
            if (segment instanceof QuadraticBezier) {
                ret.push(...this._chipQuadraticBezier(segment));
            }
            if (segment instanceof Bezier) {
                ret.push(...this._chipBezier(segment));
            }
            if (segment instanceof Arc) {
                ret.push(...this._chipArc(segment));
            }
        }
        return ret;
    }

    private _chipLineSegment(lineSegment: LineSegment) {
        return [
            new ChipSegment({
                segment: lineSegment,
                trajectoryID: new TrajectoryID(lineSegment)
            })
        ];
    }
    private _chipQuadraticBezier(quadraticBezier: QuadraticBezier) {
        // handle degenerate
        const dg = quadraticBezier.degenerate(false);
        if (dg instanceof LineSegment) {
            return this._chipLineSegment(dg);
        }

        // handle double line
        if (quadraticBezier.isDoubleLine()) {
            const extrema = quadraticBezier
                .extrema()
                .filter(t => !Float.equalTo(t, 0, eps.timeEpsilon) && !Float.equalTo(t, 1, eps.timeEpsilon))
                .map(t => quadraticBezier.getParametricEquation()(t));
            let cs = [quadraticBezier.point1Coordinates, ...extrema, quadraticBezier.point2Coordinates];
            // Quadratic bezier sometimes goes very ugly, the control point coincides with one of the endpoints, and it is still a double line.
            // The extreme will be the coincident endpoint.
            cs = Utility.uniqWith(cs, (a, b) => Coordinates.equalTo(a, b, eps.epsilon));
            const chips = [];
            for (let i = 0, l = cs.length; i < l - 1; i++) {
                chips.push(...this._chipLineSegment(new LineSegment(cs[i], cs[i + 1])));
            }
            return chips;
        }
        return [
            new ChipSegment({
                segment: quadraticBezier,
                trajectoryID: new TrajectoryID(quadraticBezier)
            })
        ];
    }

    private _chipBezier(bezier: Bezier) {
        // handle degenerate
        const dg = bezier.degenerate(false);
        if (dg instanceof LineSegment) {
            return this._chipLineSegment(dg);
        }
        if (dg instanceof QuadraticBezier) {
            return this._chipQuadraticBezier(dg);
        }

        // handle bezier self-intersection
        const tsi = bezier.selfIntersection().filter(t => Float.between(t, 0, 1, true, true, eps.timeEpsilon));
        if (tsi.length !== 0) {
            const chips = bezier.splitAtTimes(tsi).map(bezier => {
                return new ChipSegment({
                    segment: bezier,
                    trajectoryID: new TrajectoryID(bezier)
                });
            });
            return chips;
        }
        // handle bezier triple line
        if (bezier.isTripleLine()) {
            const extrema = bezier
                .extrema()
                .filter(t => !Float.equalTo(t, 0, eps.timeEpsilon) && !Float.equalTo(t, 1, eps.timeEpsilon))
                .map(t => bezier.getParametricEquation()(t));
            let cs = [bezier.point1Coordinates, ...extrema, bezier.point2Coordinates];
            // Bezier sometimes goes very ugly, the control points coincide with one of the endpoints, and it is still a triple line.
            // The extreme will be the coincident endpoint.
            cs = Utility.uniqWith(cs, (a, b) => Coordinates.equalTo(a, b, eps.epsilon));
            const chips = [];
            for (let i = 0, l = cs.length; i < l - 1; i++) {
                chips.push(...this._chipLineSegment(new LineSegment(cs[i], cs[i + 1])));
            }
            return chips;
        }
        return [
            new ChipSegment({
                segment: bezier,
                trajectoryID: new TrajectoryID(bezier)
            })
        ];
    }
    private _chipArc(arc: Arc) {
        // handle degenerate
        const dg = arc.degenerate(false);
        if (dg instanceof LineSegment) {
            return this._chipLineSegment(dg);
        }
        return [
            new ChipSegment({
                segment: arc,
                trajectoryID: new TrajectoryID(arc)
            })
        ];
    }
    private static _helper: FillRuleHelper = new FillRuleHelper();
    private _determineFill(chipSegment: ChipSegment, chipSegments: ChipSegment[], fillRule: FillRule) {
        const ret = {
            positive: false,
            negative: false
        };

        if (fillRule === "nonzero") {
            const { positive: positiveWn, negative: negativeWn } = Processor._helper.windingNumbersOfSegment(chipSegment.segment, chipSegments);
            ret.positive = positiveWn !== 0;
            ret.negative = negativeWn !== 0;
        } else {
            const { positive: positiveCn, negative: negativeCn } = Processor._helper.crossingNumbersOfSegment(chipSegment.segment, chipSegments);
            ret.positive = positiveCn % 2 !== 0;
            ret.negative = negativeCn % 2 !== 0;
        }
        return ret;
    }

    private _sortCoordinates(c1: [number, number], c2: [number, number]) {
        const [x1, y1] = c1;
        const [x2, y2] = c2;
        if (x1 === x2) {
            return y1 < y2 ? [c1, c2] : [c2, c1];
        } else {
            return x1 < x2 ? [c1, c2] : [c2, c1];
        }
    }
    private _deduplicate(chips: ChipSegment[]) {
        return Utility.uniqWith(chips, (a, b) => {
            if (a.trajectoryID.equalTo(b.trajectoryID)) {
                const [acn, acm] = this._sortCoordinates(a.segment.point1Coordinates, a.segment.point2Coordinates);
                const [bcn, bcm] = this._sortCoordinates(b.segment.point1Coordinates, b.segment.point2Coordinates);
                return Coordinates.equalTo(acn, bcn, eps.epsilon) && Coordinates.equalTo(acm, bcm, eps.epsilon);
            }
            return false;
        });
    }

    private _express(chips: ChipSegment[], fillRule: FillRule) {
        // Step 1: Get all split params.
        for (let i = 0, m = chips.length - 1; i < m; i++) {
            const a = chips[i];
            for (let j = i + 1, n = chips.length; j < n; j++) {
                const b = chips[j];
                const { paramsA, paramsB } = this.intersector.result(a, b);
                a.params.push(...paramsA);
                b.params.push(...paramsB);
            }
        }

        let ret: ChipSegment[] = [];
        // Step 2: split and determine fill.
        chips.forEach(chip => {
            if (chip.params.length !== 0) {
                const params = Utility.uniqWith(chip.params, (a, b) => {
                    return chip.segment instanceof Arc ? Angle.equalTo(a, b, eps.angleEpsilon) : Float.equalTo(a, b, eps.timeEpsilon);
                });
                const portions = this.intersector.splitChipSegment(chip, params);
                portions.forEach(portion => {
                    portion.thisFill = this._determineFill(portion, chips, fillRule);
                    ret.push(portion);
                });
            } else {
                chip.thisFill = this._determineFill(chip, chips, fillRule);
                ret.push(chip);
            }
        });
        return ret;
    }
    private _combine(chipsA: ChipSegment[], expressedChipsA: ChipSegment[], fillRuleA: FillRule, chipsB: ChipSegment[], expressedChipsB: ChipSegment[], fillRuleB: FillRule) {
        for (let i = 0, m = expressedChipsA.length; i < m; i++) {
            const a = expressedChipsA[i];
            for (let j = 0, n = expressedChipsB.length; j < n; j++) {
                const b = expressedChipsB[j];
                const { paramsA, paramsB } = this.intersector.result(a, b);
                a.params.push(...paramsA);
                b.params.push(...paramsB);
            }
        }
        let ret: ChipSegment[] = [];
        expressedChipsA.forEach(chip => {
            if (chip.params.length !== 0) {
                const params = Utility.uniqWith(chip.params, (a, b) => {
                    return chip.segment instanceof Arc ? Angle.equalTo(a, b, eps.angleEpsilon) : Float.equalTo(a, b, eps.timeEpsilon);
                });
                const portions = this.intersector.splitChipSegment(chip, params);
                portions.forEach(portion => {
                    portion.thisFill = { ...chip.thisFill };
                    portion.thatFill = this._determineFill(portion, chipsB, fillRuleB);
                    ret.push(portion);
                });
            } else {
                chip.thatFill = this._determineFill(chip, chipsB, fillRuleB);
                ret.push(chip);
            }
        });

        expressedChipsB.forEach(chip => {
            if (chip.params.length !== 0) {
                const params = Utility.uniqWith(chip.params, (a, b) => {
                    return chip.segment instanceof Arc ? Angle.equalTo(a, b, eps.angleEpsilon) : Float.equalTo(a, b, eps.timeEpsilon);
                });
                const portions = this.intersector.splitChipSegment(chip, params);
                portions.forEach(portion => {
                    // swap the fill
                    portion.thatFill = { ...chip.thisFill };
                    portion.thisFill = this._determineFill(portion, chipsA, fillRuleA);
                    ret.push(portion);
                });
            } else {
                // swap the fill
                chip.thatFill = chip.thisFill;
                chip.thisFill = this._determineFill(chip, chipsA, fillRuleA);
                ret.push(chip);
            }
        });
        return ret;
    }

    describe(ggA: GeneralGeometry, ggB?: GeneralGeometry): FillDescription {
        const chipsA = this._preprocess(ggA);
        const expressedA = this._express(chipsA, ggA.fillRule);

        if (ggB === undefined) {
            return {
                fillRule: ggA.fillRule,
                segmentWithFills: this._deduplicate(expressedA)
            };
        }
        const chipsB = this._preprocess(ggB);
        const expressedB = this._express(chipsB, ggB.fillRule);
        const combined = this._combine(chipsA, expressedA, ggA.fillRule, chipsB, expressedB, ggB.fillRule);
        return {
            fillRule: ggA.fillRule,
            segmentWithFills: this._deduplicate(combined)
        };
    }
}
