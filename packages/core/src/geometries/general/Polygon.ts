import { Assert, Box, Coordinates, Maths, Type, Utility, Vector2 } from "@geomtoy/util";
import Geometry from "../../base/Geometry";
import EventSourceObject from "../../event/EventSourceObject";
import { optioner } from "../../geomtoy";
import Graphics from "../../graphics";
import GeometryGraphic from "../../graphics/GeometryGraphic";
import ArrowGraphics from "../../helper/ArrowGraphics";
import FillRuleHelper from "../../helper/FillRuleHelper";
import { lineSegmentPathIntegral } from "../../misc/area-integrate";
import { stated, statedWithBoolean } from "../../misc/decor-cache";
import { validGeometry, validGeometryArguments } from "../../misc/decor-geometry";
import { next } from "../../misc/loop";
import { getCoordinates } from "../../misc/point-like";
import { parseSvgPolygon } from "../../misc/svg-polygon";
import LineSegmentLineSegment from "../../relationship/classes/LineSegmentLineSegment";
import type Transformation from "../../transformation";
import type { FillRule, PolygonVertex, ViewportDescriptor, WindingDirection } from "../../types";
import LineSegment from "../basic/LineSegment";
import Point from "../basic/Point";

const POLYGON_MIN_VERTEX_COUNT = 2;

@validGeometry
export default class Polygon extends Geometry {
    private _vertices: Required<PolygonVertex>[] = [];
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

    static override events = {
        verticesReset: "reset" as const,
        vertexAdded: "vtxAdd" as const,
        vertexRemoved: "vtxRemove" as const,
        vertexChanged: "vtxChange" as const,
        closedChanged: "closed" as const,
        fillRuleChanged: "fillRule" as const
    };

    private _setVertices(value: PolygonVertex[]) {
        this.trigger_(new EventSourceObject(this, Polygon.events.verticesReset));
        this._vertices = value.map(vtx => ({ ...vtx, id: Utility.id("PolygonVertex") }));
    }
    private _setClosed(value: boolean) {
        if (!Utility.isEqualTo(this._closed, value)) this.trigger_(new EventSourceObject(this, Polygon.events.closedChanged));
        this._closed = value;
    }
    private _setFillRule(value: FillRule) {
        if (!Utility.isEqualTo(this._fillRule, value)) this.trigger_(new EventSourceObject(this, Polygon.events.fillRuleChanged));
        this._fillRule = value;
    }

