import { Box, Maths } from "@geomtoy/util";
import BaseRelationship from "../BaseRelationship";
import LineSegment from "../../geometries/basic/LineSegment";
import Polygon from "../../geometries/advanced/Polygon";
import Point from "../../geometries/basic/Point";
import { cached } from "../../misc/decor-cache";
import LineSegmentLineSegment from "./LineSegmentLineSegment";
import { optioner } from "../../geomtoy";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import { next, prev } from "../../misc/loop";
import EndpointIntersection from "../../helper/EndpointIntersection";

export default class PolygonPolygon extends BaseRelationship {
    constructor(public geometry1: Polygon, public geometry2: Polygon) {
        super();
        const dg1 = geometry1.dimensionallyDegenerate();
        const dg2 = geometry2.dimensionallyDegenerate();
        if (dg1 || dg2) {
            this.degeneration.relationship = null;
            return this;
        }
        this.segments1 = this.geometry1.getSegments(true);
        this.segments2 = this.geometry2.getSegments(true);

        this.vertexCoordinates1 = this.geometry1.vertices.map(vtx => [vtx.x, vtx.y]);
        this.vertexCoordinates2 = this.geometry2.vertices.map(vtx => [vtx.x, vtx.y]);
        this.subRelationships = [];
        this.segments1.forEach((seg1, index1) => {
            this.segments2.forEach((seg2, index2) => {
                this.subRelationships.push({
                    relationship: new LineSegmentLineSegment(seg1, seg2),
                    index1,
                    index2
                });
            });
        });
    }
    vertexCoordinates1!: [number, number][];
    vertexCoordinates2!: [number, number][];
    segments1!: LineSegment[];
    segments2!: LineSegment[];
    subRelationships!: {
        relationship: LineSegmentLineSegment;
        index1: number;
        index2: number;
    }[];

    intersection(): {
        c: [number, number];
        t1: number;
        t2: number;
    }[] {
        return this.subRelationships.reduce((acc, sub) => {
            acc.push(...sub.relationship.intersection());
            return acc;
        }, [] as ReturnType<typeof this.intersection>);
    }

    @cached
    boundingBoxCollide() {
        const b1 = this.geometry1.getBoundingBox();
        const b2 = this.geometry2.getBoundingBox();
        const epsilon = optioner.options.epsilon;
        return Box.collide(b1, b2, epsilon);
    }
    /* 
    The `fillRule` is different, even if the segments are exactly the same(This judgment based on the doubly circular linked list,which itself has complexity), 
    the result may be different. 
    The `fillRule` is the same, even if the segment is different,
    the result can be the same.
    Because of the complexity, so give up on this
    */
    //no equal
    @superPreprocess("handleDegeneration")
    separate(): Trilean {
        if (!this.boundingBoxCollide()) return true;

        if (!this.geometry1.closed && !this.geometry1.closed) {
            if (this.subRelationships.some(sub => !sub.relationship.separate())) return false;
            return true;
        }
        if (!this.geometry1.closed && this.geometry2.closed) {
            if (!this.vertexCoordinates1.every(c => this.geometry2.isPointOutside(c))) return false;
            if (this.subRelationships.some(sub => !sub.relationship.separate())) return false;
            return true;
        }
        if (this.geometry1.closed && !this.geometry2.closed) {
            if (!this.vertexCoordinates2.every(c => this.geometry1.isPointOutside(c))) return false;
            if (this.subRelationships.some(sub => !sub.relationship.separate())) return false;
            return true;
        }
        if (this.geometry1.closed && this.geometry2.closed) {
            if (!this.vertexCoordinates1.every(c => this.geometry2.isPointOutside(c))) return false;
            if (!this.vertexCoordinates2.every(c => this.geometry1.isPointOutside(c))) return false;
            if (this.subRelationships.some(sub => !sub.relationship.separate())) return false;
            return true;
        }
    }
    @superPreprocess("handleDegeneration")
    contain(): Trilean {
        if (!this.boundingBoxCollide()) return false;

        if (!this.geometry1.closed) return false;
        if (!this.vertexCoordinates2.every(c => this.geometry1.isPointInside(c))) return false;
        if (this.subRelationships.some(sub => sub.relationship.intersect().length !== 0)) return false;
        return true;
    }
    @superPreprocess("handleDegeneration")
    containedBy(): Trilean {
        if (!this.boundingBoxCollide()) return false;

        if (!this.geometry2.closed) return false;
        if (!this.vertexCoordinates1.every(c => this.geometry2.isPointInside(c))) return false;
        if (this.subRelationships.some(sub => sub.relationship.intersect().length !== 0)) return false;
        return true;
    }

