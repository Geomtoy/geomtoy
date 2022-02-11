import Type from "./Type";
import Maths from "./Maths";
import Coordinates from "./Coordinates";

import type { StaticClass } from "./types";

interface Box extends StaticClass {}
class Box {
    constructor() {
        throw new Error("[G]`Box` can not used as a constructor.");
    }
    /**
     * The `x` parameter of box `b`.
     * @param b
     * @param x
     */
    static x(b: [number, number, number, number], x?: number) {
        if (x !== undefined) b[0] = x;
        return b[0];
    }
    /**
     * The `y` parameter of box `b`.
     * @param b
     * @param x
     */
    static y(b: [number, number, number, number], y?: number) {
        if (y !== undefined) b[1] = y;
        return b[1];
    }
    /**
     * The `width` parameter of box `b`.
     * @param b
     * @param w
     */
    static width(b: [number, number, number, number], w?: number) {
        if (w !== undefined) b[2] = w;
        return b[2];
    }
    /**
     * The `height` parameter of box `b`.
     * @param b
     * @param h
     */
    static height(b: [number, number, number, number], h?: number) {
        if (h !== undefined) b[3] = h;
        return b[3];
    }
    /**
     * The `minX` parameter of box `b`.
     * @param b
     * @param minX
     */
    static minX(b: [number, number, number, number], minX?: number) {
        return Box.x(b, minX);
    }
    /**
     * The `minY` parameter of box `b`.
     * @param b
     * @param minY
     */
    static minY(b: [number, number, number, number], minY?: number) {
        return Box.y(b, minY);
    }
    /**
     * The `maxX` parameter of box `b`.
     * @param b
     * @param maxX
     */
    static maxX(b: [number, number, number, number], maxX?: number) {
        if (maxX !== undefined) b[2] = maxX - b[0];
        return b[0] + b[2];
    }
    /**
     * The `maxY` parameter of box `b`.
     * @param b
     * @param maxY
     */
    static maxY(b: [number, number, number, number], maxY?: number) {
        if (maxY !== undefined) b[3] = maxY - b[1];
        return b[1] + b[3];
    }
    /**
     * Whether box `b` is valid.
     * @param b
     */
    static isValid(b: [number, number, number, number]) {
        return b.every(elem => Type.isRealNumber(elem)) && b[2] > 0 && b[3] > 0;
    }
    /**
     * Whether box `b1` is equal to box `b2`. If `epsilon` is not `undefined`, make an approximate comparison.
     * @param b1
     * @param b2
     * @param epsilon
     */
    static isEqualTo(b1: [number, number, number, number], b2: [number, number, number, number], epsilon?: number) {
        if (epsilon === undefined) return b1[0] === b2[0] && b1[1] === b2[1] && b1[2] === b2[2] && b1[3] === b2[3];
        return Maths.equalTo(b1[0], b2[0], epsilon) && Maths.equalTo(b1[1], b2[1], epsilon) && Maths.equalTo(b1[2], b2[2], epsilon) && Maths.equalTo(b1[3], b2[3], epsilon);
    }
    /**
     * Returns a new box defined from coordinates `c1` to coordinates `c2`.
     * @param c1
     * @param c2
     */
    static from(c1: [number, number], c2: [number, number]) {
        const minX = Maths.min(Coordinates.x(c1), Coordinates.x(c2));
        const minY = Maths.min(Coordinates.y(c1), Coordinates.y(c2));
        const width = Maths.abs(Coordinates.x(c1) - Coordinates.x(c2));
        const height = Maths.abs(Coordinates.y(c1) - Coordinates.y(c2));
        return [minX, minY, width, height] as [number, number, number, number];
    }
    /**
     * Returns the minium x and minium y coordinates of box `b`.
     * @param b
     */
    static nn(b: [number, number, number, number]) {
        return [b[0], b[1]] as [number, number];
    }
    /**
     * Returns the maximum x and minium y coordinates of box `b`.
     * @param b
     */
    static mn(b: [number, number, number, number]) {
        return [b[0] + b[2], b[1]] as [number, number];
    }
    /**
     * Returns the maximum x and maximum y coordinates of box `b`.
     * @param b
     */
    static mm(b: [number, number, number, number]) {
        return [b[0] + b[2], b[1] + b[3]] as [number, number];
    }
    /**
     * Returns the minium x and maximum y coordinates of box `b`.
     * @param b
     */
    static nm(b: [number, number, number, number]) {
        return [b[0], b[1] + b[3]] as [number, number];
    }
}

export default Box;
