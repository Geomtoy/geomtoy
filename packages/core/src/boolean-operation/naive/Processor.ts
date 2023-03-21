import { Angle, Coordinates, Maths, Utility } from "@geomtoy/util";
import Arc from "../../geometries/basic/Arc";
import Bezier from "../../geometries/basic/Bezier";
import LineSegment from "../../geometries/basic/LineSegment";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import Polygon from "../../geometries/general/Polygon";
import { eps } from "../../geomtoy";
import FillRuleHelper from "../../helper/FillRuleHelper";
import { FillDescription, FillRule, GeneralGeometry } from "../../types";
import TrajectoryId from "../TrajectoryId";
import ChipSegment from "./ChipSegment";
import { relationResult } from "./relation";

export default class Processor {
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
                trajectoryId: new TrajectoryId(lineSegment.id)
            })
        ];
    }
    private _chipQuadraticBezier(quadraticBezier: QuadraticBezier) {
        const dg = quadraticBezier.degenerate(false);
        if (dg instanceof LineSegment) {
            return this._chipLineSegment(dg);
        }

        // handle double line
        if (quadraticBezier.isDoubleLine()) {
            const extrema = quadraticBezier
                .extrema()
                .filter(([, t]) => Maths.between(t, 0, 1, true, true, eps.timeEpsilon))
                .map(([p]) => p);
            let points = [quadraticBezier.point1, ...extrema, quadraticBezier.point2];
            const chips = [];
            points = Utility.uniqWith(points, (a, b) => Coordinates.equalTo(a.coordinates, b.coordinates, eps.epsilon));
            for (let i = 0, l = points.length; i < l - 1; i++) {
                chips.push(...this._chipLineSegment(new LineSegment(points[i], points[i + 1])));
            }
            return chips;
        }
        return [
            new ChipSegment({
                segment: quadraticBezier,
                trajectoryId: new TrajectoryId(quadraticBezier.id)
            })
        ];
    }
    private _chipBezier(bezier: Bezier) {
        const dg = bezier.degenerate(false);
        if (dg instanceof LineSegment) {
            return this._chipLineSegment(dg);
        }
        if (dg instanceof QuadraticBezier) {
            return this._chipQuadraticBezier(dg);
        }

        // handle bezier self-intersection
        const tsi = bezier.selfIntersection().filter(t => Maths.between(t, 0, 1, true, true, eps.timeEpsilon));
        if (tsi.length !== 0) {
            const chips = bezier.splitAtTimes(tsi).map(bezier => {
                return new ChipSegment({ segment: bezier, trajectoryId: new TrajectoryId(bezier.id) });
            });
            return chips;
        }
        // handle bezier triple line
        if (bezier.isTripleLine()) {
            const extrema = bezier
                .extrema()
                .filter(([, t]) => Maths.between(t, 0, 1, true, true, eps.timeEpsilon))
                .map(([p]) => p);
            let points = [bezier.point1, ...extrema, bezier.point2];
            const chips = [];
            // bezier sometimes goes very ugly:
            // point1: [24.519000000000005, 124.63400000000001]
            // point2: [24.519000000000005, 124.63700000000001]
            // controlPoint1  [24.519000000000005,124.63700000000001]
            // controlPoint2   [24.519000000000005,124.63700000000001]
            points = Utility.uniqWith(points, (a, b) => Coordinates.equalTo(a.coordinates, b.coordinates, eps.epsilon));
            for (let i = 0, l = points.length; i < l - 1; i++) {
                chips.push(...this._chipLineSegment(new LineSegment(points[i], points[i + 1])));
            }
            return chips;
        }
        return [
            new ChipSegment({
                segment: bezier,
                trajectoryId: new TrajectoryId(bezier.id)
            })
        ];
    }
    private _chipArc(arc: Arc) {
        const dg = arc.degenerate(false);
        if (dg instanceof LineSegment) {
            return this._chipLineSegment(dg);
        }
        return [
            new ChipSegment({
                segment: arc,
                trajectoryId: new TrajectoryId(arc.id)
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
    private _splitChipSegment(chipSegment: ChipSegment, params: number[]) {
        const segment = chipSegment.segment;
        const segments = segment instanceof Arc ? segment.splitAtAngles(params) : segment.splitAtTimes(params);
        const chipSegments = segments.map(
            seg =>
                new ChipSegment({
                    segment: seg,
                    trajectoryId: chipSegment.trajectoryId
                })
        );
        return chipSegments;
    }

    private _express(gg: GeneralGeometry) {
        const chips = this._preprocess(gg);
        const isPolygon = gg instanceof Polygon;
        // Step 1: Get all portion params.
        for (let i = 0, m = chips.length - 1; i < m; i++) {
            const a = chips[i];
            // skip i + 1, if is polygon
            for (let j = isPolygon ? i + 2 : i + 1, n = chips.length; j < n; j++) {
                const b = chips[j];
                const { a: paramsA, b: paramsB } = relationResult(a, b);
                a.params.push(...paramsA);
                b.params.push(...paramsB);
            }
        }

        let ret: ChipSegment[] = [];
        // Step 2: portion and determine fill.
        chips.forEach(chip => {
            if (chip.params.length !== 0) {
                const params = Utility.uniqWith(chip.params, (a, b) => {
                    return chip.segment instanceof Arc ? Angle.equalTo(a, b, eps.angleEpsilon) : Maths.equalTo(a, b, eps.timeEpsilon);
                });
                const portions = this._splitChipSegment(chip, params);
                portions.forEach(portion => {
                    portion.thisFill = this._determineFill(portion, chips, gg.fillRule);
                    ret.push(portion);
                });
            } else {
                chip.thisFill = this._determineFill(chip, chips, gg.fillRule);
                ret.push(chip);
            }
        });
        // Step 3: deduplicate coincident chip segments.
        ret = Utility.uniqWith(ret, (a, b) => {
            if (a.trajectoryId.equalTo(b.trajectoryId)) {
                const [ac1, ac2] = [a.segment.point1Coordinates, a.segment.point2Coordinates];
                const [bc1, bc2] = [b.segment.point1Coordinates, b.segment.point2Coordinates];
                if (
                    (Coordinates.equalTo(ac1, bc1, eps.epsilon) && Coordinates.equalTo(ac2, bc2, eps.epsilon)) || // maybe different orientation
                    (Coordinates.equalTo(ac1, bc2, eps.epsilon) && Coordinates.equalTo(ac2, bc1, eps.epsilon))
                )
                    return true;
                return false;
            }
            return false;
        });

        return ret;
    }

    private _combine(chipsA: ChipSegment[], fillRuleA: FillRule, chipsB: ChipSegment[], fillRuleB: FillRule) {
        for (let i = 0, m = chipsA.length; i < m; i++) {
            const a = chipsA[i];
            for (let j = 0, n = chipsB.length; j < n; j++) {
                const b = chipsB[j];
                const { a: paramsA, b: paramsB } = relationResult(a, b);
                a.params.push(...paramsA);
                b.params.push(...paramsB);
            }
        }
        let ret: ChipSegment[] = [];
        chipsA.forEach(chip => {
            if (chip.params.length !== 0) {
                const params = Utility.uniqWith(chip.params, (a, b) => {
                    return chip.segment instanceof Arc ? Angle.equalTo(a, b, eps.angleEpsilon) : Maths.equalTo(a, b, eps.timeEpsilon);
                });
                const portions = this._splitChipSegment(chip, params);
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

        chipsB.forEach(chip => {
            if (chip.params.length !== 0) {
                const params = Utility.uniqWith(chip.params, (a, b) => {
                    return chip.segment instanceof Arc ? Angle.equalTo(a, b, eps.angleEpsilon) : Maths.equalTo(a, b, eps.timeEpsilon);
                });
                const portions = this._splitChipSegment(chip, params);
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

        // deduplicate coincident chip segments
        ret = Utility.uniqWith(ret, (a, b) => {
            if (a.trajectoryId.equalTo(b.trajectoryId)) {
                const [ac1, ac2] = [a.segment.point1Coordinates, a.segment.point2Coordinates];
                const [bc1, bc2] = [b.segment.point1Coordinates, b.segment.point2Coordinates];
                if (
                    (Coordinates.equalTo(ac1, bc1, eps.epsilon) && Coordinates.equalTo(ac2, bc2, eps.epsilon)) || // maybe different orientation
                    (Coordinates.equalTo(ac1, bc2, eps.epsilon) && Coordinates.equalTo(ac2, bc1, eps.epsilon))
                )
                    return true;
                return false;
            }
            return false;
        });

        return ret;
    }

    describe(ggA: GeneralGeometry, ggB?: GeneralGeometry): FillDescription {
        const chipsA = this._express(ggA);

        if (ggB === undefined) {
            return {
                fillRule: ggA.fillRule,
                segmentWithFills: chipsA
            };
        } else {
            const chipsB = this._express(ggB);
            const chips = this._combine(chipsA, ggA.fillRule, chipsB, ggB.fillRule);
            return {
                fillRule: ggA.fillRule,
                segmentWithFills: chips
            };
        }
    }
}
