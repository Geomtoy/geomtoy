import Point from "./Point";
import GeomObject from "./base/GeomObject";
import Geomtoy from ".";
declare class Polyline extends GeomObject {
    #private;
    constructor(owner: Geomtoy, pointCoordinates: Array<[number, number]>);
    constructor(owner: Geomtoy, points: Array<Point>);
    constructor(owner: Geomtoy, ...pointCoordinates: Array<[number, number]>);
    constructor(owner: Geomtoy, ...points: Array<Point>);
    get name(): string;
    get uuid(): string;
    get points(): Point[];
    set points(value: Point[]);
    get pointCoordinates(): [number, number][];
    set pointCoordinates(value: [number, number][]);
    getPointCount(): number;
    clone(): GeomObject;
    toString(): string;
    toArray(): any[];
    toObject(): object;
}
export default Polyline;
