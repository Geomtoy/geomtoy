import { Coordinate } from "../types";
declare let vectorUtility: {
    add([ux, uy]: Coordinate, [vx, vy]: Coordinate): Coordinate;
    subtract([ux, uy]: Coordinate, [vx, vy]: Coordinate): Coordinate;
    scalarMultiply([x, y]: Coordinate, scalar: number): Coordinate;
    dotProduct([ux, uy]: Coordinate, [vx, vy]: Coordinate): number;
    crossProduct([ux, uy]: Coordinate, [vx, vy]: Coordinate): number;
    reverse([x, y]: Coordinate): Coordinate;
    swap([x, y]: Coordinate): Coordinate;
    rotate([x, y]: Coordinate, a: number): Coordinate;
    normalize([x, y]: Coordinate): Coordinate;
};
export default vectorUtility;
