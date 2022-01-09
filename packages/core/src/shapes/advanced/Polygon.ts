import { validAndWithSameOwner } from "../../decorator";
import math from "../../utility/math";
import util from "../../utility";
import vec2 from "../../utility/vec2";
import assert from "../../utility/assertion";
import coord from "../../utility/coord";

import Shape from "../../base/Shape";
import Point from "../basic/Point";
import Rectangle from "../basic/Rectangle";
import Triangle from "../basic/Triangle";
import Graphics from "../../graphics";
import EventObject from "../../event/EventObject";

import type Geomtoy from "../../geomtoy";
import type { OwnerCarrier, PolygonVertex, PolygonVertexWithUuid, TransformableShape } from "../../types";
import type Transformation from "../../transformation";
import LineSegment from "../basic/LineSegment";

const polygonMinVertexCount = 2;

class Polygon extends Shape implements TransformableShape {
    closed = true;
    private _vertices: PolygonVertexWithUuid[] = [];

    constructor(owner: Geomtoy, vertices: PolygonVertex[], closed?: boolean);
    constructor(owner: Geomtoy);
    constructor(o: Geomtoy, a1?: any, a2?: any) {
        super(o);
        if (util.isArray(a1)) {
            Object.assign(this, { vertices: a1, closed: a2 ?? true });
        }
        return Object.seal(this);
    }

    static readonly events = Object.freeze({
        verticesReset: "reset" as const,
        vertexAdded: "vtxAdd" as const,
        vertexRemoved: "vtxRemove" as const,
        vertexChanged: "vtxChange" as const
    });

    private _setVertices(value: PolygonVertex[]) {
        if (!util.isEqualTo(this._vertices, value)) this.trigger_(EventObject.simple(this, Polygon.events.verticesReset));
        this._vertices = value.map(vtx => {
            return { ...vtx, uuid: util.uuid() };
        });
    }

    get vertices(): PolygonVertex[] {
        return this._vertices.map(vtxWu => {
            const { uuid, ...vtx } = vtxWu;
            return vtx;
        });
    }
    set vertices(value) {
        assert.condition(util.isArray(value) && value.every(vtx => this._isPolygonVertex(vtx)), "[G]The `vertices` should be an array of `PolygonVertex`.");
        this._setVertices(value);
    }

    get vertexCount() {
        return this._vertices.length;
    }

    private get _vertexCoordinatesArray() {
        return this._vertices.map(v => [v.x, v.y] as [number, number]);
    }

    isValid() {
        const cs = this._vertexCoordinatesArray;
        const l = cs.length;
        if (l < polygonMinVertexCount) return false;

        const epsilon = this.options_.epsilon;
        const uniques: [number, number][] = [[NaN, NaN]];

        return cs.some(c => {
            if (uniques.every(uc => !coord.isSameAs(uc, c, epsilon))) uniques.push(c);
            if (uniques.length > polygonMinVertexCount) return true;
        });
    }

    static formingCondition = `There should be at least ${polygonMinVertexCount} distinct vertices in a \`Polygon\`.`;

    static fromPoints(this: OwnerCarrier, points: ([number, number] | Point)[]) {
        return new Polygon(
            this.owner,
            points.map(p => Polygon.vertex(p))
        );
    }
    static fromRectangle(this: OwnerCarrier, rectangle: Rectangle) {
        const [p1, p2, p3, p4] = rectangle.getCornerPoints();
        return new Polygon(this.owner, [Polygon.vertex(p1), Polygon.vertex(p2), Polygon.vertex(p3), Polygon.vertex(p4)]);
    }
    static fromTriangle(this: OwnerCarrier, triangle: Triangle) {
        const { point1Coordinates: c1, point2Coordinates: c2, point3Coordinates: c3 } = triangle;
        return new Polygon(this.owner, [Polygon.vertex(c1), Polygon.vertex(c2), Polygon.vertex(c3)]);
    }

