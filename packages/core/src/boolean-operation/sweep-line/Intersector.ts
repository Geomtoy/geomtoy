import { Coordinates } from "@geomtoy/util";
import Arc from "../../geometries/basic/Arc";
import { eps } from "../../geomtoy";
import { calcIntersection } from "../common";
import MonoSegment from "./MonoSegment";

type IntersectorResult = {
    intersectionType: "proper" | "coincidental" | "none";
    // first element `null` remove, otherwise update, rest elements add,
    a?: [remove: null, ...add: MonoSegment[]] | [update: MonoSegment, ...add: MonoSegment[]] | [];
    // first element update, rest elements add.
    b?: [update: MonoSegment, ...add: MonoSegment[]] | [];
};

export default class Intersector {
    intersectionSet = new Set<string>();

    intersectionId(idA: string, idB: string) {
        return idA > idB ? idA + "-" + idB : idB + "-" + idA;
    }

    result(monoSegmentA: MonoSegment, monoSegmentB: MonoSegment): IntersectorResult {
        // If they are from the same origin, do nothing.
        if (monoSegmentA.origin === monoSegmentB.origin) {
            return { intersectionType: "none" };
        }

        // Check if their parents/or parents of parents... have already be intersection-calculated, this is very important.
        // Do this to avoid redundant calculation to speed up.
        const aList = monoSegmentA.ancestorIdList;
        const bList = monoSegmentB.ancestorIdList;
        for (const a of aList) {
            for (const b of bList) {
                if (this.intersectionSet.has(this.intersectionId(a, b))) return { intersectionType: "none" };
            }
        }

        const { intersectionType, paramsA, paramsB } = calcIntersection(monoSegmentA, monoSegmentB);
        this.intersectionSet.add(this.intersectionId(monoSegmentA.segment.id, monoSegmentB.segment.id));

        if (intersectionType === "coincidental") {
            return this.handleCoincidental(monoSegmentA, paramsA, monoSegmentB, paramsB);
        }
        if (intersectionType === "proper") {
            return this.handleProper(monoSegmentA, paramsA, monoSegmentB, paramsB);
        }
        return { intersectionType: "none" };
    }

    handleProper(monoSegmentA: MonoSegment, paramsA: number[], monoSegmentB: MonoSegment, paramsB: number[]): IntersectorResult {
        if (paramsA.length === 0 && paramsB.length !== 0) {
            const splitMsb = this.splitMonoSegment(monoSegmentB, paramsB);
            return {
                intersectionType: "proper",
                a: [],
                b: splitMsb as [MonoSegment, ...MonoSegment[]]
            };
        }
        if (paramsA.length !== 0 && paramsB.length === 0) {
            const splitMsa = this.splitMonoSegment(monoSegmentA, paramsA);
            return {
                intersectionType: "proper",
                a: splitMsa as [MonoSegment, ...MonoSegment[]],
                b: []
            };
        }
        if (paramsA.length !== 0 && paramsB.length !== 0) {
            const splitMsa = this.splitMonoSegment(monoSegmentA, paramsA);
            const splitMsb = this.splitMonoSegment(monoSegmentB, paramsB);
            return {
                intersectionType: "proper",
                a: splitMsa as [MonoSegment, ...MonoSegment[]],
                b: splitMsb as [MonoSegment, ...MonoSegment[]]
            };
        }
        throw new Error("[G]Impossible.");
    }

