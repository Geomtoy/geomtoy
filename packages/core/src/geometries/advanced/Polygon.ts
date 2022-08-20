import { Assert, Vector2, Maths, Type, Utility, Coordinates, Angle, Box } from "@geomtoy/util";
import { validGeometry } from "../../misc/decor-valid-geometry";
import { stated, statedWithBoolean } from "../../misc/decor-cache";
import Geometry from "../../base/Geometry";
import EventObject from "../../event/EventObject";
import Point from "../basic/Point";
import LineSegment from "../basic/LineSegment";
import Graphics from "../../graphics/GeometryGraphics";

import type { WindingDirection, FillRule, PolygonVertex, PolygonVertexWithUuid, ViewportDescriptor } from "../../types";
import type Transformation from "../../transformation";
import LineSegmentLineSegment from "../../relationship/classes/LineSegmentLineSegment";
import { next, prev } from "../../misc/loop";
import IntersectionDescriptor from "../../helper/IntersectionDescriptor";
import { lineSegmentPathIntegral } from "../../misc/area-integrate";
import FillRuleHelper from "../../helper/FillRuleHelper";
import ArrowGraphics from "../../helper/ArrowGraphics";
import { optioner } from "../../geomtoy";
import { getCoordinates } from "../../misc/point-like";

const POLYGON_MIN_VERTEX_COUNT = 2;

@validGeometry
export default class Polygon extends Geometry {
    private _vertices: PolygonVertexWithUuid[] = [];
    private _closed: boolean = true;
    private _fillRule: FillRule = "nonzero";

    constructor(vertices: PolygonVertex[], closed?: boolean, fillRule?: FillRule);
    constructor(closed: boolean, fillRule?: FillRule);
    constructor(fillRule: FillRule);
    constructor();
    constructor(a0?: any, a1?: any, a2?: any) {
        super();
        if (Type.isArray(a0)) {
            Object.assign(this, { vertices: a0, closed: a1 ?? this._closed, fillRule: a2 ?? this._fillRule });
        }
        if (Type.isBoolean(a0)) {
            Object.assign(this, { closed: a0, fillRule: a1 ?? this._fillRule });
        }
        if (Type.isString(a0)) {
            Object.assign(this, { fillRule: a0 });
        }
    }

    get events() {
        return {
            verticesReset: "reset" as const,
            vertexAdded: "vtxAdd" as const,
            vertexRemoved: "vtxRemove" as const,
            vertexChanged: "vtxChange" as const,
            closedChanged: "closedChange" as const,
            fillRuleChanged: "fillRuleChange" as const
        };
    }

    private _setVertices(value: PolygonVertex[]) {
        if (!Utility.isEqualTo(this._vertices, value)) this.trigger_(EventObject.simple(this, this.events.verticesReset));
        this._vertices = value.map(vtx => ({ ...vtx, uuid: Utility.uuid() }));
    }
    private _setClosed(value: boolean) {
        if (!Utility.isEqualTo(this._closed, value)) this.trigger_(EventObject.simple(this, this.events.closedChanged));
        this._closed = value;
    }
    private _setFillRule(value: FillRule) {
        if (!Utility.isEqualTo(this._fillRule, value)) this.trigger_(EventObject.simple(this, this.events.fillRuleChanged));
        this._fillRule = value;
    }

    get vertices(): PolygonVertexWithUuid[] {
        return this._vertices.map(vtx => ({ ...vtx }));
    }
    set vertices(value: PolygonVertex[]) {
        Assert.condition(Type.isArray(value) && value.every(vtx => this._isPolygonVertex(vtx)), "[G]The `vertices` should be an array of `PolygonVertex`.");
        this._setVertices(value);
    }
    get closed() {
        return this._closed;
    }
    set closed(value) {
        this._setClosed(value);
    }
    get fillRule() {
        return this._fillRule;
    }
    set fillRule(value) {
        this._setFillRule(value);
    }

    get vertexCount() {
        return this._vertices.length;
    }

    protected initialized_() {
        return this._vertices.length >= POLYGON_MIN_VERTEX_COUNT;
    }

    dimensionallyDegenerate() {
        if (!this.initialized_()) return true;
        const epsilon = optioner.options.epsilon;
        const vertices = this._vertices;
        const { x: x0, y: y0 } = vertices[0];

        for (let i = 1, l = this._vertices.length; i < l; i++) {
            const { x: xi, y: yi } = vertices[i];
            if (!Coordinates.isEqualTo([x0, y0], [xi, yi], epsilon)) {
                return false;
            }
        }
        return true;
    }

    static fromPoints(points: ([number, number] | Point)[]) {
        return new Polygon(points.map(p => Polygon.vertex(p)));
    }

