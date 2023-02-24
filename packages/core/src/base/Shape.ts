import Graphics from "../graphics";
import type { ViewportDescriptor } from "../types";
import EventTarget from "./EventTarget";

export default abstract class Shape extends EventTarget {
    /**
     * Move shape `this` by `deltaX` and `deltaY`.
     * @param deltaX
     * @param deltaY
     */
    abstract move(deltaX: number, deltaY: number): this;
    /**
     * Get a clone of shape `this`.
     */
    abstract clone(): Shape;
    /**
     * Set the essential properties of shape `this` to be equal to `shape`.
     * @param shape
     */
    copyFrom?(shape: Shape | null): this;
    /**
     * Get shape data which describing the commands of drawing shape `this`.
     * @param viewport
     */
    abstract getGraphics(viewport: ViewportDescriptor): Graphics;
}
