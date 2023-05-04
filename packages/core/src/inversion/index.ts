import { Assert, Coordinates, Float, Maths, Type, Utility, Vector2 } from "@geomtoy/util";
import EventTarget from "../base/EventTarget";
import EventSourceObject from "../event/EventSourceObject";
import Circle from "../geometries/basic/Circle";
import Line from "../geometries/basic/Line";
import Point from "../geometries/basic/Point";
import { eps } from "../geomtoy";
import { validGeometryArguments } from "../misc/decor-geometry";
import { getCoordinates } from "../misc/point-like";

const INVERSION_DEFAULT_POWER = 10000;

export default class Inversion extends EventTarget {
    private _centerX = 0;
    private _centerY = 0;
    private _power = INVERSION_DEFAULT_POWER;

    constructor(centerX: number, centerY: number, power?: number);
    constructor(centerCoordinates: [number, number], power?: number);
    constructor(center: Point, power?: number);
    constructor();
    constructor(a0?: any, a1?: any, a2?: any) {
        super();
        if (Type.isNumber(a0)) {
            Object.assign(this, { centerX: a0, centerY: a1, power: a2 ?? this._power });
        }
        if (Type.isArray(a0)) {
            Object.assign(this, { centerCoordinates: a0, power: a1 ?? this._power });
        }
        if (a0 instanceof Point) {
            Object.assign(this, { center: a0, power: a1 ?? this._power });
        }
        this.initState_();
    }

    static override events = {
        centerXChanged: "centerX" as const,
        centerYChanged: "centerY" as const,
        powerChanged: "power" as const
    };

    private _setCenterX(value: number) {
        if (Utility.is(this._centerX, value)) return;
        this._centerX = value;
        this.trigger_(new EventSourceObject(this, Inversion.events.centerXChanged));
    }
    private _setCenterY(value: number) {
        if (Utility.is(this._centerY, value)) return;
        this._centerY = value;
        this.trigger_(new EventSourceObject(this, Inversion.events.centerYChanged));
    }
    private _setPower(value: number) {
        if (Utility.is(this._power, value)) return;
        this._power = value;
        this.trigger_(new EventSourceObject(this, Inversion.events.powerChanged));
    }

    get centerX() {
        return this._centerX;
    }
    set centerX(value) {
        Assert.isRealNumber(value, "centerX");
        this._setCenterX(value);
    }
    get centerY() {
        return this._centerY;
    }
    set centerY(value) {
        Assert.isRealNumber(value, "centerY");
        this._setCenterY(value);
    }
    get centerCoordinates() {
        return [this._centerX, this._centerY] as [number, number];
    }
    set centerCoordinates(value) {
        Assert.isCoordinates(value, "centerCoordinates");
        this._setCenterX(Coordinates.x(value));
        this._setCenterY(Coordinates.y(value));
    }
    get center() {
        return new Point(this._centerX, this._centerY);
    }
    set center(value) {
        this._setCenterX(value.x);
        this._setCenterY(value.y);
    }
    get power() {
        return this._power;
    }
    set power(value) {
        // We do not support imaginary circles
        Assert.isPositiveNumber(value, "power");
        this._setPower(value);
    }