    /**
     * @see https://en.wikibooks.org/wiki/Algorithm_Implementation/Geometry/Convex_hull/Monotone_chain
     */
    static convexHullFromPoints(points: ([number, number] | Point)[]) {
        if (points.length < POLYGON_MIN_VERTEX_COUNT) return null;
        if (points.length === POLYGON_MIN_VERTEX_COUNT) return new Polygon([Polygon.vertex(points[0]), Polygon.vertex(points[1])], true);

        const pointsCopy = [...points.map(p => getCoordinates(p, "points"))];
        Utility.sortBy(pointsCopy, [Coordinates.x, Coordinates.y]);

        const lower = [];
        for (let i = 0; i < pointsCopy.length; i++) {
            while (lower.length >= 2) {
                const v1 = Vector2.from(pointsCopy[i], lower[lower.length - 2]);
                const v2 = Vector2.from(pointsCopy[i], lower[lower.length - 1]);
                if (Vector2.cross(v1, v2) > 0) break;
                lower.pop();
            }
            lower.push(pointsCopy[i]);
        }
        const upper = [];
        for (let i = pointsCopy.length - 1; i >= 0; i--) {
            while (upper.length >= 2) {
                const v1 = Vector2.from(pointsCopy[i], upper[upper.length - 2]);
                const v2 = Vector2.from(pointsCopy[i], upper[upper.length - 1]);
                if (Vector2.cross(v1, v2) > 0) break;
                upper.pop();
            }
            upper.push(pointsCopy[i]);
        }
        upper.pop();
        lower.pop();
        return new Polygon(
            [...lower, ...upper].map(p => Polygon.vertex(p)),
            true
        );
    }

    static vertex(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        const ret: PolygonVertex = { x, y };
        return ret;
    }

    move(deltaX: number, deltaY: number) {
        Assert.isRealNumber(deltaX, "deltaX");
        Assert.isRealNumber(deltaY, "deltaY");
        if (deltaX === 0 && deltaY === 0) return this;

        this._vertices.forEach((vtx, i) => {
            [vtx.x, vtx.y] = Vector2.add([vtx.x, vtx.y], [deltaX, deltaY]);
            this.trigger_(EventObject.collection(this, this.events.vertexChanged, i, vtx.uuid));
        });
        return this;
    }

    moveAlongAngle(angle: number, distance: number) {
        Assert.isRealNumber(angle, "angle");
        Assert.isRealNumber(distance, "distance");
        if (distance === 0) return this;

        const c: [number, number] = [0, 0];
        const [dx, dy] = Vector2.add(c, Vector2.from2(angle, distance));
        return this.move(dx, dy);
    }

    private _isPolygonVertex(v: any): v is PolygonVertex {
        if (!Type.isPlainObject(v)) return false;
        if (!Type.isRealNumber(v.x)) return false;
        if (!Type.isRealNumber(v.y)) return false;
        return true;
    }
    private _assertIsPolygonVertex(value: PolygonVertex, p: string) {
        Assert.condition(this._isPolygonVertex(value), `[G]The \`${p}\` should be a \`PolygonVertex\`.`);
    }

    private _parseIndexOrUuid(indexOrUuid: number | string): [number, string] {
        let ret: [number, string] = [-1, ""];
        if (Type.isString(indexOrUuid)) {
            const index = this.getIndexOfUuid(indexOrUuid);
            if (index !== -1) ret = [index, indexOrUuid];
        } else {
            const uuid = this.getUuidOfIndex(indexOrUuid);
            if (uuid !== "") ret = [indexOrUuid, uuid];
        }
        return ret;
    }

    getUuids() {
        return this._vertices.map(vtx => vtx.uuid);
    }
    getIndexOfUuid(uuid: string) {
        return this._vertices.findIndex(vtx => vtx.uuid === uuid);
    }
    getUuidOfIndex(index: number) {
        return this._vertices[index]?.uuid ?? "";
    }
    /**
     * Get segment by `indexOrUuid`.
     * @note
     * The `closed` property does NOT effect this method, and it is assumed to be true.
     * @param indexOrUuid
     */
    getSegment(indexOrUuid: number | string) {
        const [index] = this._parseIndexOrUuid(indexOrUuid);
        if (index === -1) return null;
        const nextIndex = next(index, this.vertexCount, this.closed);
        if (nextIndex === -1) return null;
        const { x: x1, y: y1 } = this._vertices[index];
        const { x: x2, y: y2 } = this._vertices[nextIndex];
        return new LineSegment(x1, y1, x2, y2);
    }
    /**
     * Get segment by `indexOrUuid`.
     * @note
     * The `closed` property does NOT effect this method, and it is assumed to be true.
     * @param indexOrUuid
     */
    getSegmentClosed(indexOrUuid: number | string) {
        const [index] = this._parseIndexOrUuid(indexOrUuid);
        if (index === -1) return null;
        const { x: x1, y: y1 } = this._vertices[index];
        const { x: x2, y: y2 } = this._vertices[next(index, this.vertexCount, true)];
        return new LineSegment(x1, y1, x2, y2);
    }
    /**
     * Get all segments
     * @note
     * The `closed` property DOES effect this method.
     */

