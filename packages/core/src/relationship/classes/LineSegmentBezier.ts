import { Box, Maths } from "@geomtoy/util";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import Bezier from "../../geometries/basic/Bezier";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import BaseRelationship from "../BaseRelationship";
import LineBezier from "./LineBezier";
import LineSegmentLineSegment from "./LineSegmentLineSegment";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import LineSegmentQuadraticBezier from "./LineSegmentQuadraticBezier";
import { optioner } from "../../geomtoy";

export default class LineSegmentBezier extends BaseRelationship {
    constructor(public geometry1: LineSegment, public geometry2: Bezier) {
        super();
        const dg1 = geometry1.dimensionallyDegenerate();
        const dg2 = geometry2.dimensionallyDegenerate();

        if (dg1 || dg2) {
            this.degeneration.relationship = null;
            return this;
        }
        const ndg2 = geometry2.nonDimensionallyDegenerate();
        if (ndg2 instanceof QuadraticBezier) {
            this.degeneration.relationship = new LineSegmentQuadraticBezier(geometry1, ndg2);
            return this;
        }
        if (ndg2 instanceof LineSegment) {
            this.degeneration.relationship = new LineSegmentLineSegment(geometry1, ndg2);
            return this;
        }
        this.supRelationship = new LineBezier(geometry1.toLine(), geometry2);
    }

    supRelationship?: LineBezier;

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        t1: number; // time of `c` on `lineSegment`
        t2: number; // time of `c` on `quadraticBezier`
        m: number; // multiplicity
    }[] {
        if (!Box.collide(this.geometry1.getBoundingBox(), this.geometry2.getBoundingBox())) return [];
        const intersection = this.supRelationship?.intersection() ?? [];
        const epsilon = optioner.options.epsilon;
        return intersection
            .map(i => {
                return { ...i, t1: this.geometry1.getTimeOfPointExtend(i.c) };
            })
            .filter(i => Maths.between(i.t1, 0, 1, false, false, epsilon));
    }

    // no equal
    @superPreprocess("handleDegeneration")
    separate() {
        return this.intersection().length === 0;
    }

    // no contain
    // no containedBy

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
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => i.m % 2 === 1 && Maths.between(i.t1, 0, 1, true, true, epsilon) && Maths.between(i.t2, 0, 1, true, true, epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => i.m % 2 === 0 && Maths.between(i.t1, 0, 1, true, true, epsilon) && Maths.between(i.t2, 0, 1, true, true, epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => (Maths.equalTo(i.t2, 0, epsilon) || Maths.equalTo(i.t2, 1, epsilon)) && !(Maths.equalTo(i.t1, 0, epsilon) || Maths.equalTo(i.t1, 1, epsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => (Maths.equalTo(i.t1, 0, epsilon) || Maths.equalTo(i.t1, 1, epsilon)) && !(Maths.equalTo(i.t2, 0, epsilon) || Maths.equalTo(i.t2, 1, epsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    connect() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => (Maths.equalTo(i.t1, 0, epsilon) || Maths.equalTo(i.t1, 1, epsilon)) && (Maths.equalTo(i.t2, 0, epsilon) || Maths.equalTo(i.t2, 1, epsilon)))
            .map(i => new Point(i.c));
    }
    // no coincide
}