    handleCoincidental(monoSegmentA: MonoSegment, paramsA: number[], monoSegmentB: MonoSegment, paramsB: number[]): IntersectorResult {
        // There are six situations:
        // monoSegmentA--curr:a, monoSegmentB-above/below:b
        // 1. ba--------a--------------------b
        // 2. ba----------------------------ba
        // 3. ba--------b--------------------a
        // 4. b---------a-------a------------b
        // 5. b---------a-------------------ba
        // 6. b---------a-------b------------a

        // for s1, s2, s3, we must remove a, because b is on the status, we do not want to mess the status.
        // for s4, s5, s6, we must remove a, because current sweep x is at the enterCoordinates of a, also the leaveCoordinates
        // of the first portion of b. "Leave event happens first", so we need let the first portion of b to leave.

        // s1 && s5
        if (paramsA.length === 0 && paramsB.length === 1) {
            const splitMsb = this.splitMonoSegment(monoSegmentB, paramsB);
            // s1
            if (Coordinates.equalTo(splitMsb[0].enterCoordinates, monoSegmentA.enterCoordinates, eps.epsilon)) {
                this.transferWinding(monoSegmentA, splitMsb[0]);
            }
            //s5
            if (Coordinates.equalTo(splitMsb[1].leaveCoordinates, monoSegmentA.leaveCoordinates, eps.epsilon)) {
                this.transferWinding(monoSegmentA, splitMsb[1]);
            }
            return {
                intersectionType: "coincidental",
                a: [null],
                b: splitMsb as [MonoSegment, ...MonoSegment[]]
            };
        }
        // s2
        if (paramsA.length === 0 && paramsB.length === 0) {
            this.transferWinding(monoSegmentA, monoSegmentB);
            return {
                intersectionType: "coincidental",
                a: [null],
                b: []
            };
        }
        // s3
        if (paramsA.length === 1 && paramsB.length === 0) {
            const splitMsa = this.splitMonoSegment(monoSegmentA, paramsA);
            this.transferWinding(splitMsa[0], monoSegmentB);
            return {
                intersectionType: "coincidental",
                a: [null, splitMsa[1]],
                b: []
            };
        }
        // s4
        if (paramsA.length === 0 && paramsB.length === 2) {
            const splitMsb = this.splitMonoSegment(monoSegmentB, paramsB);
            this.transferWinding(monoSegmentA, splitMsb[1]);
            return {
                intersectionType: "coincidental",
                a: [null],
                b: splitMsb as [MonoSegment, ...MonoSegment[]]
            };
        }
        // s6
        if (paramsA.length === 1 && paramsB.length === 1) {
            const splitMsa = this.splitMonoSegment(monoSegmentA, paramsA);
            const splitMsb = this.splitMonoSegment(monoSegmentB, paramsB);
            this.transferWinding(splitMsa[0], splitMsb[1]);
            return {
                intersectionType: "coincidental",
                a: [null, splitMsa[1]],
                b: splitMsb as [MonoSegment, ...MonoSegment[]]
            };
        }
        throw new Error("[G]Impossible.");
    }

    splitMonoSegment(monoSegment: MonoSegment, params: number[]) {
        const segments = monoSegment.segment instanceof Arc ? monoSegment.segment.splitAtAngles(params) : monoSegment.segment.splitAtTimes(params);
        const monoSegments = segments.map(
            segment =>
                new MonoSegment({
                    segment,
                    trajectoryID: monoSegment.trajectoryID,
                    isPrimary: monoSegment.isPrimary,
                    origin: monoSegment.origin,

                    parent: monoSegment,
                    thisWinding: monoSegment.thisWinding,
                    thatWinding: monoSegment.thatWinding,
                    transposed: monoSegment.transposed,
                    isVertical: monoSegment.isVertical
                })
        );
        // reverse the order only, not the segments, the segments will handle the coordinates order themselves.
        monoSegment.transposed && monoSegments.reverse();
        return monoSegments;
    }

    transferWinding(src: MonoSegment, dst: MonoSegment) {
        if (src.isPrimary === dst.isPrimary) {
            // they are from the same general geometry
            dst.thisWinding += src.thisWinding;
            dst.thatWinding += src.thatWinding;
        } else {
            // they are NOT from the same general geometry
            dst.thisWinding += src.thatWinding;
            dst.thatWinding += src.thisWinding;
        }
    }
}
