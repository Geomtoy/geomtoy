import { Maths, Utility } from "@geomtoy/util";
import Path from "../geometries/advanced/Path";
import Polygon from "../geometries/advanced/Polygon";
import Arc from "../geometries/basic/Arc";
import Bezier from "../geometries/basic/Bezier";
import LineSegment from "../geometries/basic/LineSegment";
import QuadraticBezier from "../geometries/basic/QuadraticBezier";
import { optioner } from "../geomtoy";
import SegmentFillAnnotator from "../helper/SegmentFillAnnotator";
import Description from "./Description";
import SegmentPortioner from "./SegmentPortioner";

export default class SegmentProcessor {
    private _portioner: SegmentPortioner = new SegmentPortioner();

    public describe(advancedGeometry: Polygon | Path) {
        const epsilon = optioner.options.epsilon;
        const originalDesc = new Description(
            advancedGeometry.fillRule,
            advancedGeometry.getSegments(true, true).map(segment => new SegmentFillAnnotator(segment))
        );

        // handle special cases
        for (let i = 0, l = originalDesc.annotators.length; i < l; i++) {
            const sfa = originalDesc.annotators[i];
            if (sfa.segment instanceof Bezier) {
                // handle bezier self-intersection
                const tsi = sfa.segment.selfIntersection();
                if (tsi.length !== 0) {
                    const beziers = sfa.segment.splitAtTimes(tsi);
                    const [head, ...tail] = beziers;
                    sfa.segment = head;
                    tail.forEach(bezier => originalDesc.annotators.push(new SegmentFillAnnotator(bezier)));
                    continue;
                }
                // handle bezier triple lines
                if (sfa.segment.isTripleLines()) {
                    const points = [sfa.segment.point1, ...sfa.segment.extrema().map(([p]) => p), sfa.segment.point2];
                    const lineSegments = points.reduce((acc, _, index) => {
                        if (points[index - 1] !== undefined) acc.push(new LineSegment(points[index - 1], points[index]));
                        return acc;
                    }, [] as LineSegment[]);
                    const [head, ...tail] = lineSegments;
                    sfa.segment = head;
                    tail.forEach(lineSegment => originalDesc.annotators.push(new SegmentFillAnnotator(lineSegment)));
                    continue;
                }
                // handle bezier degeneration(dimensional degeneration is handled by calling `getSegments(true, true)`)
                sfa.segment = sfa.segment.nonDimensionallyDegenerate();
            }
            if (sfa.segment instanceof QuadraticBezier) {
                // handle quadratic bezier double lines
                if (sfa.segment.isDoubleLines()) {
                    const points = [sfa.segment.point1, ...sfa.segment.extrema().map(([p]) => p), sfa.segment.point2];
                    const lineSegments = points.reduce((acc, _, index) => {
                        if (points[index - 1] !== undefined) acc.push(new LineSegment(points[index - 1], points[index]));
                        return acc;
                    }, [] as LineSegment[]);
                    const [head, ...tail] = lineSegments;
                    sfa.segment = head;
                    tail.forEach(lineSegment => originalDesc.annotators.push(new SegmentFillAnnotator(lineSegment)));
                    continue;
                }
                // handle quadratic bezier degeneration(dimensional degeneration is handled by calling `getSegments(true, true)`)
                sfa.segment = sfa.segment.nonDimensionallyDegenerate();
            }
        }

        console.time("params");
        // Step 1: Get all portion params.
        for (let i = 0, m = originalDesc.annotators.length - 1; i < m; i++) {
            const a = originalDesc.annotators[i];
            for (let j = i + 1, n = originalDesc.annotators.length; j < n; j++) {
                const b = originalDesc.annotators[j]; // todo we can skip i + 1, if is polygon

                const { aParams, bParams } = this._portioner.portion(a.segment, b.segment);

                a.portionParams.push(...aParams);
                b.portionParams.push(...bParams);
            }
        }
        console.timeEnd("params");

        console.time("portion");
        // Step 2: portion.
        const portionedDesc = new Description(originalDesc.fillRule);
        originalDesc.annotators.forEach(sfa => {
            if (sfa.portionParams.length !== 0) {
                const portionParams = Utility.uniqWith(sfa.portionParams, (a, b) => Maths.equalTo(a, b, epsilon));
                const portions = sfa.segment instanceof Arc ? sfa.segment.splitAtAngles(portionParams) : sfa.segment.splitAtTimes(portionParams);
                portions
                    .map(portion => new SegmentFillAnnotator(portion))
                    .forEach(pfa => {
                        pfa.annotateThis(originalDesc.annotators, originalDesc.fillRule);
                        portionedDesc.annotators.push(pfa);
                    });
            } else {
                sfa.annotateThis(originalDesc.annotators, originalDesc.fillRule);
                portionedDesc.annotators.push(sfa);
            }
        });
        console.timeEnd("portion");
        return portionedDesc;
    }