    /**
     * Get all segments.
     * @param excludeNotAllowed - Excluding the segments which degenerate to not allowed case.
     * @param assumeClosed - Regardless of the `closed` property, assumes it is true.
     * @returns
     */
    @statedWithBoolean(false, false)
    getSegments(excludeNotAllowed = false, assumeClosed = false) {
        const l = this.vertexCount;
        const cl = assumeClosed ? l : this.closed ? l : l - 1;

        const ret: LineSegment[] = [];
        for (let i = 0; i < cl; i++) {
            const segment = this.getSegment(i)!;
            if (excludeNotAllowed) {
                if (!segment.dimensionallyDegenerate()) {
                    ret.push(segment);
                }
            } else {
                ret.push(segment);
            }
        }
        return ret;
    }
    /**
     * Get previous segment by specifying the current index `indexOrUuid`.
     * @note
     * The `closed` property does NOT effect this method, and it is assumed to be true.
     * @param indexOrUuid
     */
    getPrevSegment(indexOrUuid: number | string, excludeNotAllowed = false, assumeClosed = false): [LineSegment | null, number] {
        let [index] = this._parseIndexOrUuid(indexOrUuid);
        if (index === -1) return [null, -1];
        const closed = assumeClosed || this.closed;
        index = prev(index, this.vertexCount, closed);
        let seg = this.getSegment(index)!;
        if (excludeNotAllowed) {
            while (seg.dimensionallyDegenerate()) {
                index = prev(index, this.vertexCount, closed);
                seg = this.getSegment(index)!;
            }
        }
        return [seg, index];
    }
    getPrevSegmentClosed() {}

    getNextSegment(indexOrUuid: number | string, excludeNotAllowed = false, assumeClosed = false): [LineSegment | null, number] {
        let [index] = this._parseIndexOrUuid(indexOrUuid);
        if (index === -1) return [null, -1];
        const closed = assumeClosed || this.closed;
        index = next(index, this.vertexCount, closed);
        let seg = this.getSegment(index)!;
        if (excludeNotAllowed) {
            while (seg.dimensionallyDegenerate()) {
                index = next(index, this.vertexCount, closed);
                seg = this.getSegment(index)!;
            }
        }
        return [seg, index];
    }

    /**
     * If segments are all collinear to each other, there is no so called `interior`, so no fill, no area,
     * no winding direction, no point inside or outside ....
     * @note
     * DO NOT use simple area to determine this. The simple area equal to 0 on a complex polygon only means the winding direction is
     * undetermined - the trend of positive winding is equal to the trend of negative winding.
     */
    isSegmentsCollinear() {
        const l = this.vertexCount;
        const epsilon = optioner.options.epsilon;

        if (this.vertexCount === POLYGON_MIN_VERTEX_COUNT) return true;
        const vertices = this._vertices;
        const { x: x0, y: y0 } = vertices[0];
        const { x: x1, y: y1 } = vertices[1];
        const v = Vector2.from([x0, y0], [x1, y1]);
        for (let i = 2; i < l; i++) {
            const { x, y } = vertices[i];
            if (Maths.equalTo(Vector2.cross(Vector2.from([x0, y0], [x, y]), v), 0, epsilon)) return false;
        }
        return true;
    }
    getPrevVertex(indexOrUuid: number | string) {
        let [index] = this._parseIndexOrUuid(indexOrUuid);
        if (index === -1) return null;
        index = prev(index, this.vertexCount, true);
        return this.getVertex(index);
    }
    getNextVertex(indexOrUuid: number | string) {
        let [index] = this._parseIndexOrUuid(indexOrUuid);
        if (index === -1) return null;
        index = next(index, this.vertexCount, true);
        return this.getVertex(index);
    }
    getVertex(indexOrUuid: number | string) {
        const [index] = this._parseIndexOrUuid(indexOrUuid);
        if (index === -1) return null;
        return { ...this._vertices[index] };
    }

