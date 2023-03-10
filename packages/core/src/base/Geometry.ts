import { stated } from "../misc/decor-cache";
import type Transformation from "../transformation";
import Shape from "./Shape";

export default abstract class Geometry extends Shape {
    /**
     * Whether essential properties of geometry `this` is properly set.
     */
    abstract initialized(): boolean;
    /**
     * Whether geometry `this` degenerates.
     * @see https://en.wikipedia.org/wiki/Degeneracy_(mathematics)
     * @see https://en.wikipedia.org/wiki/Degenerate_conic
     * The return of this method affects `isValid`.
     */
    degenerate?(check: false): Shape | null;
    degenerate?(check: true): boolean;
    /**
     * Whether geometry `this` is valid, `valid` means that essential properties of geometry `this` is properly set, and does not degenerate.
     */
    @stated
    isValid() {
        if (this.degenerate !== undefined) return !this.degenerate(true);
        return this.initialized();
    }
    abstract getBoundingBox(): [number, number, number, number];
    /**
     * Apply transformation `transformation` to geometry `this` to get a new geometry.
     * @param transformation
     */
    abstract apply(transformation: Transformation): Geometry | null;
}