    get vertices(): Required<PolygonVertex>[] {
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

    initialized() {
        return this._vertices.length >= POLYGON_MIN_VERTEX_COUNT;
    }

    degenerate(check: false): Point | this | null;
    degenerate(check: true): boolean;
    @statedWithBoolean(undefined)
    degenerate(check: boolean) {
        if (!this.initialized()) return check ? true : null;

        const epsilon = optioner.options.epsilon;
        const vertices = this._vertices;
        const { x: x0, y: y0 } = vertices[0];

        for (let i = 1, l = this._vertices.length; i < l; i++) {
            const { x: xi, y: yi } = vertices[i];
            if (!Coordinates.isEqualTo([x0, y0], [xi, yi], epsilon)) {
                return check ? false : this;
            }
        }
        return check ? true : new Point(x0, y0);
    }

    static fromSVGString(data: string, closed = true) {
        const polygon = parseSvgPolygon(data);
        return new Polygon(polygon.vertices, closed);
    }

    static fromPoints(points: ([number, number] | Point)[]) {
        return new Polygon(points.map(p => Polygon.vertex(p)));
    }
    /**
     * @see https://en.wikibooks.org/wiki/Algorithm_Implementation/Geometry/Convex_hull/Monotone_chain
     */
    static fromPointsConvexHull(points: ([number, number] | Point)[]) {
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

    @validGeometryArguments
    static vertex(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        return { x, y } as PolygonVertex;
    }

    move(deltaX: number, deltaY: number) {
        Assert.isRealNumber(deltaX, "deltaX");
        Assert.isRealNumber(deltaY, "deltaY");
        if (deltaX === 0 && deltaY === 0) return this;

        this._vertices.forEach((vtx, i) => {
            [vtx.x, vtx.y] = Vector2.add([vtx.x, vtx.y], [deltaX, deltaY]);
            this.trigger_(new EventSourceObject(this, Polygon.events.vertexChanged, i, vtx.id));
        });
        return this;
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

    private _indexAt(indexOrId: number | string) {
        return Type.isString(indexOrId) ? this._vertices.findIndex(vtx => vtx.id === indexOrId) : this._vertices[indexOrId] !== undefined ? indexOrId : -1;
    }

    getIds() {
        return this._vertices.map(vtx => vtx.id);
    }
    getIndexOfId(id: string) {
        return this._vertices.findIndex(vtx => vtx.id === id);
    }
    getIdOfIndex(index: number) {
        return this._vertices[index]?.id ?? "";
    }

    // todo
    // getClosestPointFrom()

    // #region Segment
    /**
     * Get segment by `indexOrId`.
     * @param indexOrId
     * @param assumeClosed
     */
    getSegment(indexOrId: number | string, assumeClosed = false) {
        const index = this._indexAt(indexOrId);
        if (index === -1) return null;
        const closed = assumeClosed ? true : this.closed;
        const nextIndex = next(index, this.vertexCount, closed);
        if (nextIndex === -1) return null;
        const vtxCurr = this._vertices[index];
        const vtxNext = this._vertices[nextIndex];
        return new LineSegment(vtxCurr.x, vtxCurr.y, vtxNext.x, vtxNext.y);
    }
    /**
     * Get all segments.
     * @param clean - excluding the segments which degenerate to a point.
     * @param assumeClosed
     */
    @statedWithBoolean(false, false)
    getSegments(clean = false, assumeClosed = false) {
        const l = this.vertexCount;
        const cl = assumeClosed ? l : this.closed ? l : l - 1;

        const ret: LineSegment[] = [];
        for (let i = 0; i < cl; i++) {
            const segment = this.getSegment(i, assumeClosed)!;
            if (clean) {
                const dg = segment.degenerate(false);
                if (dg !== null && !(dg instanceof Point)) ret.push(segment);
            } else {
                ret.push(segment);
            }
        }
        return ret;
    }
    // #endregion

    // #region Vertex
    /**
     * Get vertex by `indexOrId`.
     * @param indexOrId
     */
    getVertex(indexOrId: number | string) {
        const index = this._indexAt(indexOrId);
        if (index === -1) return null;
        return { ...this._vertices[index] } as Required<PolygonVertex>;
    }
    setVertex(indexOrId: number | string, vertex: PolygonVertex) {
        this._assertIsPolygonVertex(vertex, "vertex");
        const index = this._indexAt(indexOrId);
        if (index === -1) return false;
        const id = this._vertices[index].id;

        const vtx = { ...vertex, id };

        if (!Utility.isEqualTo(this._vertices[index], vtx)) {
            this.trigger_(new EventSourceObject(this, Polygon.events.vertexChanged, index, id));
            this._vertices[index] = vtx;
        }
        return true;
    }
    insertVertex(indexOrId: number | string, vertex: PolygonVertex) {
        this._assertIsPolygonVertex(vertex, "vertex");
        const index = this._indexAt(indexOrId);
        if (index === -1) return false;
        const id = Utility.id("PolygonVertex");

        const vtx = { ...vertex, id };

        this.trigger_(new EventSourceObject(this, Polygon.events.vertexAdded, index, id));
        this._vertices.splice(index, 0, vtx);
        return [index, id] as [number, string];
    }
    removeVertex(indexOrId: number | string) {
        const index = this._indexAt(indexOrId);
        if (index === -1) return false;
        const id = this._vertices[index].id;

        this.trigger_(new EventSourceObject(this, Polygon.events.vertexRemoved, index, id));
        this._vertices.splice(index, 1);
        return true;
    }
    appendVertex(vertex: PolygonVertex) {
        this._assertIsPolygonVertex(vertex, "vertex");
        const index = this.vertexCount;
        const id = Utility.id("PolygonVertex");

        const vtx = { ...vertex, id };

        this.trigger_(new EventSourceObject(this, Polygon.events.vertexAdded, index, id));
        this._vertices.push(vtx);
        return [index, id] as [number, string];
    }
    prependVertex(vertex: PolygonVertex): [number, string] {
        this._assertIsPolygonVertex(vertex, "vertex");
        const index = 0;
        const id = Utility.id("PolygonVertex");

        const vtx = { ...vertex, id };

        this.trigger_(new EventSourceObject(this, Polygon.events.vertexAdded, index, id));
        this._vertices.unshift(vtx);
        return [index, id] as [number, string];
    }
    // #endregion

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

    /**
     * Whether polygon `this` is a convex polygon.
     * @see: https://en.wikipedia.org/wiki/Convex_polygon
     * @see https://stackoverflow.com/questions/471962/how-do-i-efficiently-determine-if-a-polygon-is-convex-non-convex-or-complex/45372025#45372025
     */
    isConvex() {
        const l = this.vertexCount;
        const epsilon = optioner.options.epsilon;
        if (this.vertexCount < 3) return false; // at least 3 segments

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

            angleSum += Maths.PI - angle;
        }
        return Maths.equalTo(Maths.abs(angleSum), 2 * Maths.PI, epsilon);
    }

    isConcave() {
        const l = this.vertexCount;
        const epsilon = optioner.options.epsilon;
        if (this.vertexCount < 4) return false; // at least 4 segments

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
            angleSum += Maths.PI - angle;
        }
        return Maths.equalTo(angleSum, (l - 1) * Maths.PI, epsilon);
    }
    isSelfIntersecting() {
        const segments = this.getSegments(true);
        for (let i = 0; i < segments.length - 1; i++) {
            for (let j = i + 1; j < segments.length; j++) {
                if (j === i + 1) continue;
                const intersection = new LineSegmentLineSegment(segments[i], segments[j]).intersection();
                if (intersection.length !== 0) return true;
            }
        }
        return false;
    }

    // #region Length, area, winding direction
    @stated
    getLength() {
        return this.getSegments(true).reduce((acc, seg) => (acc += seg.getLength()), 0);
    }
    /**
     * Get area(simple calculation) of polygon `this`.
     * @note
     * - If polygon `this` is a simple polygon, the returned result is correct.
     * - If polygon `this` is a complex polygon, you should do boolean operation - self union first.
     * Why do we need to compute a possibly wrong value?
     * It determines the main winding direction of the polygon (which winding direction has more trends).
     */
    @stated
    getArea() {
        const l = this.vertexCount;
        const vertices = this._vertices;
        let a = 0;
        for (let i = 0; i < l; i++) {
            const cmdCurr = vertices[i];
            const cmdNext = vertices[next(i, l, true)];
            const { x: x0, y: y0 } = cmdCurr;
            const { x: x1, y: y1 } = cmdNext;
            a += lineSegmentPathIntegral(x0, y0, x1, y1);
        }
        return a;
    }
    @stated
    getWindingDirection(): WindingDirection {
        return Maths.sign(this.getArea()) as WindingDirection;
    }
    // #endregion
    /**
     * Returns a new polygon with all segments degenerating to point of polygon `this` cleaned.
     */
    clean() {
        const retPolygon = new Polygon(this._closed, this._fillRule);
        const l = this.vertexCount;
        const cl = this.closed ? l : l - 1;
        const retVertices: PolygonVertex[] = [];

        retVertices.push(this._vertices[0]);
        for (let i = 1; i < cl; i++) {
            const dg = this.getSegment(i - 1)!.degenerate(false);
            if (dg !== null && !(dg instanceof Point)) {
                retVertices.push(this._vertices[i]);
            }
        }
        retPolygon.vertices = retVertices;
        return retPolygon;
    }
    reverse() {
        const copy = this._vertices.map(vtx => ({ ...vtx }));
        copy.reverse();
        this.vertices = copy;
        return this;
    }

    randomPointInside() {
        const epsilon = optioner.options.epsilon;
        if (Maths.equalTo(this.getArea(), 0, epsilon)) return null;
        const [x, y, w, h] = this.getBoundingBox();
        let rnd: [number, number];
        do {
            rnd = [x + w * Maths.random(), y + h * Maths.random()];
        } while (!this.isPointInside(rnd));
        return new Point(rnd);
    }
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
        let bbox = Box.nullBox();
        for (const seg of this.getSegments(true)) bbox = Box.extend(bbox, seg.getBoundingBox());
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
        const dg = this.degenerate(false);
        if (dg === null) return new Graphics();
        if (dg !== this) return (dg as Exclude<typeof dg, this>)!.getGraphics(viewport);

        const g = new Graphics();
        const gg = new GeometryGraphic();
        g.append(gg);
        gg.fillRule = this.fillRule;
        const [head, ...tail] = this._vertices;
        gg.moveTo(head.x, head.y);
        tail.forEach(vtx => gg.lineTo(vtx.x, vtx.y));
        if (this.closed) gg.close();
        if (optioner.options.graphics.polygonSegmentArrow) {
            this.getSegments(true).forEach(segment => {
                const vector = segment.getTangentVectorAtTime(0.5, true);
                g.concat(new ArrowGraphics(vector.point1Coordinates, vector.angle).getGraphics(viewport));
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
    override toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.id}){`,
            `\tclosed: ${this.closed},`,
            `\tfillRule: ${this.fillRule}`,
            `\tvertices: ${JSON.stringify(this._vertices)}`, 
            `}`
        ].join("\n");
    }
}