    setVertex(indexOrUuid: number | string, vertex: PolygonVertex) {
        this._assertIsPolygonVertex(vertex, "vertex");

        const [index, uuid] = this._parseIndexOrUuid(indexOrUuid);
        if (index === -1) return false;

        const oldVtx = this._vertices[index];
        const newVtx = { ...vertex, uuid: oldVtx.uuid };

        if (!Utility.isEqualTo(oldVtx, newVtx)) {
            this.trigger_(EventObject.collection(this, this.events.vertexChanged, index, uuid));
            this._vertices[index] = newVtx;
        }
        return true;
    }
    insertVertex(indexOrUuid: number | string, vertex: PolygonVertex) {
        this._assertIsPolygonVertex(vertex, "vertex");

        const [index] = this._parseIndexOrUuid(indexOrUuid);
        if (index === -1) return false;
        const uuid = Utility.uuid();
        const vtx = { ...vertex, uuid };

        this.trigger_(EventObject.collection(this, this.events.vertexAdded, index + 1, uuid));
        this._vertices.splice(index, 0, vtx);
        return [index + 1, uuid] as [number, string];
    }
    removeVertex(indexOrUuid: number | string) {
        const [index, uuid] = this._parseIndexOrUuid(indexOrUuid);
        if (index === -1) return false;
        this.trigger_(EventObject.collection(this, this.events.vertexRemoved, index, uuid));
        this._vertices.splice(index, 1);
        return true;
    }
    appendVertex(vertex: PolygonVertex) {
        this._assertIsPolygonVertex(vertex, "vertex");

        const uuid = Utility.uuid();
        const vtx = { ...vertex, uuid };
        const index = this.vertexCount;

        this.trigger_(EventObject.collection(this, this.events.vertexAdded, index, uuid));
        this._vertices.push(vtx);
        return [index, uuid] as [number, string];
    }
    prependVertex(vertex: PolygonVertex): [number, string] {
        this._assertIsPolygonVertex(vertex, "vertex");

        const uuid = Utility.uuid();
        const vtx = { ...vertex, uuid };
        const index = 0;
        this.trigger_(EventObject.collection(this, this.events.vertexAdded, index, uuid));
        this._vertices.unshift(vtx);
        return [index, uuid] as [number, string];
    }

    isVerticesConcyclic() {}

    /**
     * Whether point `point` is on polygon `this`.
     * @note
     * The `closed` property DOES effect this method.
     * @param point
     */
    isPointOn(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        const l = this.vertexCount;
        const cl = this.closed ? l : l - 1;
        for (let i = 0; i < cl; i++) {
            if (this.getSegment(i)!.isPointOn(c)) return true;
        }
        return false;
    }
    /**
     * Whether point `point` is inside polygon `this`.
     * @note
     * The `closed` property does NOT effect this method, and it is assumed to be true.
     * @param point
     */
    isPointInside(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        const helper = new FillRuleHelper();
        if (this.fillRule === "nonzero") {
            const wn = helper.windingNumberOfPoint(c, 0, this.getSegments(true, true));
            if (wn === undefined) return false;
            return wn === 0 ? false : true;
        } else {
            const cn = helper.crossingNumberOfPoint(c, 0, this.getSegments(true, true));
            if (cn === undefined) return false;
            return cn % 2 === 0 ? false : true;
        }
    }
    /**
     * Whether point `point` is outside polygon `this`.
     * @note
     * The `closed` property does NOT effect this method, and it is assumed to be true.
     * @param point
     */
    isPointOutside(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        const helper = new FillRuleHelper();
        if (this.fillRule === "nonzero") {
            const wn = helper.windingNumberOfPoint(c, 0, this.getSegments(true, true));
            if (wn === undefined) return false;
            return wn === 0 ? true : false;
        } else {
            const cn = helper.crossingNumberOfPoint(c, 0, this.getSegments(true, true));
            if (cn === undefined) return false;
            return cn % 2 === 0 ? true : false;
        }
    }

    getLength() {
        return this.getSegments().reduce((acc, seg) => (acc += seg.getLength()), 0);
    }

