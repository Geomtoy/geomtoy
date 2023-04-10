import Maths from "./Maths";
import Matrix2 from "./Matrix2";

import type { StaticClass } from "./types";

interface Vector2 extends StaticClass {}
class Vector2 {
    constructor() {
        throw new Error("[G]`Vector2` can not used as a constructor.");
    }
    /**
     * Returns a new vector2 from `u` to `v`.
     * @param u
     * @param v
     */
    static from(u: [number, number], v: [number, number]) {
        return [v[0] - u[0], v[1] - u[1]] as [number, number];
    }
    /**
     * Returns a new vector2 with angle `a` and magnitude `m`.
     * @summary
     * - If `m` > 0, then the returned vector2 is in the direction of `a`.
     * - If `m` < 0, then the returned vector2 is in the opposite direction of `a`, which is the negative of the vector2 returned when `m` > 0.
     * @param a
     * @param m
     */
    static from2(a: number, m: number) {
        return [m * Maths.cos(a), m * Maths.sin(a)] as [number, number];
    }
    /**
     * Whether vector2 `v` is zero.
     * @param v
     */
    static isZero(v: [number, number]) {
        return v[0] === 0 && v[1] === 0;
    }
    /**
     * Returns the angle of vector2 `v`.
     * @note
     * The angle of zero vector is 0, according to `Math.atan2`.
     * @param v
     */
    static angle(v: [number, number]) {
        return Maths.atan2(v[1], v[0]);
    }
    /**
     * Returns the angle from `u` to `v` in the interval $(-\pi,\pi]$.
     * @param u
     * @param v
     */
    static angleTo(u: [number, number], v: [number, number]) {
        if (Vector2.isZero(u) || Vector2.isZero(v)) return NaN;
        return (Vector2.cross(u, v) >= 0 ? 1 : -1) * Maths.acos(Vector2.dot(u, v) / (Vector2.magnitude(u) * Vector2.magnitude(v)));
    }
    /**
     * Returns the magnitude of vector2 `v`.
     * @param v
     */
    static magnitude(v: [number, number]) {
        if (Vector2.isZero(v)) return 0;
        if (Maths.abs(v[0]) >= Maths.abs(v[1])) {
            return Maths.abs(v[0]) * Maths.sqrt(1 + (v[1] / v[0]) ** 2);
        } else {
            return Maths.abs(v[1]) * Maths.sqrt(1 + (v[0] / v[1]) ** 2);
        }
    }
    /**
     * Returns the squared magnitude of vector2 `v`.
     * @param v
     */
    static squaredMagnitude(v: [number, number]) {
        return v[0] ** 2 + v[1] ** 2;
    }
    /**
     * Returns a new vector2 of adding `u` by `v`.
     * @param u
     * @param v
     */
    static add(u: [number, number], v: [number, number]) {
        return [u[0] + v[0], u[1] + v[1]] as [number, number];
    }
    /**
     * Returns a new vector2 of subtracting `u` by `v`.
     * @param u
     * @param v
     */
    static subtract(u: [number, number], v: [number, number]) {
        return [u[0] - v[0], u[1] - v[1]] as [number, number];
    }
    /**
     * Returns a new vector2 of vector2 `v` multiplying a scalar `s`.
     * @param v
     * @param s
     */
    static scalarMultiply(v: [number, number], s: number) {
        return [v[0] * s, v[1] * s] as [number, number];
    }
    /**
     * Returns the dot product of vector2 `u` and vector2 `v`.
     * @param u
     * @param v
     */
    static dot(u: [number, number], v: [number, number]) {
        return u[0] * v[0] + u[1] * v[1];
    }
    /**
     * Returns the cross product of vector2 `u` and vector2 `v`.
     * @param u
     * @param v
     */
    static cross(u: [number, number], v: [number, number]) {
        return u[0] * v[1] - v[0] * u[1];
    }
    /**
     * Returns the projection(a vector2) of vector2 `u` on vector2 `v`.
     * @param u
     * @param v
     */
    static project(u: [number, number], v: [number, number]) {
        if (Vector2.isZero(v)) return [NaN, NaN] as [number, number];
        return Vector2.scalarMultiply(v, Vector2.dot(u, v) / Vector2.dot(v, v));
    }
    /**
     * Returns a new vector2 of the linear interpolation between vector2 `u` and vector2 `v`.
     * @param u
     * @param v
     * @param t
     */
    static lerp(u: [number, number], v: [number, number], t: number) {
        return Vector2.add(Vector2.scalarMultiply(u, 1 - t), Vector2.scalarMultiply(v, t));
    }
    /**
     * Returns the unit vector2 in the direction of vector2 `v`.
     * @param v
     */
    static normalize(v: [number, number]) {
        if (Vector2.isZero(v)) return [0, 0] as [number, number];
        const magnitude = Vector2.magnitude(v);
        return [v[0] / magnitude, v[1] / magnitude] as [number, number];
    }
    /**
     * Returns the negative of vector2 `v` which have equal magnitude but opposite in direction.
     * @param v
     */
    static negative(v: [number, number]) {
        return [-v[0], -v[1]] as [number, number];
    }
    // #region Linear transformation
    /**
     * Returns a new vector2 by rotating vector2 `v` with angle `a`.
     * @param v
     * @param a
     */
    static rotate(v: [number, number], a: number) {
        const m = [Maths.cos(a), -Maths.sin(a), Maths.sin(a), Maths.cos(a)] as [number, number, number, number];
        return Matrix2.dotVector2(m, v);
    }
    /**
     * Returns a new vector2 by skewing vector2 `v` with horizontal angle `ax` and vertical angle `ay`.
     * @param v
     * @param ax
     * @param ay
     */
    static skew(v: [number, number], ax: number, ay: number) {
        const m = [1, Maths.tan(ax), Maths.tan(ay), 1] as [number, number, number, number];
        return Matrix2.dotVector2(m, v);
    }
    /**
     * Returns a new vector2 by scaling vector2 `v` with horizontal factor `ax` and vertical factor `ay`.
     * @param v
     * @param sx
     * @param sy
     */
    static scale(v: [number, number], sx: number, sy: number) {
        const m = [sx, 0, 0, sy] as [number, number, number, number];
        return Matrix2.dotVector2(m, v);
    }
    // #endregion
}
export default Vector2;