    @superPreprocess("handleDegeneration")
    intersect() {
        return this.uniqCoordinates_(
            this.subRelationships.reduce((acc, sub) => {
                acc.push(...sub.relationship.intersection().map(i => i.c));
                return acc;
            }, [] as [number, number][])
        ).map(c => new Point(c));
    }

    @cached
    private _mixPredicate() {
        const epsilon = optioner.options.epsilon;
        const ei = new EndpointIntersection();
        const commonStrike: [number, number][] = [];
        const endpointStrike: [number, number][] = [];
        const endpointContact: [number, number][] = [];
        const commonCross: [number, number][] = [];
        const endpointCross: [number, number][] = [];
        const endpointTouch: [number, number][] = [];

        this.subRelationships.forEach(sub => {
            sub.relationship.intersection().forEach(i => {
                const t1Is0 = Maths.equalTo(i.t1, 0, epsilon);
                const t1Is1 = Maths.equalTo(i.t1, 1, epsilon);
                const t2Is0 = Maths.equalTo(i.t2, 0, epsilon);
                const t2Is1 = Maths.equalTo(i.t2, 1, epsilon);

                // Continuous vertex:
                // If closed = true, then all vertices are continuous vertices.
                // If closed = false, then the vertices `initOfHead` and `termOfTail` are discontinuous vertices(and the endpoint of polygon)
                // even if they overlap.

                // The case where we do vertex determination is:
                // The intersection should be at the continuous vertex of at least one of the two.

                // not intersected at vertex
                if (!t1Is0 && !t1Is1 && !t2Is0 && !t2Is1) {
                    commonStrike.push(i.c);
                    commonCross.push(i.c);
                    return;
                }
                // else t1Is0 || t1Is1 || t2Is0 || t2Is1
                let aIn;
                let aOut;
                let bIn;
                let bOut;

                const prev1 = this.segments1[prev(sub.index1, this.segments1.length, this.geometry1.closed)];
                const prev2 = this.segments2[prev(sub.index2, this.segments2.length, this.geometry2.closed)];
                const next1 = this.segments1[next(sub.index1, this.segments1.length, this.geometry1.closed)];
                const next2 = this.segments2[next(sub.index2, this.segments2.length, this.geometry2.closed)];
                const curr1 = this.segments1[sub.index1];
                const curr2 = this.segments2[sub.index2];

                let auxiliary1 = false;
                let auxiliary2 = false;
                const atEnd1 = (t1Is0 && prev1 === undefined) || (t1Is1 && next1 === undefined);
                const atEnd2 = (t2Is0 && prev2 === undefined) || (t2Is1 && next2 === undefined);

                if (t1Is0) {
                    if (prev1 === undefined) {
                        if (atEnd2) {
                            commonStrike.push(i.c);
                            return;
                        }
                        auxiliary1 = true;
                        [aIn, aOut] = [curr1.portionOfExtend(-1, 0), curr1];
                    } else {
                        [aIn, aOut] = [prev1, curr1];
                    }
                } else if (t1Is1) {
                    if (next1 === undefined) {
                        if (atEnd2) {
                            commonStrike.push(i.c);
                            return;
                        }
                        auxiliary1 = true;
                        [aIn, aOut] = [curr1, curr1.portionOfExtend(1, 2)];
                    } else {
                        [aIn, aOut] = [curr1, next1];
                    }
                } else {
                    if (atEnd2) {
                        commonStrike.push(i.c);
                        return;
                    }
                    [aIn, aOut] = curr1.splitAtTime(i.t1);
                }

                if (t2Is0) {
                    if (prev2 === undefined) {
                        if (atEnd1) {
                            commonStrike.push(i.c);
                            return;
                        }
                        auxiliary2 = true;
                        [bIn, bOut] = [curr2.portionOfExtend(-1, 0), curr2];
                    } else {
                        [bIn, bOut] = [prev2, curr2];
                    }
                } else if (t2Is1) {
                    if (next2 === undefined) {
                        if (atEnd1) {
                            commonStrike.push(i.c);
                            return;
                        }
                        auxiliary2 = true;
                        [bIn, bOut] = [curr2, curr2.portionOfExtend(1, 2)];
                    } else {
                        [bIn, bOut] = [curr2, next2];
                    }
                } else {
                    if (atEnd1) {
                        commonStrike.push(i.c);
                        return;
                    }
                    [bIn, bOut] = curr2.splitAtTime(i.t2);
                }

                const det = ei.determine(i.c, aIn, aOut, bIn, bOut);
                if (det === "cross") {
                    endpointStrike.push(i.c);
                    if (!auxiliary1 && !auxiliary2) endpointCross.push(i.c);
                }
                if (det === "touch") {
                    endpointContact.push(i.c);
                    if (!auxiliary1 && !auxiliary2) endpointTouch.push(i.c);
                }
            });
        });
        return {
            strike: this.uniqCoordinates_([...commonStrike, ...endpointStrike]),
            contact: this.uniqCoordinates_(endpointContact),
            cross: this.uniqCoordinates_([...commonCross, ...endpointCross]),
            touch: this.uniqCoordinates_(endpointTouch)
        };
    }