    /**
     * Whether polygon `this` is a convex polygon.
     * @see: https://en.wikipedia.org/wiki/Convex_polygon
     * @see https://stackoverflow.com/questions/471962/how-do-i-efficiently-determine-if-a-polygon-is-convex-non-convex-or-complex/45372025#45372025
     */
    isConvex() {
        const l = this.vertexCount;
        const epsilon = optioner.options.epsilon;
        if (this.vertexCount === POLYGON_MIN_VERTEX_COUNT) return false;

        let startWindingDirection: WindingDirection | undefined;
        let angleSum = 0;
        for (let i = 0; i < l; i++) {
            const { x: x1, y: y1 } = this._vertices[i];
            const { x: x2, y: y2 } = this._vertices[i === l - 1 ? 0 : i + 1];
            const { x: x3, y: y3 } = this._vertices[i === l - 2 ? 1 : i + 2];

            const v1 = Vector2.from([x1, y1], [x2, y2]);
            const v2 = Vector2.from([x2, y2], [x3, y3]);
            const angle = Vector2.angleTo(v1, v2);
            // angle is `NaN` for zero vector, v1 or v2 is zero vector
            if (Number.isNaN(angle)) continue;
            if (Maths.equalTo(Maths.abs(angle), Maths.PI, epsilon)) return false;

            if (startWindingDirection === undefined) {
                startWindingDirection = angle > 0 ? 1 : angle < 0 ? -1 : undefined;
            }
            const currWindingDirection = angle > 0 ? 1 : angle < 0 ? -1 : undefined;
            if (currWindingDirection !== startWindingDirection) return false;

            angleSum += angle;
        }
        return Maths.equalTo(Maths.abs(angleSum), 2 * Maths.PI, epsilon);
    }
    private _selfIntersections() {
        const ret: {
            coordinates: [number, number];
            descriptor: IntersectionDescriptor;
        }[] = [];

        const epsilon = optioner.options.epsilon;
        const ignoreList: IntersectionDescriptor[] = []; // avoid redundant check

        for (let i = 0, m = this.vertexCount - 1; i < m; i++) {
            const segI = this.getSegment(i)!;

            for (let j = i + 1, n = this.vertexCount; j < n; j++) {
                // For polygon, The segment and the segment immediately after it do not need to check, but may need to be done in path,
                // in order to be consistent with the `path`, so here's a stupid piece of code, +1, and skip.
                if (j === i + 1) continue;
                const segJ = this.getSegment(j)!;

                // The relationship methods will handle the degeneration themselves.
                const intersection = new LineSegmentLineSegment(segI, segJ).intersection();
                intersection.forEach(inter => {
                    const t1Is0 = Maths.equalTo(inter.t1, 0, epsilon);
                    const t1Is1 = Maths.equalTo(inter.t1, 1, epsilon);
                    const t2Is0 = Maths.equalTo(inter.t2, 0, epsilon);
                    const t2Is1 = Maths.equalTo(inter.t2, 1, epsilon);

                    if (!t1Is0 && !t1Is1 && !t2Is0 && !t2Is1) {
                        ret.push({
                            coordinates: inter.c,
                            descriptor: new IntersectionDescriptor([i, inter.t1], [j, inter.t2])
                        });
                        return;
                    }
                    // t1Is0 || t1Is1 || t2Is0 || t2Is1

                    // handle coincident segments and coincident vertices
                    const [aInIndex, aInParam] = t1Is0 ? [this.getPrevSegment(i, true)![1], 1] : [i, inter.t1];
                    const [aOutIndex, aOutParam] = t1Is1 ? [this.getNextSegment(i, true)![1], 0] : [i, inter.t1];
                    const [bInIndex, bInParam] = t2Is0 ? [this.getPrevSegment(j, true)![1], 1] : [j, inter.t2];
                    const [bOutIndex, bOutParam] = t2Is1 ? [this.getNextSegment(j, true)![1], 0] : [j, inter.t2];

                    const desc = new IntersectionDescriptor([aInIndex, aInParam], [aOutIndex, aOutParam], [bInIndex, bInParam], [bOutIndex, bOutParam]);

                    if (ignoreList.findIndex(ignore => ignore.matchWith(desc, epsilon))) return;
                    ignoreList.push(desc);

                    ret.push({
                        coordinates: inter.c,
                        descriptor: desc
                    });
                });
            }
        }
        return ret;
    }

    /**
     * Get self-intersection of polygon `this`.
     * @memo
     * Why we don't use Sweep line algorithm mentioned in this page: https://stackoverflow.com/questions/4876065/is-there-an-easy-and-fast-way-of-checking-if-a-polygon-is-self-intersecting ?
     * The mentioned algorithm takes O(nLogn) time and has a certain complexity.
     * Although it has been implemented in some places, and be used to handle polygons.
     * It is unknown whether it can handle paths (and we don't want to brainless subdivide paths into polygons just to use this algorithm).
     * The current algorithm is the most naive way, takes O(n^2) time.
     * @note
     * - The `closed` property does NOT effect this method, and it is assumed to be true.
     * - Since the self-intersection may coincide or just be the same point, the `points` in the returned result may be duplicated.
     * - The `segmentIndices` property in returned value is in `[aInSegmentIndex: number, aOutSegmentIndex: number, bInSegmentIndex: number, bOutSegmentIndex: number]` pattern.
     * For an intersection, the segment arriving to it is `in`, and the segment leaving from it is `out`, here are some examples to explain this:
     *      - `[1, 1, 5, 5]` common intersection: segment 1 and segment 5 intersect.
     *      - `[1, 2, 5, 5]` intersection is at the end of 1-2: vertex 2.
     *      - `[1, 2, 5, 6]` intersection is at the end of 1-2 and end of 5-6: vertex 2 and vertex 6 coincide.
     *      - `[1, 3, 5, 7]` intersection is at the end of 1-3 and end of 5-7: segment 2 and segment 6 degenerate, and vertex 3 and vertex 7 coincide.
     * - Self-intersections are crossing points.
     */
    @stated
    selfIntersections() {
        return this._selfIntersections().map(inter => new Point(inter.coordinates));
    }

