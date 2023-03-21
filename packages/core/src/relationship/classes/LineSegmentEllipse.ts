import { Maths } from "@geomtoy/util";
import SealedGeometryArray from "../../collection/SealedGeometryArray";
import Ellipse from "../../geometries/basic/Ellipse";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseRelationship from "../BaseRelationship";
import LineEllipse from "./LineEllipse";

export default class LineSegmentEllipse extends BaseRelationship {
    constructor(public geometry1: LineSegment, public geometry2: Ellipse) {
        super();
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);
        if (dg1 instanceof Point || dg2 instanceof Point || dg2 instanceof SealedGeometryArray) {
            this.degeneration.relationship = null;
            return this;
        }

        this.supRelationship = new LineEllipse(geometry1.toLine(), geometry2);
    }
    supRelationship?: LineEllipse;

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        t1: number; // time of `c` on `lineSegment`
        a2: number; // angle of `c` on `ellipse`
        m: number; // multiplicity
    }[] {
        const intersection = this.supRelationship?.intersection() ?? [];
        return intersection
            .map(i => {
                return { ...i, t1: this.geometry1.getTimeOfPointExtend(i.c) };
            })
            .filter(i => Maths.between(i.t1, 0, 1, false, false, eps.timeEpsilon));
    }

    // no equal
    @superPreprocess("handleDegeneration")
    separate(): Trilean {
        if (!this.geometry2.isPointOutside(this.geometry1.point1Coordinates)) return false;
        if (!this.geometry2.isPointOutside(this.geometry1.point2Coordinates)) return false;
        if (this.intersection().length !== 0) return false;
        return true;
    }

    // no contain
    @superPreprocess("handleDegeneration")
    containedBy(): Trilean {
        if (!this.geometry2.isPointInside(this.geometry1.point1Coordinates)) return false;
        if (!this.geometry2.isPointInside(this.geometry1.point2Coordinates)) return false;
        if (this.intersection().length !== 0) return false;
        return true;
    }

    @superPreprocess("handleDegeneration")
    intersect() {
        return this.intersection().map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    strike() {
        return this.intersection()
            .filter(i => i.m % 2 === 1)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    contact() {
        return this.intersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    cross() {
        return this.intersection()
            .filter(i => i.m % 2 === 1 && Maths.between(i.t1, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        return this.intersection()
            .filter(i => i.m % 2 === 0 && Maths.between(i.t1, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    // no block
    @superPreprocess("handleDegeneration")
    blockedBy() {
        return this.intersection()
            .filter(i => Maths.equalTo(i.t1, 0, eps.timeEpsilon) || Maths.equalTo(i.t1, 1, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    // no connect
    // no coincide
}