    @superPreprocess("handleDegeneration")
    strike() {
        return this._mixPredicate().strike.map(c => new Point(c));
    }
    @superPreprocess("handleDegeneration")
    contact() {
        return this._mixPredicate().contact.map(c => new Point(c));
    }
    @superPreprocess("handleDegeneration")
    cross() {
        return this._mixPredicate().cross.map(c => new Point(c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        return this._mixPredicate().touch.map(c => new Point(c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        if (this.geometry2.closed) return [];
        const epsilon = optioner.options.epsilon;
        const firstSub = this.subRelationships[0];
        const lastSub = this.subRelationships[this.subRelationships.length - 1];
        const firstBlock = firstSub.relationship.intersection().reduce((acc, i) => {
            if (Maths.equalTo(i.t2, 0, epsilon) && !(Maths.equalTo(i.t1, 0, epsilon) || Maths.equalTo(i.t1, 1, epsilon))) acc.push(i.c);
            return acc;
        }, [] as [number, number][]);
        const lastBlock = lastSub.relationship.intersection().reduce((acc, i) => {
            if (Maths.equalTo(i.t2, 1, epsilon) && !(Maths.equalTo(i.t1, 0, epsilon) || Maths.equalTo(i.t1, 1, epsilon))) acc.push(i.c);
            return acc;
        }, [] as [number, number][]);
        return [...firstBlock, ...lastBlock].map(c => new Point(c));
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        if (this.geometry1.closed) return [];
        const epsilon = optioner.options.epsilon;
        const firstSub = this.subRelationships[0];
        const lastSub = this.subRelationships[this.subRelationships.length - 1];
        const firstBlockedBy = firstSub.relationship.intersection().reduce((acc, i) => {
            if (Maths.equalTo(i.t1, 0, epsilon) && !(Maths.equalTo(i.t2, 0, epsilon) || Maths.equalTo(i.t2, 1, epsilon))) acc.push(i.c);
            return acc;
        }, [] as [number, number][]);
        const lastBlockedBy = lastSub.relationship.intersection().reduce((acc, i) => {
            if (Maths.equalTo(i.t1, 1, epsilon) && !(Maths.equalTo(i.t2, 0, epsilon) || Maths.equalTo(i.t2, 1, epsilon))) acc.push(i.c);
            return acc;
        }, [] as [number, number][]);
        return [...firstBlockedBy, ...lastBlockedBy].map(c => new Point(c));
    }
    @superPreprocess("handleDegeneration")
    connect() {
        if (this.geometry1.closed || this.geometry2.closed) return [];
        const epsilon = optioner.options.epsilon;
        const firstSub = this.subRelationships[0];
        const lastSub = this.subRelationships[this.subRelationships.length - 1];
        const firstConnect = firstSub.relationship.intersection().reduce((acc, i) => {
            if (Maths.equalTo(i.t1, 0, epsilon) && Maths.equalTo(i.t2, 0, epsilon)) acc.push(i.c);
            return acc;
        }, [] as [number, number][]);
        const lastConnect = lastSub.relationship.intersection().reduce((acc, i) => {
            if (Maths.equalTo(i.t1, 1, epsilon) && Maths.equalTo(i.t2, 1, epsilon)) acc.push(i.c);
            return acc;
        }, [] as [number, number][]);
        return [...firstConnect, ...lastConnect].map(c => new Point(c));
    }
    @superPreprocess("handleDegeneration")
    coincide() {
        return this.subRelationships.reduce((acc, sub) => {
            acc.push(...sub.relationship.coincide());
            return acc;
        }, [] as (Point | LineSegment)[]);
    }
}
