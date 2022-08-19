import { Coordinates, Maths, Vector2 } from "@geomtoy/util";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import Ray from "../../geometries/basic/Ray";
import BaseRelationship from "../BaseRelationship";
import { Trilean } from "../../types";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import Polygon from "../../geometries/advanced/Polygon";
import RayLineSegment from "./RayLineSegment";
import EndpointIntersection from "../../helper/EndpointIntersection";
import { next, prev } from "../../misc/loop";
import { optioner } from "../../geomtoy";

export default class RayPolygon extends BaseRelationship {
    constructor(public geometry1: Ray, public geometry2: Polygon) {
        super();
        const dg2 = geometry2.dimensionallyDegenerate();
        if (dg2) {
            this.degeneration.relationship = null;
            return this;
        }
        this.segments2 = geometry2.getSegments(true);
        this.segments2.forEach((seg, index) => {
            this.subRelationships.push({
                relationship: new RayLineSegment(geometry1, seg),
                index2: index
            });
        });
    }
    segments2!: LineSegment[];
    subRelationships!: {
        relationship: RayLineSegment;
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
        const coordinates = this.geometry1.coordinates;
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
                const onRayEnd = Coordinates.isEqualTo(i.c, coordinates, epsilon);
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
                let auxiliary1 = onRayEnd;
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
                    if (!auxiliary1) endpointCross.push(i.c);
                }
                if (det === "touch") {
                    endpointContact.push(i.c);
                    if (!auxiliary1) endpointTouch.push(i.c);
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
        const coordinates = this.geometry1.coordinates;
        const firstSub = this.subRelationships[0];
        const lastSub = this.subRelationships[this.subRelationships.length - 1];
        const firstBlock = firstSub.relationship.intersection().reduce((acc, i) => {
            if (Maths.equalTo(i.t2, 0, epsilon) && !Coordinates.isEqualTo(i.c, coordinates, epsilon)) acc.push(i.c);
            return acc;
        }, [] as [number, number][]);
        const lastBlock = lastSub.relationship.intersection().reduce((acc, i) => {
            if (Maths.equalTo(i.t2, 1, epsilon) && !Coordinates.isEqualTo(i.c, coordinates, epsilon)) acc.push(i.c);
            return acc;
        }, [] as [number, number][]);

        return [...firstBlock, ...lastBlock].map(c => new Point(c));
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        const epsilon = optioner.options.epsilon;
        const coordinates = this.geometry1.coordinates;
        const firstSub = this.subRelationships[0];
        const lastSub = this.subRelationships[this.subRelationships.length - 1];
        const firstBlockedBy = firstSub.relationship.intersection().reduce((acc, i) => {
            if (Coordinates.isEqualTo(i.c, coordinates, epsilon) && !Maths.equalTo(i.t2, 0, epsilon)) acc.push(i.c);
            return acc;
        }, [] as [number, number][]);
        const lastBlockedBy = lastSub.relationship.intersection().reduce((acc, i) => {
            if (Coordinates.isEqualTo(i.c, coordinates, epsilon) && !Maths.equalTo(i.t2, 1, epsilon)) acc.push(i.c);
            return acc;
        }, [] as [number, number][]);
        const otherBlockedBy = this.uniqCoordinates_(
            this.subRelationships.slice(1, this.subRelationships.length - 1).reduce((acc, sub) => {
                sub.relationship.intersection().forEach(i => {
                    if (Coordinates.isEqualTo(i.c, coordinates, epsilon)) acc.push(i.c);
                });
                return acc;
            }, [] as [number, number][])
        );
        return [...firstBlockedBy, ...otherBlockedBy, ...lastBlockedBy].map(c => new Point(c));
    }
    @superPreprocess("handleDegeneration")
    connect() {
        if (this.geometry2.closed) return [];
        const epsilon = optioner.options.epsilon;
        const coordinates = this.geometry1.coordinates;
        const firstSub = this.subRelationships[0];
        const lastSub = this.subRelationships[this.subRelationships.length - 1];
        const firstConnect = firstSub.relationship.intersection().reduce((acc, i) => {
            if (Maths.equalTo(i.t2, 0, epsilon) && Coordinates.isEqualTo(i.c, coordinates, epsilon)) acc.push(i.c);
            return acc;
        }, [] as [number, number][]);
        const lastConnect = lastSub.relationship.intersection().reduce((acc, i) => {
            if (Maths.equalTo(i.t2, 1, epsilon) && Coordinates.isEqualTo(i.c, coordinates, epsilon)) acc.push(i.c);
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