    /**
     * Returns a new polygon with all degenerate segments of polygon `this` cleaned except the last one.
     */
    clean() {
        const copyPoly = this.clone();
        let i = 0;
        while (i < copyPoly.vertexCount - 1) {
            if (copyPoly.getSegment(i)!.dimensionallyDegenerate()) {
                copyPoly.removeVertex(i);
                continue;
            }
            i++;
        }
        return copyPoly;
    }

    // @stated
    // decompose() {
    //     const selfIntersections = this._selfIntersections();
    //     if (selfIntersections.length === 0) return [this];

    //     const epsilon = this.options_.epsilon;
    //     const segments = this.getSegments(false, true);

    //     const intersections: [number, number][] = [];
    //     const segmentPortionView: {
    //         [segmentIndex: string]: [intersectionIndex: number, param: number][];
    //     } = {};

    //     selfIntersections.forEach(si => {
    //         const indexAndParams = si.descriptor.indexAndParams();

    //         indexAndParams.forEach(([segmentIndex, param]) => {
    //             if (segmentPortionView[segmentIndex] === undefined) segmentPortionView[segmentIndex] = [];
    //             let intersectionIndex = intersections.findIndex(c => Coordinates.isEqualTo(si.coordinates, c));
    //             if (intersectionIndex === -1) intersectionIndex = intersections.push(si.coordinates) - 1;
    //             const psIndex = segmentPortionView[segmentIndex].findIndex(ps => Maths.equalTo(ps[1], param, epsilon));
    //             if (psIndex === -1) segmentPortionView[segmentIndex].push([intersectionIndex, param]);
    //         });
    //     });

    //     // sort the param in segmentPortionView in ASC order
    //     Object.keys(segmentPortionView).forEach(key => Utility.sortBy(segmentPortionView[key], [([, p]) => p]));

    //     const segmentLinkedList = new LinkedList<{
    //         segment: LineSegment;
    //         point1IntersectionIndex?: number;
    //         point2IntersectionIndex?: number;
    //     }>(true);

    //     segments.forEach((segment, index) => {
    //         if (segment.dimensionallyDegenerate()) return;
    //         if (segmentPortionView[index]) {
    //             const startParam = 0; // always line segment, so 0
    //             const endParam = 1; // always line segment, so 1
    //             let currentNode = segmentLinkedList.push({ segment });

    //             segmentPortionView[index].forEach(([intersectionIndex, param]) => {
    //                 if (Maths.equalTo(param, startParam, epsilon)) {
    //                     currentNode.data.point1IntersectionIndex = intersectionIndex;
    //                 } else if (Maths.equalTo(param, endParam, epsilon)) {
    //                     currentNode.data.point2IntersectionIndex = intersectionIndex;
    //                 } else {
    //                     const [first, second] = currentNode.data.segment.splitAtTime(param);
    //                     currentNode.before({
    //                         segment: first,
    //                         point1IntersectionIndex: currentNode.data.point1IntersectionIndex,
    //                         point2IntersectionIndex: intersectionIndex
    //                     });
    //                     currentNode.after({
    //                         segment: second,
    //                         point1IntersectionIndex: intersectionIndex
    //                     });
    //                     currentNode.detach();
    //                 }
    //             });
    //         } else {
    //             segmentLinkedList.push({ segment });
    //         }
    //     });

    //     const subPolygons: Polygon[] = [];

    //     while (segmentLinkedList.size !== 0) {
    //         let currentNode = segmentLinkedList.head!;
    //         let indicesInChain: { node: typeof currentNode; intersectionIndex: number }[] = []; // intersection indices in the chain
    //         let found = false;