    public combine(descriptionA: Description, descriptionB: Description) {
        const epsilon = optioner.options.epsilon;

        for (let i = 0, m = descriptionA.annotators.length; i < m; i++) {
            const a = descriptionA.annotators[i];
            for (let j = 0, n = descriptionB.annotators.length; j < n; j++) {
                const b = descriptionB.annotators[j];
                const { aParams, bParams } = this._portioner.portion(a.segment, b.segment);
                a.portionParams.push(...aParams);
                b.portionParams.push(...bParams);
            }
        }

        // Remember: descriptionA is the subject(the primary geometry)
        //           descriptionB is the clip(the secondary geometry)
        // All operation is in the view of A.

        const fillRule = descriptionA.fillRule;
        const combinedDesc = new Description(fillRule);

        descriptionA.annotators.forEach(sfa => {
            if (sfa.portionParams.length !== 0) {
                const portionParams = Utility.uniqWith(sfa.portionParams, (a, b) => Maths.equalTo(a, b, epsilon));
                const portions = sfa.segment instanceof Arc ? sfa.segment.splitAtAngles(portionParams) : sfa.segment.splitAtTimes(portionParams);
                portions
                    .map(portion => {
                        const ret = new SegmentFillAnnotator(portion);
                        ret.thisFill = { ...sfa.thisFill };
                        return ret;
                    })
                    .forEach(pfa => {
                        pfa.annotateThat(descriptionB.annotators, descriptionB.fillRule);
                        combinedDesc.annotators.push(pfa);
                    });
            } else {
                const copy = new SegmentFillAnnotator(sfa.segment);
                copy.thisFill = { ...sfa.thisFill };
                copy.annotateThat(descriptionB.annotators, descriptionB.fillRule);
                combinedDesc.annotators.push(copy);
            }
        });

        descriptionB.annotators.forEach(sfa => {
            if (sfa.portionParams.length !== 0) {
                const portionParams = Utility.uniqWith(sfa.portionParams!, (a, b) => Maths.equalTo(a, b, epsilon));
                const portions = sfa.segment instanceof Arc ? sfa.segment.splitAtAngles(portionParams) : sfa.segment.splitAtTimes(portionParams);
                portions
                    .map(portion => {
                        const ret = new SegmentFillAnnotator(portion);
                        // swap the fill
                        ret.thatFill = { ...sfa.thisFill };
                        return ret;
                    })
                    .forEach(pfa => {
                        pfa.annotateThis(descriptionA.annotators, descriptionA.fillRule);
                        combinedDesc.annotators.push(pfa);
                    });
            } else {
                const copy = new SegmentFillAnnotator(sfa.segment);
                // swap the fill
                copy.thatFill = { ...sfa.thisFill };
                copy.annotateThis(descriptionA.annotators, descriptionA.fillRule);
                combinedDesc.annotators.push(copy);
            }
        });
        return combinedDesc;
    }
}
