import { Angle } from "@geomtoy/util";
import BaseRelationship from "../BaseRelationship";
import Arc from "../../geometries/basic/Arc";
import Ellipse from "../../geometries/basic/Ellipse";
import Point from "../../geometries/basic/Point";
import EllipseEllipse from "./EllipseEllipse";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import { optioner } from "../../geomtoy";

export default class ArcEllipse extends BaseRelationship {
    constructor(public geometry1: Arc, public geometry2: Ellipse) {
        super();
        const dg1 = geometry1.dimensionallyDegenerate();
        if (dg1) {
            this.degeneration.relationship = null;
            return this;
        }

        this.supRelationship = new EllipseEllipse(geometry1.toEllipse(), geometry2);
    }
    supRelationship?: EllipseEllipse;

    @cached
    onSameTrajectory() {
        return this.supRelationship?.onSameTrajectory() ?? false;
    }

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        a1: number; // angle of `c` on `arc`
        a2: number; // angle of `c` on `ellipse`
        m: number; //multiplicity
    }[] {
        const [sa, ea] = this.geometry1.getStartEndAngles();
        const positive = this.geometry1.positive;
        const epsilon = optioner.options.epsilon;
        const intersection = this.supRelationship?.intersection() ?? [];
        return intersection.filter(i => Angle.between(i.a1, sa, ea, positive, false, false, epsilon));
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
        const [sa, ea] = this.geometry1.getStartEndAngles();
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => i.m % 2 === 1 && !Angle.equalTo(i.a1, sa, epsilon) && !Angle.equalTo(i.a1, ea, epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        const [sa, ea] = this.geometry1.getStartEndAngles();
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => i.m % 2 === 0 && !Angle.equalTo(i.a1, sa, epsilon) && !Angle.equalTo(i.a1, ea, epsilon))
            .map(i => new Point(i.c));
    }
    // no block
    @superPreprocess("handleDegeneration")
    blockedBy() {
        const [sa, ea] = this.geometry1.getStartEndAngles();
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => Angle.equalTo(i.a1, sa, epsilon) || Angle.equalTo(i.a1, ea, epsilon))
            .map(i => new Point(i.c));
    }
    // no connect
    @superPreprocess("handleDegeneration")
    coincide() {
        if (!this.onSameTrajectory()) return [];
        return [this.geometry1.clone()];
    }
}