    /**
     * Whether point `point` is self-inverse in inversion `this`.
     * @param point
     */
    @validGeometryArguments
    isPointSelfInverse(point: Point) {
        const c0 = getCoordinates(point, "point");
        const sd = Vector2.squaredMagnitude(Vector2.from(this.centerCoordinates, c0));
        return Float.equalTo(sd, this.power, eps.epsilon);
    }
    /**
     * Whether line `line` is self-inverse in inversion `this`.
     * @param line
     */
    @validGeometryArguments
    isLineSelfInverse(line: Line) {
        return line.isPointOn(this.centerCoordinates);
    }
    /**
     * Whether circle `circle` is self-inverse in inversion `this`.
     * @param circle
     */
    @validGeometryArguments
    isCircleSelfInverse(circle: Circle) {
        const inversionBasisCircle = new Circle(this.centerCoordinates, Maths.sqrt(this.power));
        const { centerCoordinates: cc0, radius: r0 } = inversionBasisCircle;
        const { centerCoordinates: cci, radius: ri } = circle;
        // the circle is the basis circle of inversion.
        if (Coordinates.equalTo(cc0, cci, eps.epsilon) && Float.equalTo(r0, ri, eps.epsilon)) {
            return true;
        }
        // the circle is orthogonal circle of the basis circle of inversion.
        return circle.isOrthogonalToCircle(inversionBasisCircle);
    }
    /**
     * Returns the inverse of point `point`.
     * @description
     * - If `point` is same as the inversion center, returns `null`.
     * - Else returns the inverse point.
     * @param point
     */
    @validGeometryArguments
    invertPoint(point: [number, number] | Point) {
        // If `point` is the inversion center, the inverse point is the point at infinity, so we return `null`
        const cc = this.centerCoordinates;
        const c1 = getCoordinates(point, "point");
        if (Coordinates.equalTo(cc, c1, eps.epsilon)) {
            console.warn("[G]The `point` is same as the inversion center, `null` will be returned.");
            return null;
        }
        const power = this.power;
        const v1 = Vector2.from(cc, c1);
        const d = Vector2.magnitude(v1);
        const id = power / d;
        const angle = Vector2.angle(v1);
        const v2 = Vector2.from2(angle, id);
        const c2 = Vector2.add(cc, v2);
        return new Point(c2);
    }
    /**
     * Returns the inverse of line `line`.
     * @description
     * If `line` passes through the inversion center, return itself(cloned).
     * If `line` does not pass through the inversion center, return the inverse circle.
     * @param line
     */
    @validGeometryArguments
    invertLine(line: Line): Line | Circle {
        // The inversion center is on `line`, then we get a line.
        // If we treat a line as a circle with infinite radius and centered at infinite point,
        // then we still get a inverse of line.
        if (line.isPointOn(this.centerCoordinates)) return line.clone();

        // The inversion center is not on `line`, then we get a circle, and the inversion center is on this circle.
        const cc = this.centerCoordinates;
        const power = this.power;
        const c1 = line.getClosestPointFromPoint(cc)[0].coordinates;
        const v1 = Vector2.from(cc, c1);
        const d = Vector2.magnitude(v1);
        const angle = Vector2.angle(v1);
        const id = power / d;
        const radius = id / 2;
        const v2 = Vector2.from2(angle, radius);
        const c2 = Vector2.add(cc, v2);

        return new Circle(c2, radius);
    }
    /**
     * Returns the inverse of circle `circle`.
     * @description
     * If `circle` passes through the inversion center, return the inverse line.
     * If `circle` does not pass through the inversion center, return the inverse circle.
     * @param circle
     */
    @validGeometryArguments
    invertCircle(circle: Circle) {
        const cc = this.centerCoordinates;
        const power = this.power;
        const c1 = circle.centerCoordinates;
        const radius = circle.radius;
        const v1 = Vector2.from(cc, c1);

        // The inversion center is the same as the center of `circle`, then we get a circle.

        // This equal to inverting all the points of `circle` individually, and we get a concentric circle.
        if (Coordinates.equalTo(cc, c1, eps.epsilon)) {
            return new Circle(c1, power / radius);
        }

        // The inversion center is on `circle`, then we get a line.
        if (circle.isPointOn(this.centerCoordinates)) {
            const id = power / (2 * radius);
            const l = Line.fromTwoPoints(cc, c1)!;
            const angle = Vector2.angle(v1);
            const v2 = Vector2.from2(angle, id);
            const c2 = Vector2.add(cc, v2);
            return l.getPerpendicularLineFromPoint(c2);
        }
        // The inversion center is not on `circle`, then we get a circle.
        else {
            const d = Vector2.magnitude(v1);
            const i = Maths.abs(d - radius);
            const j = d + radius;
            const ii = power / i;
            const ij = power / j;

            if (circle.isPointInside(cc)) {
                const angle = Vector2.angle(v1);
                const r = (ii + ij) / 2;
                const v2 = Vector2.from2(angle, r - ii);
                const c2 = Vector2.add(cc, v2);
                return new Circle(c2, r);
            } else {
                const angle = Vector2.angle(v1);
                const r = (ii - ij) / 2;
                const v2 = Vector2.from2(angle, r + ij);
                const c2 = Vector2.add(cc, v2);
                return new Circle(c2, r);
            }
        }
    }

    clone() {
        const ret = new Inversion();
        ret._centerX = this._centerX;
        ret._centerY = this._centerY;
        ret._power = this._power;
        return ret;
    }
    copyFrom(inversion: Inversion | null) {
        if (inversion === null) inversion = new Inversion();
        this._setCenterX(inversion._centerX);
        this._setCenterY(inversion._centerY);
        this._setPower(inversion._power);
        return this;
    }

    override toJSON() {
        return {
            name: this.name,
            id: this.id,
            centerX: this._centerX,
            centerY: this._centerY,
            power: this._power
        };
    }
}
