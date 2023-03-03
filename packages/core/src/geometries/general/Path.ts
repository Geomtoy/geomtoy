import { Angle, Assert, Box, Coordinates, Maths, Type, Utility, Vector2 } from "@geomtoy/util";
import Geometry from "../../base/Geometry";
import EventSourceObject from "../../event/EventSourceObject";
import { optioner } from "../../geomtoy";
import Graphics from "../../graphics";
import GeometryGraphic from "../../graphics/GeometryGraphic";
import ArrowGraphics from "../../helper/ArrowGraphics";
import FillRuleHelper from "../../helper/FillRuleHelper";
import { correctRadii, endpointParameterizationTransform, endpointToCenterParameterization } from "../../misc/arc";
import { arcPathIntegral, bezierPathIntegral, lineSegmentPathIntegral, quadraticBezierPathIntegral } from "../../misc/area-integrate";
import { stated, statedWithBoolean } from "../../misc/decor-cache";
import { validGeometry } from "../../misc/decor-geometry";
import { next } from "../../misc/loop";
import { getCoordinates } from "../../misc/point-like";
import { parseSvgPath } from "../../misc/svg-path";
import type Transformation from "../../transformation";
import {
    PathCommandType,
    type FillRule,
    type PathArcToCommand,
    type PathBezierToCommand,
    type PathCommand,
    type PathLineToCommand,
    type PathMoveToCommand,
    type PathQuadraticBezierToCommand,
    type PolygonVertex,
    type ViewportDescriptor,
    type WindingDirection
} from "../../types";
import Arc from "../basic/Arc";
import Bezier from "../basic/Bezier";
import LineSegment from "../basic/LineSegment";
import Point from "../basic/Point";
import QuadraticBezier from "../basic/QuadraticBezier";

const PATH_MIN_COMMAND_COUNT = 2;

@validGeometry
export default class Path extends Geometry {
    private _commands: Required<PathCommand>[] = [];
    private _closed: boolean = true;
    private _fillRule: FillRule = "nonzero";

    constructor(commands: PathCommand[], closed?: boolean, fillRule?: FillRule);
    constructor(closed: boolean, fillRule?: FillRule);
    constructor(fillRule: FillRule);
    constructor();
    constructor(a0?: any, a1?: any, a2?: any) {
        super();
        if (Type.isArray(a0)) {
            Object.assign(this, { commands: a0, closed: a1 ?? this._closed, fillRule: a2 ?? this._fillRule });
        }
        if (Type.isBoolean(a0)) {
            Object.assign(this, { closed: a0, fillRule: a1 ?? this._fillRule });
        }
        if (Type.isString(a0)) {
            Object.assign(this, { fillRule: a0 });
        }
    }

    static override events = {
        commandsReset: "reset" as const,
        commandAdded: "cmdAdd" as const,
        commandRemoved: "cmdRemove" as const,
        commandChanged: "cmdChange" as const,
        closedChanged: "closed" as const,
        fillRuleChanged: "fillRule" as const
    };

    private _setCommands(value: PathCommand[]) {
        const commands: Required<PathCommand>[] = value.map(cmd => {
            return { ...cmd, id: Utility.id("PathCommand") };
        });

        let firstMoveToIndex = commands.findIndex(cmd => cmd.type === PathCommandType.MoveTo);
        let temp: Required<PathCommand> | null = null;

        for (let i = 0, l = commands.length; i < l; i++) {
            const cmd = commands[i];

            if (i < firstMoveToIndex) {
                if (temp === null) {
                    // this is the first command if we have `moveTo` but not first
                    commands[i] = { ...Path.moveTo([cmd.x, cmd.y]), id: cmd.id };
                    temp = cmd;
                } else {
                    commands[i] = this._reverseCommand(temp, cmd.x, cmd.y);
                    temp = cmd;
                }
            }
            if (i === firstMoveToIndex) {
                if (temp !== null) {
                    commands[i] = this._reverseCommand(temp, cmd.x, cmd.y);
                } else {
                    // do nothing, `i` is the first command and is `moveTo`.
                }
            }
            if (i > firstMoveToIndex) {
                if (firstMoveToIndex === -1) {
                    // this is the first command if we do not have `moveTo
                    commands[i] = { ...Path.moveTo([cmd.x, cmd.y]), id: cmd.id };
                    firstMoveToIndex = 0;
                } else {
                    if (cmd.type === PathCommandType.MoveTo) {
                        commands[i] = { ...Path.lineTo([cmd.x, cmd.y]), id: cmd.id };
                    }
                }
            }
        }
        this.trigger_(new EventSourceObject(this, Path.events.commandsReset));
        this._commands = commands;
    }
    private _setClosed(value: boolean) {
        if (!Utility.isEqualTo(this._closed, value)) this.trigger_(new EventSourceObject(this, Path.events.closedChanged));
        this._closed = value;
    }
    private _setFillRule(value: FillRule) {
        if (!Utility.isEqualTo(this._fillRule, value)) this.trigger_(new EventSourceObject(this, Path.events.fillRuleChanged));
        this._fillRule = value;
    }