    //         while (!found) {
    //             const { point1IntersectionIndex: p1i, point2IntersectionIndex: p2i } = currentNode.data;
    //             // this is a `in`
    //             if (p2i) {
    //                 const index = indicesInChain.findIndex(iic => iic.intersectionIndex === p2i);
    //                 if (index !== -1) {
    //                     // we have a chain return to one of its owned intersections
    //                     // strip the chain down
    //                     const startNode = indicesInChain[index].node;
    //                     const endNode = currentNode;
    //                     const subPolygonSegmentList = segmentLinkedList.take(startNode, endNode).toArray();
    //                     const polygon = new Polygon(this.owner);
    //                     subPolygonSegmentList.forEach(({ segment }) => {
    //                         polygon.appendVertex(Polygon.vertex(segment.point1Coordinates));
    //                     });
    //                     subPolygons.push(polygon);
    //                     found = true;
    //                 }
    //             }
    //             // this is a `out`
    //             if (p1i) {
    //                 indicesInChain.push({
    //                     node: currentNode,
    //                     intersectionIndex: p1i
    //                 });
    //             }
    //             currentNode = currentNode.next!;
    //         }
    //     }

    //     return subPolygons;
    // }

    // private _getCrossingAndWindingNumberOfSubPolygon(subPolygon: Polygon) {
    //     let ret: [windingNumber: number, crossingNumber: number] = [0, 0];

    //     if (subPolygon.isSegmentsCollinear()) {
    //         return ret;
    //     }
    //     const epsilon = this.options_.epsilon;
    //     let coordinatesOfMaxX: [number, number] = [-Infinity, -Infinity]; // the coordinate of the max x value and it is not on a straight horizontal segment.

    //     subPolygon.getSegments(true, true).forEach(seg => {
    //         const bbox = seg.getBoundingBox();
    //         if (Maths.equalTo(Box.height(bbox), 0, epsilon)) return; // this is a straight horizontal segment

    //         const x = Box.maxX(bbox);
    //         if (x > Coordinates.x(coordinatesOfMaxX)) {
    //             const extrema: [point: Point, param: Number][] = seg.extrema();
    //             const index = extrema.findIndex(ex => Maths.equalTo(ex[0].x, x, epsilon));
    //             coordinatesOfMaxX = extrema[index][0].coordinates;
    //         }
    //     });

    //     // We assume here that the ray actually starts from a slightly smaller point of the `coordinatesOfMaxX` of this maximum non-horizontal segment,
    //     // and this slightly smaller point must be inside the current simple sub-polygon,
    //     // so when counting the winding number and crossing number, the `coordinatesOfMaxX` point is also need to be counted.
    //     const ray = new Ray(this.owner, coordinatesOfMaxX, 0);
    //     const l = this.vertexCount;
    //     let wn = 0; // wn winding number
    //     let cn = 0; // cn crossing number
    //     for (let i = 0; i < l; i++) {
    //         const seg = this.getSegment(i)!;
    //         const intersection = new RayLineSegment(this.owner, ray, seg).intersection();
    //         intersection.forEach(inter => {
    //             const angle = seg.getTangentVectorAtTime(inter.t2).angle;
    //             const angleUp = Angle.between(angle, 0, Maths.PI, true, true, true);
    //             const angleDown = Angle.between(angle, Maths.PI, 0, true, true, true);
    //             // if ray happens to cross the vertex of polygon, count as a half.
    //             if (Maths.equalTo(inter.t2, 0, epsilon) || Maths.equalTo(inter.t2, 1, epsilon)) {
    //                 if (angleUp) wn += 0.5;
    //                 if (angleDown) wn += -0.5;
    //                 cn += 0.5;
    //             } else {
    //                 if (angleUp) wn += 1;
    //                 if (angleDown) wn += -1;
    //                 cn += 1;
    //             }
    //         });
    //     }
    //     ret = [wn, cn];
    //     return ret;
    // }

    /**
     * Simple area calculation is of great significance,
     * it determines the main winding direction of the polygon (which winding direction has more trends),
     * but its absolute value is wrong in the case of self-intersection.
     */
    private _getSimpleArea() {
        const l = this.vertexCount;
        const vertices = this._vertices;
        let a = 0;
        for (let i = 0; i < l; i++) {
            const { x: x0, y: y0 } = vertices[i];
            const { x: x1, y: y1 } = vertices[next(i, l, true)];
            a += lineSegmentPathIntegral(x0, y0, x1, y1);
        }
        return a;
    }

    @stated
    getWindingDirection(): WindingDirection {
        return Maths.sign(this._getSimpleArea()) as WindingDirection;
    }
    reverse() {
        const copy = [...this._vertices].map(vtxWu => {
            const { uuid, ...vtx } = vtxWu;
            return vtx;
        });
        copy.reverse();
        this.vertices = copy;
    }

