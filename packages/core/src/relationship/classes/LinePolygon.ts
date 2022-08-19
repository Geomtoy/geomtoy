import { Coordinates, Maths, Utility, Vector2 } from "@geomtoy/util";
import Polygon from "../../geometries/advanced/Polygon";
import Line from "../../geometries/basic/Line";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import LineLineSegment from "./LineLineSegment";
import BaseRelationship from "../BaseRelationship";
import { optioner } from "../../geomtoy";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import { next, prev } from "../../misc/loop";
import EndpointIntersection from "../../helper/EndpointIntersection";

export default class LinePolygon extends BaseRelationship {
    constructor(public geometry1: Line, public geometry2: Polygon) {
        super();
        const dg2 = geometry2.dimensionallyDegenerate();
        if (dg2) {
            this.degeneration.relationship = null;
            return this;
        }

        this.segments2 = geometry2.getSegments(true);
        this.segments2.forEach((seg, index) => {
            this.subRelationships.push({
                relationship: new LineLineSegment(geometry1, seg),
                index2: index
            });
        });
    }

    segments2!: LineSegment[];
    subRelationships!: {
        relationship: LineLineSegment;
        index2: number;
    }[];

    // no equal
    @superPreprocess("handleDegeneration")
    separate(): Trilean {
        return this.subRelationships.every(sub => sub.relationship.separate());
    }

    // no contain
    // no containedBy

    @superPreprocess("handleDegeneration")
    intersect() {
        return this.uniqCoordinates_(
            this.subRelationships.reduce((acc, sub) => {
                acc.push(...sub.relationship.intersection().map(i => i.c));
                return acc;
            }, [] as [number, number][])
        ).map(c => new Point(c));
    }

    private _mixPredicate() {
        const epsilon = optioner.options.epsilon;
        const angle = this.geometry1.angle;
        const ei = new EndpointIntersection();
        const commonStrike: [number, number][] = [];
        const endpointStrike: [number, number][] = [];
        const endpointContact: [number, number][] = [];
        const commonCross: [number, number][] = [];
        const endpointCross: [number, number][] = [];
        const endpointTouch: [number, number][] = [];

        this.subRelationships.forEach(sub => {
            sub.relationship.intersection().forEach(i => {
                const t2Is0 = Maths.equalTo(i.t2, 0, epsilon);
                const t2Is1 = Maths.equalTo(i.t2, 1, epsilon);

                // not intersected at vertex
                if (!t2Is0 && !t2Is1) {
                    commonStrike.push(i.c);
                    commonCross.push(i.c);
                    return;
                }
                // else  t2Is0 || t2Is1
                let aIn;
                let aOut;
                let bIn;
                let bOut;

                const prev2 = this.segments2[prev(sub.index2, this.segments2.length, this.geometry2.closed)];
                const next2 = this.segments2[next(sub.index2, this.segments2.length, this.geometry2.closed)];
                const curr2 = this.segments2[sub.index2];

                const atEnd2 = (t2Is0 && prev2 === undefined) || (t2Is1 && next2 === undefined);

                if (atEnd2) {
                    commonStrike.push(i.c);
                    return;
                }

                // prettier-ignore
                [aIn, aOut] = [
                    new LineSegment(Vector2.add(i.c, Vector2.from2(angle, -1)), i.c),
                    new LineSegment(i.c, Vector2.add(i.c, Vector2.from2(angle, 1)))
                ];

                if (t2Is0) {
                    [bIn, bOut] = [prev2, curr2];
                } else {
                    // t2Is1
                    [bIn, bOut] = [curr2, next2];
                }
                const det = ei.determine(i.c, aIn, aOut, bIn, bOut);
                if (det === "cross") {
                    endpointStrike.push(i.c);
                    endpointCross.push(i.c);
                }
                if (det === "touch") {
                    endpointContact.push(i.c);
                    endpointTouch.push(i.c);
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
        const firstBlock = firstSub.relationship.intersection().filter(i => Maths.equalTo(i.t2, 0, epsilon));
        const lastBlock = lastSub.relationship.intersection().filter(i => Maths.equalTo(i.t2, 1, epsilon));
        return [...firstBlock, ...lastBlock].map(i => new Point(i.c));
    }
    // no blockedBy
    // no connect
    @superPreprocess("handleDegeneration")
    coincide() {
        return this.subRelationships.reduce((acc, sub) => {
            acc.push(...sub.relationship.coincide());
            return acc;
        }, [] as LineSegment[]);
    }
}
