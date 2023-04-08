import { stated } from "../misc/decor-stated";
import type Transformation from "../transformation";
import Shape from "./Shape";

export default abstract class Geometry extends Shape {
    skipValidation = false;
    /**
     * Whether essential properties of geometry `this` is properly set.
     */
    abstract initialized(): boolean;
    /**
     * Whether geometry `this` degenerates.
     * The return of this method affects `isValid`.
     * @see https://en.wikipedia.org/wiki/Degeneracy_(mathematics)
     * @note
     * - Not being initialized is also considered a kind of degeneracy.
     * - If geometry `this` is not initialized(means essential properties of geometry `this` is properly set),
     * then calling this method with `check: false` will return `null`, and only this situation will return `null`.
     * - If geometry `this` is initialized but degenerates, then It's invalid, and calling this method
     * with `check: false` will return the geometry of the degenerate.
     * - Calling this method with `check: true` will quickly returns whether geometry `this` degenerates.
     */
    abstract degenerate(check: false): Geometry | null;
    abstract degenerate(check: true): boolean;
    /**
     * Whether geometry `this` is valid, `valid` means that essential properties of geometry `this` is properly set, and does not degenerate.
     */
    @stated
    isValid() {
        return !this.degenerate(true);
    }
    abstract getBoundingBox(): [number, number, number, number];
    /**
     * Apply transformation `transformation` to geometry `this` to get a new geometry.
     * @param transformation
     */
    abstract apply(transformation: Transformation): Geometry;
}
