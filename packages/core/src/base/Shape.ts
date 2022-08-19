import EventTarget from "./EventTarget";
import type { Graphics, ViewportDescriptor } from "../types";

export default abstract class Shape extends EventTarget {
    /**
     * Whether shape `this` is proper, `proper` means that the essential properties of the shape are properly set in the proper range.
     */
    protected abstract initialized_(): boolean;
    /**
     * Move shape `this` by `deltaX` and `deltaY`.
     * @param deltaX
     * @param deltaY
     */
    abstract move(deltaX: number, deltaY: number): this;
    /**
     * Move shape `this` by `distance` along `angle`.
     * @param angle
     * @param distance
     */
    abstract moveAlongAngle(angle: number, distance: number): this;
    /**
     * Get a clone of shape `this`.
     */
    abstract clone(): Shape;
    /**
     * Set the essential properties of shape `this` to be equal to `shape`.
     * @param shape
     */
    abstract copyFrom(shape: Shape | null): this;
    /**
     * Get shape data which describing the commands of drawing shape `this`.
     * @param viewport
     */
    abstract getGraphics(viewport: ViewportDescriptor): Graphics;
}
