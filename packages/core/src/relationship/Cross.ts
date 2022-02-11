import { Maths } from "@geomtoy/util";
import { optionerOf } from "../helper/Optioner";

import Line from "../shapes/basic/Line";
import Circle from "../shapes/basic/Circle";
import Point from "../shapes/basic/Point";
import Ray from "../shapes/basic/Ray";
import Rectangle from "../shapes/basic/Rectangle";
import Polygon from "../shapes/advanced/Polygon";
import LineSegment from "../shapes/basic/LineSegment";

import type { OwnerCarrier } from "../types";

class Cross {
    static verb = "Crosses" as const;
    static lineCrossesLine(this: OwnerCarrier, line: Line, otherLine: Line, quick: boolean) {
        if (!line.isParallelToLine(otherLine)) return false;
        if (quick) return true;
        const [a1, b1, c1] = line.getGeneralEquationParameters();
        const [a2, b2, c2] = otherLine.getGeneralEquationParameters();
        //`m` will not be equal to 0, we call `isParallelToLine` already
        const m = a1 * b2 - a2 * b1;
        const x = (c2 * b1 - c1 * b2) / m;
        const y = (c1 * a2 - c2 * a1) / m;
        return new Point(this.owner, x, y);
    }

    static circleCrossesCircle(this: OwnerCarrier, circle: Circle, otherCircle: Circle, quick: boolean) {
        return [new Point(this.owner), new Point(this.owner)] as [Point, Point];
    }
    static lineCrossesRay(this: OwnerCarrier, line: Line, ray: Ray, quick: boolean) {}

    static lineCrossesLineSegment(this: OwnerCarrier, line: Line, lineSegment: LineSegment, quick: boolean) {
        // If `line` is intersected with `lineSegment`, the signed distance of endpoints of `lineSegment` between `line` have different sign.
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = lineSegment;
        const [a, b, c] = line.getGeneralEquationParameters();
        const epsilon = optionerOf(this.owner).options.epsilon;
        const s1 = Maths.sign(a * x1 + b * y1 + c, epsilon);
        const s2 = Maths.sign(a * x2 + b * y2 + c, epsilon);
        if (quick) {
            return (s1 === 0) !== (s2 === 0) || s1 * s2 === -1;
        }

        const w = lineSegment.getLerpingRatioByLine(line);
        return new Point(this.owner, Maths.lerp(x1, x2, w), Maths.lerp(y1, y2, w));
    }

    static lineCrossesRectangle(this: OwnerCarrier, line: Line, rectangle: Rectangle, quick: boolean) {
        return Cross.lineCrossesPolygon.call(this, line, Polygon.fromRectangle.call(this, rectangle), quick);
    }

    static lineCrossesPolygon(this: OwnerCarrier, line: Line, polygon: Polygon, quick: boolean) {
        let ret = [] as Point[];
        const l = polygon.vertexCount;
        for (let i = polygon.closed ? 0 : 1; i < l; i++) {
            const ls = polygon.getLineSegment(i)!;
            const result = Cross.lineCrossesLineSegment.call(this, line, ls, false);
            if (result instanceof Point) {
                ret.push(result);
            }
        }
        if (quick) {
            return ret.length > 0;
        }
        return ret;
    }
}

export default Cross;