    get commands(): Required<PathCommand>[] {
        return this._commands.map(cmd => ({ ...cmd }));
    }
    set commands(value: PathCommand[]) {
        Assert.condition(Type.isArray(value) && value.every(cmd => this._isPathCommand(cmd)), "[G]The `commands` should be an array of `PathCommand`.");
        this._setCommands(value);
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
    get commandCount() {
        return this._commands.length;
    }

    initialized() {
        return this._commands.length >= PATH_MIN_COMMAND_COUNT;
    }

    degenerate(check: false): Point | this | null;
    degenerate(check: true): boolean;
    @statedWithBoolean(undefined)
    degenerate(check: boolean) {
        if (!this.initialized()) return check ? true : null;

        const epsilon = optioner.options.epsilon;
        const commands = this._commands;
        const { x: x0, y: y0 } = commands[0];

        for (let i = 1, l = this._commands.length; i < l; i++) {
            const { x: xi, y: yi, type } = commands[i];
            if (!Coordinates.isEqualTo([x0, y0], [xi, yi], epsilon)) return check ? false : this;

            if (type === PathCommandType.QuadraticBezierTo) {
                const { controlPointX: cpx, controlPointY: cpy } = commands[i] as PathQuadraticBezierToCommand;
                if (!Coordinates.isEqualTo([x0, y0], [cpx, cpy], epsilon)) return check ? false : this;
            }
            if (type === PathCommandType.BezierTo) {
                const { controlPoint1X: cp1x, controlPoint1Y: cp1y, controlPoint2X: cp2x, controlPoint2Y: cp2y } = commands[i] as PathBezierToCommand;
                if (!Coordinates.isEqualTo([x0, y0], [cp1x, cp1y], epsilon) || !Coordinates.isEqualTo([x0, y0], [cp2x, cp2y], epsilon)) return check ? false : this;
            }
        }
        return check ? true : new Point(x0, y0);
    }

    static fromSVGString(data: string) {
        const paths = parseSvgPath(data);
        return new Path(paths[0].commands, paths[0].closed);
    }

    static fromBezierThroughPointsSmoothly(points: Point[] | [number, number][], closed = false) {}

    static fromQuadraticBezierThroughPointsSmoothly(points: Point[] | [number, number][], closed = false) {}

    static moveTo(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        return {
            type: PathCommandType.MoveTo,
            x,
            y
        } as PathMoveToCommand;
    }
    static lineTo(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        return {
            type: PathCommandType.LineTo,
            x,
            y
        } as PathLineToCommand;
    }
    static bezierTo(controlPoint1: [number, number] | Point, controlPoint2: [number, number] | Point, point: [number, number] | Point) {
        const [controlPoint1X, controlPoint1Y] = getCoordinates(controlPoint1, "controlPoint1");
        const [controlPoint2X, controlPoint2Y] = getCoordinates(controlPoint2, "controlPoint2");
        const [x, y] = getCoordinates(point, "point");
        return {
            type: PathCommandType.BezierTo,
            x,
            y,
            controlPoint1X,
            controlPoint1Y,
            controlPoint2X,
            controlPoint2Y
        } as PathBezierToCommand;
    }
    static quadraticBezierTo(controlPoint: [number, number] | Point, point: [number, number] | Point) {
        const [controlPointX, controlPointY] = getCoordinates(controlPoint, "controlPoint");
        const [x, y] = getCoordinates(point, "point");
        return {
            type: PathCommandType.QuadraticBezierTo,
            x,
            y,
            controlPointX,
            controlPointY
        } as PathQuadraticBezierToCommand;
    }
    static arcTo(radiusX: number, radiusY: number, rotation: number, largeArc: boolean, positive: boolean, point: [number, number] | Point) {
        Assert.isPositiveNumber(radiusX, "radiusX");
        Assert.isPositiveNumber(radiusY, "radiusY");
        Assert.isRealNumber(rotation, "rotation");
        const [x, y] = getCoordinates(point, "point");
        return {
            type: PathCommandType.ArcTo,
            x,
            y,
            radiusX,
            radiusY,
            rotation,
            largeArc,
            positive
        } as PathArcToCommand;
    }

    move(deltaX: number, deltaY: number) {
        Assert.isRealNumber(deltaX, "deltaX");
        Assert.isRealNumber(deltaY, "deltaY");
        if (deltaX === 0 && deltaY === 0) return this;

        this._commands.forEach((cmd, i) => {
            switch (cmd.type) {
                case PathCommandType.MoveTo: {
                    [cmd.x, cmd.y] = Vector2.add([cmd.x, cmd.y], [deltaX, deltaY]);
                    break;
                }
                case PathCommandType.LineTo: {
                    [cmd.x, cmd.y] = Vector2.add([cmd.x, cmd.y], [deltaX, deltaY]);
                    break;
                }
                case PathCommandType.BezierTo: {
                    [cmd.controlPoint1X, cmd.controlPoint1Y] = Vector2.add([cmd.controlPoint1X, cmd.controlPoint1Y], [deltaX, deltaY]);
                    [cmd.controlPoint2X, cmd.controlPoint2Y] = Vector2.add([cmd.controlPoint2X, cmd.controlPoint2Y], [deltaX, deltaY]);
                    [cmd.x, cmd.y] = Vector2.add([cmd.x, cmd.y], [deltaX, deltaY]);
                    break;
                }
                case PathCommandType.QuadraticBezierTo: {
                    [cmd.controlPointX, cmd.controlPointY] = Vector2.add([cmd.controlPointX, cmd.controlPointY], [deltaX, deltaY]);
                    [cmd.x, cmd.y] = Vector2.add([cmd.x, cmd.y], [deltaX, deltaY]);
                    break;
                }
                case PathCommandType.ArcTo: {
                    [cmd.x, cmd.y] = Vector2.add([cmd.x, cmd.y], [deltaX, deltaY]);
                    break;
                }
            }
            this.trigger_(new EventSourceObject(this, Path.events.commandChanged, i, cmd.id));
        });
        return this;
    }

    private _isPathCommand(v: any): v is PathCommand {
        if (!Type.isPlainObject(v)) return false;
        if (!v.type) return false;
        switch (v.type) {
            case PathCommandType.MoveTo: {
                if (!Type.isRealNumber(v.x)) return false;
                if (!Type.isRealNumber(v.y)) return false;
                return true;
            }
            case PathCommandType.LineTo: {
                if (!Type.isRealNumber(v.x)) return false;
                if (!Type.isRealNumber(v.y)) return false;
                return true;
            }
            case PathCommandType.BezierTo: {
                if (!Type.isRealNumber(v.x)) return false;
                if (!Type.isRealNumber(v.y)) return false;
                if (!Type.isRealNumber(v.controlPoint1X)) return false;
                if (!Type.isRealNumber(v.controlPoint1Y)) return false;
                if (!Type.isRealNumber(v.controlPoint2X)) return false;
                if (!Type.isRealNumber(v.controlPoint2Y)) return false;
                return true;
            }
            case PathCommandType.QuadraticBezierTo: {
                if (!Type.isRealNumber(v.x)) return false;
                if (!Type.isRealNumber(v.y)) return false;
                if (!Type.isRealNumber(v.controlPointX)) return false;
                if (!Type.isRealNumber(v.controlPointY)) return false;
                return true;
            }
            case PathCommandType.ArcTo: {
                if (!Type.isRealNumber(v.x)) return false;
                if (!Type.isRealNumber(v.y)) return false;
                if (!Type.isNonNegativeNumber(v.radiusX)) return false;
                if (!Type.isNonNegativeNumber(v.radiusY)) return false;
                if (!Type.isRealNumber(v.rotation)) return false;
                // if (!Type.isBoolean(v.largeArc)) return false;
                // if (!Type.isBoolean(v.positive)) return false;
                return true;
            }
            default: {
                return false;
            }
        }
    }
    private _assertIsPathCommand(value: PathCommand, p: string) {
        Assert.condition(this._isPathCommand(value), `[G]The \`${p}\` should be a \`PathCommand\`.`);
    }
    private _indexAt(indexOrId: number | string): number {
        return Type.isString(indexOrId) ? this._commands.findIndex(cmd => cmd.id === indexOrId) : this._commands[indexOrId] !== undefined ? indexOrId : -1;
    }

    getIds() {
        return this._commands.map(cmd => cmd.id);
    }
    getIndexOfId(id: string) {
        return this._commands.findIndex(cmd => cmd.id === id);
    }
    getIdOfIndex(index: number) {
        return this._commands[index]?.id ?? "";
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
        const nextIndex = next(index, this.commandCount, closed);
        if (nextIndex === -1) return null;

        const cmdCurr = this._commands[index];
        const cmdNext = this._commands[nextIndex];
        const type = cmdNext.type;

        switch (type) {
            case PathCommandType.MoveTo: {
                return new LineSegment(cmdCurr.x, cmdCurr.y, cmdNext.x, cmdNext.y);
            }
            case PathCommandType.LineTo: {
                return new LineSegment(cmdCurr.x, cmdCurr.y, cmdNext.x, cmdNext.y);
            }
            case PathCommandType.BezierTo: {
                return new Bezier(cmdCurr.x, cmdCurr.y, cmdNext.x, cmdNext.y, cmdNext.controlPoint1X, cmdNext.controlPoint1Y, cmdNext.controlPoint2X, cmdNext.controlPoint2Y);
            }
            case PathCommandType.QuadraticBezierTo: {
                return new QuadraticBezier(cmdCurr.x, cmdCurr.y, cmdNext.x, cmdNext.y, cmdNext.controlPointX, cmdNext.controlPointY);
            }
            case PathCommandType.ArcTo: {
                // correctRadii
                const { x: x1, y: y1 } = cmdCurr;
                const { x: x2, y: y2, radiusX, radiusY, rotation } = cmdNext;
                const [rx, ry] = correctRadii(x1, y1, x2, y2, radiusX, radiusY, rotation);
                return new Arc(cmdCurr.x, cmdCurr.y, cmdNext.x, cmdNext.y, rx, ry, cmdNext.largeArc, cmdNext.positive, cmdNext.rotation);
            }
            default: {
                throw new Error("[G]This should never happen.");
            }
        }
    }
    /**
     * Get all segments.
     * @param clean - excluding the segments which degenerate to a point.
     * @param assumeClosed
     */
    @statedWithBoolean(false, false)
    getSegments(clean = false, assumeClosed = false) {
        const l = this.commandCount;
        const cl = assumeClosed ? l : this.closed ? l : l - 1;
        const ret: (LineSegment | QuadraticBezier | Bezier | Arc)[] = [];
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
    /**
     * Whether point `point` is on path `this`.
     * @note
     * The `closed` property DOES effect this method.
     * @param point
     */
    isPointOn(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        const l = this.commandCount;
        const cl = this.closed ? l : l - 1;
        for (let i = 0; i < cl; i++) {
            if (this.getSegment(i)!.isPointOn(c)) return true;
        }
        return false;
    }
    /**
     * Whether point `point` is inside path `this`.
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
     * Whether point `point` is outside path `this`.
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

    private _reverseCommand<T extends PathCommand | Required<PathCommand>>(command: T, x: number, y: number) {
        switch (command.type) {
            case PathCommandType.MoveTo: {
                return { ...command, x, y } as T;
            }
            case PathCommandType.LineTo: {
                return { ...command, x, y } as T;
            }
            case PathCommandType.QuadraticBezierTo: {
                return { ...command, x, y } as T;
            }
            case PathCommandType.BezierTo: {
                const { controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y } = command as PathBezierToCommand;
                return { ...command, controlPoint1X: controlPoint2X, controlPoint1Y: controlPoint2Y, controlPoint2X: controlPoint1X, controlPoint2Y: controlPoint1Y, x, y } as T;
            }
            case PathCommandType.ArcTo: {
                const { positive } = command as PathArcToCommand;
                return { ...command, positive: !positive, x, y } as T;
            }
        }
    }

    getVertex(indexOrId: number | string) {
        const index = this._indexAt(indexOrId);
        if (index === -1) return null;
        const { x, y, id } = this._commands[index];
        return { x, y, id } as Required<PolygonVertex>;
    }

    // #region Command
    getCommand(indexOrId: number | string) {
        const index = this._indexAt(indexOrId);
        if (index === -1) return null;
        return { ...this._commands[index] } as Required<PathCommand>;
    }

    setCommand(indexOrId: number | string, command: PathCommand) {
        this._assertIsPathCommand(command, "command");
        const index = this._indexAt(indexOrId);
        if (index === -1) return false;
        const id = this._commands[index].id;

        // handle `moveTo`
        // prettier-ignore
        let cmd =
                index === 0 && command.type !== PathCommandType.MoveTo
                ? { ...Path.moveTo([command.x, command.y]), id }
                : index !== 0 && command.type === PathCommandType.MoveTo
                ? { ...Path.lineTo([command.x, command.y]), id }
                : { ...command, id };

        if (!Utility.isEqualTo(this._commands[index], cmd)) {
            this.trigger_(new EventSourceObject(this, Path.events.commandChanged, index, id));
            this._commands[index] = cmd;
        }
        return true;
    }
    insertCommand(indexOrId: number | string, command: PathCommand) {
        this._assertIsPathCommand(command, "command");
        const index = this._indexAt(indexOrId);
        if (index === -1) return false;
        const id = Utility.id("PathCommand");

        if (index === 0) return this.prependCommand(command);

        // handle `moveTo`
        // prettier-ignore
        let cmd = 
            command.type === PathCommandType.MoveTo 
            ? { ...Path.lineTo([command.x, command.y]), id } 
            : { ...command, id };

        this.trigger_(new EventSourceObject(this, Path.events.commandAdded, index, id));
        this._commands.splice(index, 0, cmd);
        return [index, id] as [number, string];
    }
    removeCommand(indexOrId: number | string) {
        const index = this._indexAt(indexOrId);
        if (index === -1) return false;
        const id = this._commands[index].id;

        // handle `moveTo`
        if (index === 0 && this._commands[1] !== undefined) {
            const { x: x1, y: y1, id: id1 } = this._commands[1];
            const cmd1 = { ...Path.moveTo([x1, y1]), id: id1 };
            this.trigger_(new EventSourceObject(this, Path.events.commandChanged, 1, id1));
            this._commands[1] = cmd1;
        }

        this.trigger_(new EventSourceObject(this, Path.events.commandRemoved, index, id));
        this._commands.splice(index, 1);
        return true;
    }
    appendCommand(command: PathCommand) {
        this._assertIsPathCommand(command, "command");
        const index = this.commandCount;
        const id = Utility.id("PathCommand");

        // handle `moveTo`
        // prettier-ignore
        let cmd =
                this._commands.length === 0 && command.type !== PathCommandType.MoveTo
                ? { ...Path.moveTo([command.x, command.y]), id }
                : this._commands.length !== 0 && command.type === PathCommandType.MoveTo
                ? { ...Path.lineTo([command.x, command.y]), id }
                : { ...command, id };

        this.trigger_(new EventSourceObject(this, Path.events.commandAdded, index, id));
        this._commands.push(cmd);
        return [index, id] as [number, string];
    }
    prependCommand(command: PathCommand) {
        this._assertIsPathCommand(command, "command");
        const index = 0;
        const id = Utility.id("PathCommand");

        const cmd = { ...Path.moveTo([command.x, command.y]), id };

        if (this.commands.length !== 0) {
            const { x: x0, y: y0, id: id0 } = this._commands[0];
            let cmd0 = this._reverseCommand({ ...command, type: command.type === PathCommandType.MoveTo ? PathCommandType.LineTo : command.type, id: id0 } as Required<PathCommand>, x0, y0);

            this.trigger_(new EventSourceObject(this, Path.events.commandChanged, 0, id0));
            this._commands[0] = cmd0;
        }

        this.trigger_(new EventSourceObject(this, Path.events.commandAdded, index, id));
        this._commands.unshift(cmd);
        return [index, id] as [number, string];
    }
    // #endregion

    /**
     * Returns a new path with all segments degenerating to point of path `this` cleaned.
     */
    clean() {
        const retPath = new Path(this._closed, this._fillRule);
        const l = this.commandCount;
        const cl = this.closed ? l : l - 1;
        const retCommands: PathCommand[] = [];

        retCommands.push(this._commands[0]);
        for (let i = 1; i < cl; i++) {
            const dg = this.getSegment(i - 1)!.degenerate(false);
            if (dg !== null && !(dg instanceof Point)) {
                retCommands.push(this._commands[i]);
            }
        }
        retPath.commands = retCommands;
        return retPath;
    }
    reverse() {
        const copy = this._commands.map(cmd => ({ ...cmd }));
        copy.reverse();
        this._commands = copy;
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
    getBoundingBox() {
        let bbox = [Infinity, Infinity, -Infinity, -Infinity] as [number, number, number, number];

        for (const seg of this.getSegments(true)) bbox = Box.extend(bbox, seg.getBoundingBox());
        return bbox;
    }

    // #region Length, area, winding direction
    @stated
    getLength() {
        return this.getSegments(true).reduce((acc, seg) => (acc += seg.getLength()), 0);
    }
    /**
     * Get area(simple calculation) of path `this`.
     * @note
     * - If path `this` is a simple path, the returned result is correct.
     * - If path `this` is a complex path, you should do boolean operation - self union first.
     * Why do we need to compute a possibly wrong value?
     * It determines the main winding direction of the path (which winding direction has more trends).
     */
    @stated
    getArea() {
        const l = this.commandCount;
        const commands = this._commands;
        let a = 0;
        for (let i = 0; i < l; i++) {
            const cmdCurr = commands[i];
            const cmdNext = commands[next(i, l, true)];

            switch (cmdNext.type) {
                case PathCommandType.MoveTo: {
                    const { x: x0, y: y0 } = cmdCurr;
                    const { x: x1, y: y1 } = cmdNext;
                    a += lineSegmentPathIntegral(x0, y0, x1, y1);
                    break;
                }
                case PathCommandType.LineTo: {
                    const { x: x0, y: y0 } = cmdCurr;
                    const { x: x1, y: y1 } = cmdNext;
                    a += lineSegmentPathIntegral(x0, y0, x1, y1);
                    break;
                }
                case PathCommandType.BezierTo: {
                    const { x: x0, y: y0 } = cmdCurr;
                    const { x: x3, y: y3, controlPoint1X: x1, controlPoint1Y: y1, controlPoint2X: x2, controlPoint2Y: y2 } = cmdNext;
                    a += bezierPathIntegral(x0, y0, x1, y1, x2, y2, x3, y3);
                    break;
                }
                case PathCommandType.QuadraticBezierTo: {
                    const { x: x0, y: y0 } = cmdCurr;
                    const { x: x2, y: y2, controlPointX: x1, controlPointY: y1 } = cmdNext;
                    a += quadraticBezierPathIntegral(x0, y0, x1, y1, x2, y2);
                    break;
                }
                case PathCommandType.ArcTo: {
                    const { x: x0, y: y0 } = cmdCurr;
                    const { x: x1, y: y1, radiusX, radiusY, rotation, largeArc, positive } = cmdNext;
                    const acp = endpointToCenterParameterization({
                        point1X: x0,
                        point1Y: y0,
                        point2X: x1,
                        point2Y: y1,
                        radiusX,
                        radiusY,
                        largeArc,
                        positive,
                        rotation
                    });
                    a += arcPathIntegral(acp.centerX, acp.centerY, acp.radiusX, acp.radiusY, acp.rotation, acp.positive, acp.startAngle, acp.endAngle);
                    break;
                }
                default: {
                    throw new Error("[G]This should never happen.");
                }
            }
        }
        return a;
    }
    @stated
    getWindingDirection(): WindingDirection {
        return Maths.sign(this.getArea()) as WindingDirection;
    }
    // #endregion

    apply(transformation: Transformation) {
        const path = new Path();
        path.closed = this.closed;
        this._commands.forEach((cmd, index) => {
            switch (cmd.type) {
                case PathCommandType.MoveTo: {
                    const [nx, ny] = transformation.transformCoordinates([cmd.x, cmd.y]);
                    path.appendCommand(Path.moveTo([nx, ny]));
                    break;
                }
                case PathCommandType.LineTo: {
                    const [nx, ny] = transformation.transformCoordinates([cmd.x, cmd.y]);
                    path.appendCommand(Path.lineTo([nx, ny]));
                    break;
                }
                case PathCommandType.BezierTo: {
                    const [nx, ny] = transformation.transformCoordinates([cmd.x, cmd.y]);
                    const [nc1x, nc1y] = transformation.transformCoordinates([cmd.x, cmd.y]);
                    const [nc2x, nc2y] = transformation.transformCoordinates([cmd.x, cmd.y]);
                    path.appendCommand(Path.bezierTo([nc1x, nc1y], [nc2x, nc2y], [nx, ny]));
                    break;
                }
                case PathCommandType.QuadraticBezierTo: {
                    const [nx, ny] = transformation.transformCoordinates([cmd.x, cmd.y]);
                    const [ncx, ncy] = transformation.transformCoordinates([cmd.x, cmd.y]);
                    path.appendCommand(Path.quadraticBezierTo([ncx, ncy], [nx, ny]));
                    break;
                }
                case PathCommandType.ArcTo: {
                    const { x: x1, y: y1 } = this._commands[index - 1];
                    const { x: x2, y: y2, radiusX: rx, radiusY: ry, rotation: phi, largeArc, positive } = cmd;
                    const {
                        point2X: nx2,
                        point2Y: ny2,
                        radiusX: nrx,
                        radiusY: nry,
                        largeArc: nla,
                        positive: np,
                        rotation: nr
                    } = endpointParameterizationTransform(
                        {
                            point1X: x1,
                            point1Y: y1,
                            point2X: x2,
                            point2Y: y2,
                            radiusX: rx,
                            radiusY: ry,
                            largeArc: largeArc,
                            positive: positive,
                            rotation: phi
                        },
                        transformation.matrix
                    );
                    path.appendCommand(Path.arcTo(nrx, nry, nr, nla, np, [nx2, ny2]));
                    break;
                }
                default: {
                    throw new Error("[G]This should never happen.");
                }
            }
        });
        return path;
    }

    getGraphics(viewport: ViewportDescriptor) {
        const dg = this.degenerate(false);
        if (dg === null) return new Graphics();
        if (dg !== this) return (dg as Exclude<typeof dg, this>)!.getGraphics(viewport);

        const g = new Graphics();
        const gg = new GeometryGraphic();
        g.append(gg);
        gg.fillRule = this.fillRule;
        this._commands.forEach(cmd => {
            if (cmd.type === PathCommandType.MoveTo) {
                gg.moveTo(cmd.x, cmd.y);
            }
            if (cmd.type === PathCommandType.LineTo) {
                gg.lineTo(cmd.x, cmd.y);
            }
            if (cmd.type === PathCommandType.BezierTo) {
                gg.bezierTo(cmd.controlPoint1X, cmd.controlPoint1Y, cmd.controlPoint2X, cmd.controlPoint2Y, cmd.x, cmd.y);
            }
            if (cmd.type === PathCommandType.QuadraticBezierTo) {
                gg.quadraticBezierTo(cmd.controlPointX, cmd.controlPointY, cmd.x, cmd.y);
            }
            if (cmd.type === PathCommandType.ArcTo) {
                gg.endpointArcTo(cmd.radiusX, cmd.radiusY, cmd.rotation, cmd.largeArc, cmd.positive, cmd.x, cmd.y);
            }
        });
        if (this.closed) gg.close();
        if (optioner.options.graphics.pathSegmentArrow) {
            this.getSegments(true).forEach(segment => {
                let vector;
                if (segment instanceof Arc) {
                    const [sa, ea] = segment.getStartEndAngles();
                    const positive = segment.positive;
                    vector = segment.getTangentVectorAtAngle(Angle.fraction(sa, ea, positive, 0.5), true);
                } else {
                    vector = segment.getTangentVectorAtTime(0.5, true);
                }
                g.concat(new ArrowGraphics(vector.point1Coordinates, vector.angle).getGraphics(viewport));
            });
        }
        return g;
    }
    clone() {
        return new Path(this.commands);
    }
    copyFrom(shape: Path | null) {
        if (shape === null) shape = new Path();
        this._setCommands(shape.commands);
        return this;
    }
    override toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.id}){`,
            `\tclosed: ${this.closed},`,
            `\tfillRule: ${this.fillRule}`,
            `\tcommands: ${JSON.stringify(this._commands)}`, 
            `}`
        ].join("\n");
    }
}
