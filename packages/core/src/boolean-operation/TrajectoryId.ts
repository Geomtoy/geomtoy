import Arc from "../geometries/basic/Arc";
import Bezier from "../geometries/basic/Bezier";
import LineSegment from "../geometries/basic/LineSegment";
import QuadraticBezier from "../geometries/basic/QuadraticBezier";
import { BasicSegment } from "../types";

export default class TrajectoryID {
    private _number: number;
    private _type: string;

    constructor(segment: BasicSegment) {
        this._type = segment.name;
        this._number = TrajectoryID._trajectoryNumberPool[segment.name]++;
    }

    private static _trajectoryNumberPool = {
        [LineSegment.name]: 0,
        [QuadraticBezier.name]: 0,
        [Bezier.name]: 0,
        [Arc.name]: 0
    };

    negotiate(that: TrajectoryID) {
        if (this._type !== that._type) {
            throw new Error("[G]They are not the same type segments.");
        }
        return this._number < that._number ? this : that;
    }
    equalTo(that: TrajectoryID) {
        return this === that;
    }
}
