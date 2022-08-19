import Shape from "./Shape";
import type Transformation from "../transformation";
import { stated } from "../misc/decor-cache";

export default abstract class Geometry extends Shape {
    /**
     * Whether geometry `this` dimensionally degenerates.
     * @note
     * Dimensionally degenerate: 2D geometry fall into 1D/0D, 1D geometry fall into 0D.
     * Example:
     * A cubic bezier may degenerate to a point - This is a dimensional degeneration.
     * A cubic bezier may degenerate to a quadratic bezier or a line segment - This is a non-dimensional degeneration.
     *
     * This method only cares on degenerations caused by proper essential properties but special positional relationships(mainly the positional relationship of the constituent points),
     * and does not deal with degenerations caused by improper essential properties.
     * So this method does not cover all geometrically possible degenerations of geometry `this`.
     * Besides, the return of this method affects `isValid`.
     */
    dimensionallyDegenerate?(): boolean;
    /**
     * Whether geometry `this` is valid, `valid` means that the geometry is `proper`, and does not falls into dimensional degenerations.
     */
    @stated
    isValid() {
        return this.initialized_() && (!this.dimensionallyDegenerate?.() ?? true);
    }
    abstract apply(transformation: Transformation): Geometry | null;
}
