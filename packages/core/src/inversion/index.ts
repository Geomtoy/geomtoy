import { Assert, Math, Vector2, Type, Coordinates } from "@geomtoy/util";
import { validAndWithSameOwner } from "../decorator";

import BaseObject from "../base/BaseObject";
import Point from "../shapes/basic/Point";
import Line from "../shapes/basic/Line";
import Circle from "../shapes/basic/Circle";

import type Geomtoy from "../geomtoy";

const defaultInversionPower = 10000;

class Inversion extends BaseObject {
    private _centerX = 0;
    private _centerY = 0;
    private _power = defaultInversionPower;

    constructor(owner: Geomtoy, centerX: number, centerY: number, power?: number);
    constructor(owner: Geomtoy, centerCoordinates: [number, number], power?: number);
    constructor(owner: Geomtoy, centerPoint: Point, power?: number);
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any) {
        super(o);
        if (Type.isNumber(a1)) {
            this.centerCoordinates([a1, a2]);
            this.power(a3);
        }
        if (Type.isCoordinates(a1)) {
            this.centerCoordinates(a1);
            this.power(a2);
        }
        if (a1 instanceof Point) {
            this.centerCoordinates(a1);
            this.power(a2);
        }
        return Object.seal(this);
    }

    centerCoordinates(): [number, number];
    centerCoordinates(value: [number, number] | Point): void;
    centerCoordinates(value?: any) {
        if (value === undefined) {
            return [this._centerX, this._centerY] as [number, number];
        }
        const c = value instanceof Point ? value.coordinates : (Assert.isCoordinates(value, "value"), value);
        this._centerX = Coordinates.x(c);
        this._centerY = Coordinates.y(c);
    }

    power(): number;
    power(value: number): void;
    power(value?: any) {
        if (value === undefined) {
            return this._power;
        }
        Assert.isNonZeroNumber(value, "value");
        this._power = value;
    }

    /**
     * Find the inversion of `point`
     * @description
     * If `point` is same as the inversion center, return `null`.
     * If `point` is not same as the inversion center, return the inverted point.
     * @param point
     * @returns
     */
    invertPoint(point: Point) {
        // If `point` is the inversion center, the inverted point is the point at infinity, so we return `null`
        if (point.isSameAs(new Point(this.owner, this.centerCoordinates()))) return null;

        const c0 = this.centerCoordinates();
        const power = this.power();
        const c1 = point.coordinates;
        const v01 = Vector2.from(c0, c1);
        const d = Vector2.magnitude(v01);
        const id = Math.abs(power / d);

        // When `power` > 0, `v01` and `v02` are in the same direction.
        // When `power` < 0, `v01` and `v02` are in the opposite direction.
        const angle = power > 0 ? Vector2.angle(v01) : Vector2.angle(Vector2.negative(v01));

        const v02 = Vector2.from2(angle, id);
        const c2 = Vector2.add(c0, v02);
        return new Point(this.owner, c2);
    }

    /**
     * Find the inversion of `line`.
     * @description
     * If `line` passes through the inversion center, return itself(cloned).
     * If `line` does not pass through the inversion center, return the inverted circle.
     * @param line
     * @returns
     */
    invertLine(line: Line): Line | Circle {
        if (line.isPointOn(this.centerCoordinates())) return line.clone();

        const c0 = this.centerCoordinates();
        const power = this.power();
        const c1 = line.getPerpendicularPointFromPoint(c0).coordinates;
        const v01 = Vector2.from(c0, c1);
        const d = Vector2.magnitude(v01);
        const id = Math.abs(power / d);
        const radius = id / 2;

        // When `power` > 0, `v01` and `v02` are in the same direction.
        // When `power` < 0, `v01` and `v02` are in the opposite direction.
        const angle = power > 0 ? Vector2.angle(v01) : Vector2.angle(Vector2.negative(v01));

        const v02 = Vector2.from2(angle, radius);
        const c2 = Vector2.add(c0, v02);

        return new Circle(this.owner, c2, radius);
    }

    /**
     * Find the inversion of `circle`.
     * @description
     * If `circle` passes through the inversion center, return the inverted line.
     * If `circle` does not pass through the inversion center, return the inverted circle.
     * @param circle
     * @returns
     */
    invertCircle(circle: Circle): Line | Circle {
        const c0 = this.centerCoordinates();
        const power = this.power();
        const c1 = circle.centerCoordinates;
        const radius = circle.radius;
        const v01 = Vector2.from(c0, c1);

        if (circle.isPointOn(this.centerCoordinates())) {
            const id = Math.abs((power / 2) * radius);
            const l = Line.fromTwoPoints.call(this, c0, c1)!;

            // When `power` > 0, `v01` and `v02` are in the same direction.
            // When `power` < 0, `v01` and `v02` are in the opposite direction.
            const angle = power > 0 ? Vector2.angle(v01) : Vector2.angle(Vector2.negative(v01));

            const v02 = Vector2.from2(angle, id);
            const c2 = Vector2.add(c0, v02);

            return l.getPerpendicularLineFromPoint(c2);
        } else {
            const d = Vector2.magnitude(v01);
            const i = 1 / Math.abs(d - radius);
            const j = 1 / Math.abs(d + radius);
            const r = ((i - j) * Math.abs(power)) / 2;
            const s = ((i + j) * Math.abs(power)) / 2;

            // When `power` > 0 and inversion center is inside `circle`,  v01` and `v02` are in the opposite direction.
            // When `power` > 0 and inversion center is outside `circle`, `v01` and `v02` are in the same direction.
            // When `power` < 0 and inversion center is inside `circle`, `v01` and `v02` are in the same direction.
            // When `power` < 0 and inversion center is outside `circle`, `v01` and `v02` are in the opposite direction.
            const angle = power > 0 !== circle.isPointInside(c0) ? Vector2.angle(v01) : Vector2.angle(Vector2.negative(v01));

            const v02 = Vector2.from2(angle, s);
            const c2 = Vector2.add(c0, v02);

            return new Circle(this.owner, c2, r);
        }
    }

    toString() {
        //prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\tcenterCoordinates: {`,
            `\t\tx: ${this._centerX}`,
            `\t\ty: ${this._centerY}`,
            `\t}`,
            `\tpower: ${this.power}`, 
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n")
    }
    toArray() {
        return [];
    }
    toObject() {
        return {};
    }
}
validAndWithSameOwner(Inversion);

export default Inversion;
