import EventTarget from "./EventTarget";

import type Geomtoy from "..";
import type Graphics from "../graphics";
import { ViewportDescriptor } from "../types";

export default abstract class Shape extends EventTarget {
    constructor(owner: Geomtoy) {
        super(owner);
    }
    get type() {
        return this.name;
    }

    /**
     * Check if `this` is valid.
     */
    abstract isValid(): boolean;
    abstract clone(): Shape;
    abstract copyFrom(shape: Shape | null): this;
    /**
     * Get `Graphics` which describing the commands of drawing `this`.
     * @param viewport
     */
    abstract getGraphics(viewport: ViewportDescriptor): Graphics;
    /**
     * Move `this` by `deltaX` and `deltaY` to get new clone of `this`.
     * @param deltaX
     * @param deltaY
     */
    abstract move(deltaX: number, deltaY: number): Shape;
    /**
     * Move `this` itself by `deltaX` and `deltaY`.
     * @param deltaX
     * @param deltaY
     */
    abstract moveSelf(deltaX: number, deltaY: number): this;
    /**
     * Move `this` with `distance` along `angle` to get new clone of `this`.
     * @param angle
     * @param distance
     */
    abstract moveAlongAngle(angle: number, distance: number): Shape;
    /**
     * Move `this` itself with `distance` along `angle`.
     * @param angle
     * @param distance
     */
    abstract moveAlongAngleSelf(angle: number, distance: number): this;
}
