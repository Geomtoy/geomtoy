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
     * Whether `v` is a valid box.
     * @param v
     */
    static is(v: any): v is [number, number, number, number] {
        return Type.isArray(v) && v.length === 4 && v.every(elem => Type.isRealNumber(elem)) && v[2] >= 0 && v[3] >= 0;
    }
    static isZero(v: [number, number, number, number]): v is [number, number, number, number] {
        return Type.isArray(v) && v.length === 4 && v.every(elem => Type.isRealNumber(elem)) && (v[2] === 0 || v[3] === 0);
    }
    static isNoneZero(v: [number, number, number, number]): v is [number, number, number, number] {
        return Type.isArray(v) && v.length === 4 && v.every(elem => Type.isRealNumber(elem)) && v[2] > 0 && v[3] > 0;
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
     * @param y
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
     * Returns the minium x of box `b`.
     * @param b
     */
    static minX(b: [number, number, number, number]) {
        return b[0];
    }
    /**
     * Returns the minium y of box `b`.
     * @param b
     */
    static minY(b: [number, number, number, number]) {
        return b[1];
    }
    /**
     * Returns the maximum x of box `b`.
     * @param b
     */
    static maxX(b: [number, number, number, number]) {
        return b[0] + b[2];
    }
    /**
     * Returns the maximum y of box `b`.
     * @param b
     */
    static maxY(b: [number, number, number, number]) {
        return b[1] + b[3];
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
    /**
     * Returns a new box defined from coordinates `c1` to coordinates `c2` as the diagonal.
     * @param c1
     * @param c2
     */
    static from(c1: [number, number], c2: [number, number]) {
        const [x1, y1] = c1;
        const [x2, y2] = c2;
        const [minX, maxX] = [Maths.min(x1, x2), Maths.max(x1, x2)];
        const [minY, maxY] = [Maths.min(y1, y2), Maths.max(y1, y2)];
        return [minX, minY, maxX - minX, maxY - minY] as [number, number, number, number];
    }
    static coordinatesInside(c: [number, number], b: [number, number, number, number], epsilon?: number) {
        if (Box.isZero(b)) return false;
        const [minX, maxX, minY, maxY] = [Box.minX(b), Box.maxX(b), Box.minY(b), Box.maxY(b)];
        const [x, y] = c;
        if (epsilon === undefined) {
            return x > minX && x < maxX && y > minY && y < maxY;
        }
        return Maths.between(x, minX, maxX, true, true, epsilon) && Maths.between(y, minY, maxY, true, true, epsilon);
    }
    static coordinatesOutside(c: [number, number], b: [number, number, number, number], epsilon?: number) {
        if (Box.isZero(b)) return false;
        const [minX, maxX, minY, maxY] = [Box.minX(b), Box.maxX(b), Box.minY(b), Box.maxY(b)];
        const [x, y] = c;
        if (epsilon === undefined) {
            return x < minX || x > maxX || y < minY || y > maxY;
        }
        return Maths.lessThan(x, minX, epsilon) || Maths.greaterThan(x, maxX, epsilon) || Maths.lessThan(y, minY, epsilon) || Maths.greaterThan(y, maxY, epsilon);
    }
    static coordinatesOn(c: [number, number], b: [number, number, number, number], epsilon?: number) {
        if (Box.isZero(b)) return false;
        return !Box.coordinatesInside(c, b, epsilon) && !Box.coordinatesOutside(c, b, epsilon);
    }

    static extend(b1: [number, number, number, number], b2: [number, number, number, number]) {
        const minX = Maths.min(Box.minX(b1), Box.minX(b2));
        const minY = Maths.min(Box.minY(b1), Box.minY(b2));
        const maxX = Maths.max(Box.maxX(b1), Box.maxX(b2));
        const maxY = Maths.max(Box.maxY(b1), Box.maxY(b2));
        return [minX, minY, maxX - minX, maxY - minY] as [number, number, number, number];
    }
    static collide(b1: [number, number, number, number], b2: [number, number, number, number], epsilon?: number) {
        if (Box.isZero(b1) || Box.isZero(b2)) return false;
        const [nx1, ny1, mx1, my1] = [b1[0], b1[1], b1[0] + b1[2], b1[1] + b1[3]];
        const [nx2, ny2, mx2, my2] = [b2[0], b2[1], b2[0] + b2[2], b2[1] + b2[3]];
        if (epsilon === undefined) {
            if (nx1 <= mx2 && mx1 >= nx2 && ny1 <= my2 && my1 >= ny2) return true;
            return false;
        } else {
            //prettier-ignore
            if (
                !Maths.greaterThan(nx1, mx2,epsilon) &&
                !Maths.lessThan(mx1, nx2, epsilon) &&
                !Maths.greaterThan(ny1, my2, epsilon) &&
                !Maths.lessThan(my1, ny2, epsilon)
            )  
                return true;
            return false;
        }
    }
}

export default Box;