    static vertex(point: [number, number] | Point) {
        const [x, y] = point instanceof Point ? point.coordinates : (assert.isCoordinates(point, "point"), point);
        const ret: PolygonVertex = { x, y };
        return ret;
    }

    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY);
    }
    moveSelf(deltaX: number, deltaY: number) {
        assert.isRealNumber(deltaX, "deltaX");
        assert.isRealNumber(deltaY, "deltaY");
        if (deltaX === 0 && deltaY === 0) return this;

        this._vertices.forEach((vtx, i) => {
            [vtx.x, vtx.y] = coord.move([vtx.x, vtx.y], deltaX, deltaY);
            this.trigger_(EventObject.collection(this, Polygon.events.vertexChanged, i, vtx.uuid));
        });
        return this;
    }
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance);
    }
    moveAlongAngleSelf(angle: number, distance: number) {
        assert.isRealNumber(angle, "angle");
        assert.isRealNumber(distance, "distance");
        if (distance === 0) return this;

        const c: [number, number] = [0, 0];
        const [dx, dy] = coord.moveAlongAngle(c, angle, distance);
        return this.moveSelf(dx, dy);
    }

    private _isPolygonVertex(v: any): v is PolygonVertex {
        if (!util.isPlainObject(v)) return false;
        if (Object.keys(v).length !== 2) return false;
        if (!util.isRealNumber(v.x)) return false;
        if (!util.isRealNumber(v.y)) return false;
        return true;
    }
    private _assertIsPolygonVertex(value: PolygonVertex, p: string) {
        assert.condition(this._isPolygonVertex(value), `[G]The \`${p}\` should be a \`PolygonVertex\`.`);
    }
    private _assertIsIndexOrUuid(value: number | string, p: string) {
        assert.condition(!util.isString(value) && !(util.isInteger(value) && value >= 0), `[G]The \`${p}\` should be a string or an integer greater than or equal to 0.`);
    }
    private _parseIndexOrUuid(indexOrUuid: number | string): [number, string] | [undefined, undefined] {
        if (util.isString(indexOrUuid)) {
            const index = this._vertices.findIndex(vtx => vtx.uuid === indexOrUuid);
            if (index !== -1) {
                return [index, indexOrUuid];
            }
        } else {
            if (math.inInterval(indexOrUuid, 0, this.vertexCount - 1)) {
                return [indexOrUuid, this._vertices[indexOrUuid].uuid];
            }
        }
        return [undefined, undefined];
    }

    getIndexOfUuid(uuid: string) {
        return this._vertices.findIndex(vtx => vtx.uuid === uuid);
    }
    getUuidOfIndex(index: number) {
        assert.isInteger(index, "index");
        return math.inInterval(index, 0, this.vertexCount - 1) ? this._vertices[index].uuid : "";
    }

    getLineSegment(indexOrUuid: number | string) {
        this._assertIsIndexOrUuid(indexOrUuid, "indexOrUuid");

        const [index] = this._parseIndexOrUuid(indexOrUuid);
        if (index === undefined) return null;

        const curr = util.nth(this._vertices, index)!;
        const prev = util.nth(this._vertices, index - 1)!;

        return new LineSegment(this.owner, prev.x, prev.y, curr.x, curr.y);
    }

    getVertex(indexOrUuid: number | string): PolygonVertex | null {
        this._assertIsIndexOrUuid(indexOrUuid, "indexOrUuid");
        const [index] = this._parseIndexOrUuid(indexOrUuid);
        if (index === undefined) return null;

        const { uuid, ...rest } = util.cloneDeep(this._vertices[index]);
        return rest;
    }

    setVertex(indexOrUuid: number | string, vertex: PolygonVertex) {
        this._assertIsIndexOrUuid(indexOrUuid, "indexOrUuid");
        this._assertIsPolygonVertex(vertex, "vertex");

        const [index, uuid] = this._parseIndexOrUuid(indexOrUuid);
        if (index === undefined || uuid === undefined) return false;

        const oldVtx = this._vertices[index];
        const newVtx = util.cloneDeep(oldVtx);
        util.assignDeep(newVtx, vertex);

        if (!util.isEqualTo(oldVtx, newVtx)) this.trigger_(EventObject.collection(this, Polygon.events.vertexChanged, index, uuid));
        this._vertices[index] = newVtx;
        return true;
    }
    insertVertex(indexOrUuid: number | string, vertex: PolygonVertex) {
        this._assertIsIndexOrUuid(indexOrUuid, "indexOrUuid");
        this._assertIsPolygonVertex(vertex, "vertex");

        const [index, uuid] = this._parseIndexOrUuid(indexOrUuid);
        if (index === undefined || uuid === undefined) return false;

        const vtx = Object.assign(util.cloneDeep(vertex), { uuid: util.uuid() });

        this.trigger_(EventObject.collection(this, Polygon.events.vertexAdded, index + 1, vtx.uuid));
        this._vertices.splice(index, 0, vtx);
        return [index + 1, vtx.uuid] as [number, string];
    }
    removeVertex(indexOrUuid: number | string) {
        this._assertIsIndexOrUuid(indexOrUuid, "indexOrUuid");

        const [index, uuid] = this._parseIndexOrUuid(indexOrUuid);
        if (index === undefined || uuid === undefined) return false;

        this.trigger_(EventObject.collection(this, Polygon.events.vertexRemoved, index, uuid));
        this._vertices.splice(index, 1);
        return true;
    }

    appendVertex(vertex: PolygonVertex) {
        this._assertIsPolygonVertex(vertex, "vertex");

        const vtx = Object.assign(util.cloneDeep(vertex), { uuid: util.uuid() });
        const index = this.vertexCount;

        this.trigger_(EventObject.collection(this, Polygon.events.vertexAdded, index, vtx.uuid));
        this._vertices.push(vtx);
        return [index, vtx.uuid] as [number, string];
    }
    prependVertex(vertex: PolygonVertex): [number, string] {
        this._assertIsPolygonVertex(vertex, "vertex");

        const vtx = Object.assign(util.cloneDeep(vertex), { uuid: util.uuid() });
        const index = 0;
        this.trigger_(EventObject.collection(this, Polygon.events.vertexAdded, index, vtx.uuid));
        this._vertices.unshift(vtx);
        return [index, vtx.uuid] as [number, string];
    }

    isPointsConcyclic() {}

    isPointOn() {}
    isPointOutside() {}

    isPointInside() {}

    getPerimeter() {
        const l = this.vertexCount;
        const cs = this._vertexCoordinatesArray;
        let p = 0;

        util.range(0, l).forEach(index => {
            const c1 = util.nth(cs, index - l)!;
            const c2 = util.nth(cs, index - l + 1)!;
            p += vec2.magnitude(vec2.from(c1, c2));
        });
        return p;
    }

    getArea() {
        const l = this.vertexCount;
        const cs = this._vertexCoordinatesArray;
        let a = 0;

        util.range(0, l).forEach(index => {
            const c1 = util.nth(cs, index - l)!;
            const c2 = util.nth(cs, index - l + 1)!;
            a += vec2.cross(c1, c2);
        });
        a = a / 2;
        return math.abs(a);
    }
    getCentroidPoint() {
        const l = this.vertexCount;
        const cs = this._vertexCoordinatesArray;
        let sumX = 0;
        let sumY = 0;

        for (let i = 0; i < l; i++) {
            const [x, y] = cs[i];
            sumX += x;
            sumY += y;
        }
        return new Point(this.owner, sumX / l, sumY / l);
    }
    getWeightedCentroidPoint() {
        const l = this.vertexCount;
        const cs = this._vertexCoordinatesArray;
        let a = 0;
        let sumX = 0;
        let sumY = 0;

        for (let i = 0; i < l; i++) {
            const j = i === 1 - 1 ? 0 : i + 1;
            const [x1, y1] = cs[i];
            const [x2, y2] = cs[j];
            const cp = vec2.cross([x1, y1], [x2, y2]);
            a += cp;
            sumX += (x1 + x2) * cp;
            sumY += (y1 + y2) * cp;
        }
        return new Point(this.owner, sumX / a / 3, sumY / a / 3);
    }

    getBoundingRectangle() {
        let minX = math.Infinity;
        let maxX = -math.Infinity;
        let minY = math.Infinity;
        let maxY = -math.Infinity;
        this._vertexCoordinatesArray.forEach((_, index, collection) => {
            const [x, y] = collection[index];
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        });
        return new Rectangle(this.owner, minX, minY, maxX - minX, maxY - minY);
    }

    isPointOnPolygon(point: Point) {
        let l = this.vertexCount,
            cs = this._vertexCoordinatesArray,
            c = point.coordinates,
            epsilon = this.options_.epsilon,
            ret = false;
        util.range(0, l).forEach(index => {
            if (coord.isSameAs(c, cs[index], epsilon)) {
                ret = true;
                return; // `point` is a vertex
            }
            let c1 = util.nth(cs, index - l)!,
                c2 = util.nth(cs, index - l + 1)!;
            if (coord.y(c1) > coord.y(c) !== coord.y(c2) > coord.y(c)) {
                let cp = vec2.cross(vec2.from(c1, c), vec2.from(c1, c2));
                if (math.equalTo(cp, 0, epsilon)) {
                    ret = true;
                    return;
                }
            }
        });
        return ret;
    }
    isPointInsidePolygon(point: Point) {
        let l = this.vertexCount,
            cs = this._vertexCoordinatesArray,
            c = point.coordinates,
            epsilon = this.options_.epsilon,
            ret = false;
        util.range(0, l).forEach(index => {
            let c1 = util.nth(cs, index - l)!,
                c2 = util.nth(cs, index - l + 1)!;
            if (coord.y(c1) > coord.y(c) !== coord.y(c2) > coord.y(c)) {
                let cp = vec2.cross(vec2.from(c1, c), vec2.from(c1, c2));
                if (math.lessThan(cp, 0, epsilon) !== coord.y(c2) < coord.y(c1)) {
                    ret = true;
                    return;
                }
            }
        });
        return ret;
    }

    isPointOutsidePolygon(point: Point) {
        return !this.isPointInsidePolygon(point) && !this.isPointOnPolygon(point);
    }

    apply(transformation: Transformation): Shape {
        throw new Error("Method not implemented.");
    }
    getGraphics() {
        const g = new Graphics();
        if (!this.isValid()) return g;
        const cs = this._vertexCoordinatesArray;
        g.moveTo(...util.head(cs)!);
        util.tail(cs).forEach(c => {
            g.lineTo(...c);
        });
        if (this.closed) {
            g.close();
        }
        return g;
    }
    clone() {
        return new Polygon(this.owner, this.vertices);
    }
    copyFrom(shape: Polygon | null) {
        if (shape === null) shape = new Polygon(this.owner);
        this._setVertices(shape.vertices);
        return this;
    }
    toString(): string {
        throw new Error("Method not implemented.");
    }
    toArray(): any[] {
        throw new Error("Method not implemented.");
    }
    toObject(): object {
        throw new Error("Method not implemented.");
    }
}

validAndWithSameOwner(Polygon);

export default Polygon;
