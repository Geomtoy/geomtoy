import EventTarget from "./EventTarget";

import type Geomtoy from "..";
import type Graphics from "../graphics";

abstract class Shape extends EventTarget {
    constructor(owner: Geomtoy) {
        super(owner);
    }
    get type() {
        return this.name;
    }

    abstract isValid(): boolean;
    abstract clone(): Shape;
    abstract copyFrom(shape: Shape | null): this;
    abstract getGraphics(): Graphics;
    abstract move(deltaX: number, deltaY: number): Shape;
    abstract moveSelf(deltaX: number, deltaY: number): this;
    abstract moveAlongAngle(angle: number, distance: number): Shape;
    abstract moveAlongAngleSelf(angle: number, distance: number): this;
}

export default Shape;
