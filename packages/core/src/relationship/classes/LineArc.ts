import { Angle, Maths } from "@geomtoy/util";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import BaseRelationship from "../BaseRelationship";
import Point from "../../geometries/basic/Point";
import LineEllipse from "./LineEllipse";
import { Trilean } from "../../types";
import type Arc from "../../geometries/basic/Arc";
import type Line from "../../geometries/basic/Line";
import { optioner } from "../../geomtoy";

export default class LineArc extends BaseRelationship {
    constructor(public geometry1: Line, public geometry2: Arc) {
        super();
        const dg2 = geometry2.dimensionallyDegenerate();
        if (dg2) {
            this.degeneration.relationship = null;
            return this;
        }
        this.supRelationship = new LineEllipse(geometry1, geometry2.toEllipse());
    }

    supRelationship?: LineEllipse;

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        a2: number; // angle of `c` on `arc`
        m: number; // multiplicity
    }[] {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        const positive = this.geometry2.positive;
        const epsilon = optioner.options.epsilon;
        const intersection = this.supRelationship?.intersection() ?? [];
        return intersection.filter(i => Angle.between(i.a2, sa, ea, positive, false, false, epsilon));
    }

    // no equal
    @superPreprocess("handleDegeneration")
    separate(): Trilean {
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
        const [sa, ea] = this.geometry2.getStartEndAngles();
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => i.m % 2 === 1 && !Angle.equalTo(i.a2, sa, epsilon) && !Angle.equalTo(i.a2, ea, epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => i.m % 2 == 0 && !Angle.equalTo(i.a2, sa, epsilon) && !Angle.equalTo(i.a2, ea, epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => Angle.equalTo(i.a2, sa, epsilon) || Angle.equalTo(i.a2, ea, epsilon))
            .map(i => new Point(i.c));
    }
    // no blockedBy
    // no connect
    // no coincide
}