    @stated
    // getArea(signed = false) {
    //     const subPolygons = this.decompose();
    //     if (subPolygons.length === 1) {
    //         return signed ? this._getSimpleArea() : Maths.abs(this._getSimpleArea());
    //     }
    //     let a = 0;
    //     subPolygons.map(subPolygon => {
    //         const [wn, cn] = this._getCrossingAndWindingNumberOfSubPolygon(subPolygon);
    //         if (this.fillRule === "nonzero") {
    //             if (wn === 0) {
    //                 a -= Maths.abs(subPolygon._getSimpleArea()); // sub polygon is exterior
    //             } else {
    //                 a += Maths.abs(subPolygon._getSimpleArea()); // sub polygon is interior
    //             }
    //         } else {
    //             if (cn % 2 === 0) {
    //                 a -= Maths.abs(subPolygon._getSimpleArea()); // sub polygon is exterior
    //             } else {
    //                 a += Maths.abs(subPolygon._getSimpleArea()); // sub polygon is interior
    //             }
    //         }
    //     });
    //     return signed ? a * this.getWindingDirection() : a;
    // }

    // randomPointInside() {
    //     const epsilon = this.options_.epsilon;
    //     if (Maths.equalTo(this.getArea(), 0, epsilon)) {
    //         return null;
    //     }
    //     const [x, y, w, h] = this.getBoundingBox();
    //     let rnd: [number, number];
    //     do {
    //         rnd = [x + w * Maths.random(), y + h * Maths.random()];
    //     } while (!this.isPointInside(rnd));
    //     return new Point(this.owner, rnd);
    // }
    getCentroidPoint() {
        const l = this.vertexCount;
        let sumX = 0;
        let sumY = 0;

        for (let i = 0; i < l; i++) {
            const { x, y } = this._vertices[i];
            sumX += x;
            sumY += y;
        }
        return new Point(sumX / l, sumY / l);
    }
    /**
     * @see https://en.wikipedia.org/wiki/Centroid
     */
    getWeightedCentroidPoint() {
        const l = this.vertexCount;
        let a = 0;
        let sumX = 0;
        let sumY = 0;

        for (let i = 0; i < l; i++) {
            const { x: x1, y: y1 } = this._vertices[i];
            const { x: x2, y: y2 } = this._vertices[i === 1 - 1 ? 0 : i + 1];
            const cp = Vector2.cross([x1, y1], [x2, y2]);
            a += cp;
            sumX += (x1 + x2) * cp;
            sumY += (y1 + y2) * cp;
        }
        return new Point(sumX / a / 3, sumY / a / 3);
    }

    getBoundingBox() {
        let bbox = [Infinity, Infinity, -Infinity, -Infinity] as [number, number, number, number];
        this.getSegments().forEach(seg => {
            bbox = Box.extend(bbox, seg.getBoundingBox());
        });
        return bbox;
    }

    apply(transformation: Transformation) {
        const retPoly = this.clone();
        const l = retPoly.vertexCount;
        for (let i = 0; i < l; i++) {
            const { x, y } = retPoly._vertices[i];
            const [tx, ty] = transformation.transformCoordinates([x, y]);
            retPoly._vertices[i].x = tx;
            retPoly._vertices[i].y = ty;
        }
        return retPoly;
    }
    getGraphics(viewport: ViewportDescriptor) {
        const g = new Graphics();
        if (!this.initialized_()) return g;
        g.fillRule = this.fillRule;
        const [head, ...tail] = this._vertices;
        g.moveTo(head.x, head.y);
        tail.forEach(vtx => g.lineTo(vtx.x, vtx.y));
        if (this.closed) g.close();
        if (optioner.options.graphics.polygonSegmentArrow) {
            this.getSegments().forEach(segment => {
                const vector = segment.getTangentVectorAtTime(0.5, true);
                g.append(new ArrowGraphics(vector.point1Coordinates, vector.angle).getGraphics(viewport));
            });
        }
        return g;
    }
    clone() {
        return new Polygon(this.vertices, this.closed);
    }
    copyFrom(shape: Polygon | null) {
        if (shape === null) shape = new Polygon();
        this._setVertices(shape.vertices);
        return this;
    }
    toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\tclosed: ${this.closed},`,
            `\tvertices: [`,
            `${this.vertices.map(v => `\t\t{x: ${v.x}, y: ${v.y}}`).join(",\n")}`,
            `\t]`,
            `}`
        ].join("\n");
    }
    toArray(): any[] {
        throw new Error("Method not implemented.");
    }
    toObject(): object {
        throw new Error("Method not implemented.");
    }
}
