import { Assert, Vector2, Type, Utility, Coordinates, Angle } from "@geomtoy/util";
import { validGeometry } from "../../misc/decor-valid-geometry";

import Geometry from "../../base/Geometry";
import Arc from "../basic/Arc";
import Bezier from "../basic/Bezier";
import LineSegment from "../basic/LineSegment";
import Point from "../basic/Point";
import QuadraticBezier from "../basic/QuadraticBezier";
import Graphics from "../../graphics/GeometryGraphics";
import EventObject from "../../event/EventObject";

import {
    PathCommandType,
    type PathCommand,
    type PathCommandWithUuid,
    type PathMoveToCommand,
    type PathLineToCommand,
    type PathBezierToCommand,
    type PathQuadraticBezierToCommand,
    type PathArcToCommand,
    FillRule,
    ViewportDescriptor
} from "../../types";
import Transformation from "../../transformation";
import { endpointToCenterParameterization, correctRadii, endpointParameterizationTransform } from "../../misc/arc";
import { next, prev } from "../../misc/loop";
import { arcPathIntegral, bezierPathIntegral, lineSegmentPathIntegral, quadraticBezierPathIntegral } from "../../misc/area-integrate";
import { stated, statedWithBoolean } from "../../misc/decor-cache";
import FillRuleHelper from "../../helper/FillRuleHelper";
import IntersectionDescriptor from "../../helper/IntersectionDescriptor";
import ArrowGraphics from "../../helper/ArrowGraphics";
import { optioner } from "../../geomtoy";
import { getCoordinates } from "../../misc/point-like";

const PATH_MIN_COMMAND_COUNT = 2;

@validGeometry
export default class Path extends Geometry {
    private _commands: PathCommandWithUuid[] = [];
    private _closed: boolean = true;
    private _fillRule: FillRule = "nonzero";

    constructor(commands: PathCommand[], closed?: boolean);
    constructor(closed?: boolean);
    constructor(a0?: any, a1?: any) {
        super();
        if (Type.isArray(a0)) {
            Object.assign(this, { commands: a0, closed: a1 ?? true });
        }
        if (Type.isBoolean(a0)) {
            Object.assign(this, { closed: a0 ?? true });
        }
    }

    get events() {
        return {
            commandsReset: "reset" as const,
            commandAdded: "cmdAdd" as const,
            commandRemoved: "cmdRemove" as const,
            commandChanged: "cmdChange" as const,
            closedChanged: "closedChange" as const,
            fillRuleChanged: "fillRuleChange" as const
        };
    }

    private _setCommands(value: PathCommand[]) {
        const commands = value;
        let firstMoveToIndex = commands.findIndex(cmd => cmd.type === PathCommandType.MoveTo);
        let temp: PathCommand | null = null;

        for (let i = 0, l = commands.length; i < l; i++) {
            const cmd = commands[i];
            if (i < firstMoveToIndex) {
                if (temp === null) {
                    // this is the first command if we have `moveTo` but not first
                    commands[i] = { ...Path.moveTo([cmd.x, cmd.y]) };
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
                    // this is the first command if we do not have `moveTo`
                    commands[i] = { ...Path.moveTo([cmd.x, cmd.y]) };
                } else {
                    if (cmd.type === PathCommandType.MoveTo) {
                        commands[i] = { ...Path.lineTo([cmd.x, cmd.y]) };
                    }
                }
            }

            if (commands[i].type === PathCommandType.ArcTo) {
                commands[i] = this._correctAndSetRadii(commands[i] as PathArcToCommand, commands[i - 1]);
            }
        }

        if (!Utility.isEqualTo(this._commands, value)) this.trigger_(EventObject.simple(this, this.events.commandsReset));

        this._commands = value.map(cmd => {
            return { ...cmd, uuid: Utility.uuid() };
        });
    }
    private _setClosed(value: boolean) {
        if (!Utility.isEqualTo(this._closed, value)) this.trigger_(EventObject.simple(this, this.events.closedChanged));
        this._closed = value;
    }
    private _setFillRule(value: FillRule) {
        if (!Utility.isEqualTo(this._fillRule, value)) this.trigger_(EventObject.simple(this, this.events.fillRuleChanged));
        this._fillRule = value;
    }

    get commands(): PathCommandWithUuid[] {
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

    protected initialized_() {
        return this._commands.length >= PATH_MIN_COMMAND_COUNT;
    }

    dimensionallyDegenerate() {
        if (!this.initialized_()) return true;
        const epsilon = optioner.options.epsilon;
        const commands = this._commands;
        const { x: x0, y: y0 } = commands[0];

        for (let i = 1, l = this._commands.length; i < l; i++) {
            const { x: xi, y: yi } = commands[i];
            if (!Coordinates.isEqualTo([x0, y0], [xi, yi], epsilon)) {
                return false;
            }
        }
        return true;
    }

    static fromBezierThroughPointsSmoothly(points: Point[] | [number, number][], closed = false) {}

    static fromQuadraticBezierThroughPointsSmoothly(points: Point[] | [number, number][], closed = false) {}

    static moveTo(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        const ret: PathMoveToCommand = {
            type: PathCommandType.MoveTo,
            x,
            y
        };
        return ret;
    }
    static lineTo(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        const ret: PathLineToCommand = {
            type: PathCommandType.LineTo,
            x,
            y
        };
        return ret;
    }
    static bezierTo(controlPoint1: [number, number] | Point, controlPoint2: [number, number] | Point, point: [number, number] | Point) {
        const [controlPoint1X, controlPoint1Y] = getCoordinates(controlPoint1, "controlPoint1");
        const [controlPoint2X, controlPoint2Y] = getCoordinates(controlPoint2, "controlPoint2");
        const [x, y] = getCoordinates(point, "point");
        const ret: PathBezierToCommand = {
            type: PathCommandType.BezierTo,
            x,
            y,
            controlPoint1X,
            controlPoint1Y,
            controlPoint2X,
            controlPoint2Y
        };
        return ret;
    }
    static quadraticBezierTo(controlPoint: [number, number] | Point, point: [number, number] | Point) {
        const [controlPointX, controlPointY] = getCoordinates(controlPoint, "controlPoint");
        const [x, y] = getCoordinates(point, "point");
        const ret: PathQuadraticBezierToCommand = {
            type: PathCommandType.QuadraticBezierTo,
            x,
            y,
            controlPointX,
            controlPointY
        };
        return ret;
    }
    static arcTo(radiusX: number, radiusY: number, rotation: number, largeArc: boolean, positive: boolean, point: [number, number] | Point) {
        Assert.isPositiveNumber(radiusX, "radiusX");
        Assert.isPositiveNumber(radiusY, "radiusY");
        Assert.isRealNumber(rotation, "rotation");
        const [x, y] = getCoordinates(point, "point");
        const ret: PathArcToCommand = {
            type: PathCommandType.ArcTo,
            x,
            y,
            radiusX,
            radiusY,
            rotation,
            largeArc,
            positive
        };
        return ret;
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
            this.trigger_(EventObject.collection(this, this.events.commandChanged, i, cmd.uuid));
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
                if (!Type.isPositiveNumber(v.radiusX)) return false;
                if (!Type.isPositiveNumber(v.radiusY)) return false;
                if (!Type.isRealNumber(v.rotation)) return false;
                if (!Type.isBoolean(v.largeArc)) return false;
                if (!Type.isBoolean(v.positive)) return false;
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
    private _indexAt(indexOrUuid: number | string): number {
        return Type.isString(indexOrUuid) ? this._commands.findIndex(cmd => cmd.uuid === indexOrUuid) : this._commands[indexOrUuid] !== undefined ? indexOrUuid : -1;
    }

    getUuids() {
        return this._commands.map(vtx => vtx.uuid);
    }
    getIndexOfUuid(uuid: string) {
        return this._commands.findIndex(cmd => cmd.uuid === uuid);
    }
    getUuidOfIndex(index: number) {
        return this._commands[index]?.uuid ?? "";
    }

    /**
     * Get segment by `indexOrUuid`.
     * @note
     * The `closed` property does NOT effect this method, and it is assumed to be true.
     * @param indexOrUuid
     */
    getSegment(indexOrUuid: number | string) {
        const index = this._indexAt(indexOrUuid);
        if (index === -1) return null;

        const cmd1 = this._commands[index];
        const cmd2 = this._commands[next(index, this.commandCount, true)];
        const type = cmd2.type;

        switch (type) {
            case PathCommandType.MoveTo: {
                return new LineSegment(cmd1.x, cmd1.y, cmd2.x, cmd2.y);
            }
            case PathCommandType.LineTo: {
                return new LineSegment(cmd1.x, cmd1.y, cmd2.x, cmd2.y);
            }
            case PathCommandType.BezierTo: {
                return new Bezier(cmd1.x, cmd1.y, cmd2.x, cmd2.y, cmd2.controlPoint1X, cmd2.controlPoint1Y, cmd2.controlPoint2X, cmd2.controlPoint2Y);
            }
            case PathCommandType.QuadraticBezierTo: {
                return new QuadraticBezier(cmd1.x, cmd1.y, cmd2.x, cmd2.y, cmd2.controlPointX, cmd2.controlPointY);
            }
            case PathCommandType.ArcTo: {
                return new Arc(cmd1.x, cmd1.y, cmd2.x, cmd2.y, cmd2.radiusX, cmd2.radiusY, cmd2.largeArc, cmd2.positive, cmd2.rotation);
            }
            default: {
                throw new Error("[G]This should never happen.");
            }
        }
    }

    @statedWithBoolean(false, false)
    getSegments(excludeDimensionallyDegenerate = false, assumeClosed = false) {
        const l = this.commandCount;
        const cl = assumeClosed ? l : this.closed ? l : l - 1;
        const ret: (LineSegment | QuadraticBezier | Bezier | Arc)[] = [];
        for (let i = 0; i < cl; i++) {
            const segment = this.getSegment(i)!;
            if (excludeDimensionallyDegenerate) {
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
    getPrevSegment(indexOrUuid: number | string, allowed = false): [LineSegment | QuadraticBezier | Bezier | Arc | null, number] {
        let index = this._indexAt(indexOrUuid);
        if (index === -1) return [null, -1];

        index = prev(index, this.commandCount, true);
        let seg = this.getSegment(index)!;
        if (allowed) {
            while (seg.dimensionallyDegenerate()) {
                index = prev(index, this.commandCount, true);
                seg = this.getSegment(index)!;
            }
        }
        return [seg, index];
    }
    getNextSegment(indexOrUuid: number | string, allowed = false): [LineSegment | QuadraticBezier | Bezier | Arc | null, number] {
        let index = this._indexAt(indexOrUuid);
        if (index === -1) return [null, -1];

        index = next(index, this.commandCount, true);
        let seg = this.getSegment(index)!;
        if (allowed) {
            while (seg.dimensionallyDegenerate()) {
                index = next(index, this.commandCount, true);
                seg = this.getSegment(index)!;
            }
        }
        return [seg, index];
    }

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
            const cn = helper.windingNumberOfPoint(c, 0, this.getSegments(true, true));
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
            const cn = helper.windingNumberOfPoint(c, 0, this.getSegments(true, true));
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

    private _correctAndSetRadii<T extends PathArcToCommand | Required<PathArcToCommand>>(command: T, prevCommand: PathCommand) {
        const { x: x1, y: y1 } = prevCommand;
        const { x: x2, y: y2, radiusX, radiusY, rotation } = command;
        let [rx, ry] = correctRadii(x1, y1, x2, y2, radiusX, radiusY, rotation);
        return { ...command, radiusX: rx, radiusY: ry } as T;
    }

    getPrevVertex(indexOrUuid: number | string) {
        let index = this._indexAt(indexOrUuid);
        if (index === -1) return null;
        index = prev(index, this.commandCount, true);
        return this.getCommand(index);
    }
    getNextVertex(indexOrUuid: number | string) {
        let index = this._indexAt(indexOrUuid);
        if (index === -1) return null;
        index = next(index, this.commandCount, true);
        return this.getCommand(index);
    }

    // #region Command
    getCommand(indexOrUuid: number | string) {
        const index = this._indexAt(indexOrUuid);
        if (index === -1) return null;
        const { uuid, ...rest } = this._commands[index];
        return rest as PathCommand;
    }
    private _handleNextArcTo(index: number) {
        if (this._commands[index + 1]?.type === PathCommandType.ArcTo) {
            let cmd = this._commands[index + 1] as Required<PathArcToCommand>;
            cmd = this._correctAndSetRadii(cmd, this._commands[index]);
            if (!Utility.isEqualTo(this._commands[index + 1], cmd)) {
                this.trigger_(EventObject.collection(this, this.events.commandChanged, index + 1, cmd.uuid));
                this._commands[index + 1] = cmd;
            }
        }
    }
    setCommand(indexOrUuid: number | string, command: PathCommand) {
        this._assertIsPathCommand(command, "command");
        const index = this._indexAt(indexOrUuid);
        if (index === -1) return false;
        const uuid = this._commands[index].uuid;

        let cmd: PathCommandWithUuid = { ...command, uuid };
        // handle `moveTo`
        if (index === 0 && cmd.type !== PathCommandType.MoveTo) {
            cmd = { ...Path.moveTo([cmd.x, cmd.y]), uuid };
        }
        if (index !== 0 && cmd.type === PathCommandType.MoveTo) {
            cmd = { ...Path.lineTo([cmd.x, cmd.y]), uuid };
        }
        // handle `arcTo`
        if (cmd.type === PathCommandType.ArcTo) {
            cmd = this._correctAndSetRadii(cmd, this._commands[index - 1]);
        }

        if (!Utility.isEqualTo(this._commands[index], cmd)) {
            this.trigger_(EventObject.collection(this, this.events.commandChanged, index, uuid));
            this._commands[index] = cmd;
        }

        this._handleNextArcTo(index);
        return true;
    }
    insertCommand(indexOrUuid: number | string, command: PathCommand) {
        this._assertIsPathCommand(command, "command");
        const index = this._indexAt(indexOrUuid);
        if (index === -1) return false;
        const uuid = Utility.uuid();

        if (index === 0) return this.prependCommand(command);
        if (index === this._commands.length - 1) return this.appendCommand(command);

        let cmd: PathCommandWithUuid = { ...command, uuid };

        // handle `moveTo`
        if (cmd.type === PathCommandType.MoveTo) {
            cmd = { ...Path.lineTo([cmd.x, cmd.y]), uuid };
        }
        // handle `arcTo`
        if (cmd.type === PathCommandType.ArcTo) {
            cmd = this._correctAndSetRadii(cmd, this._commands[index - 1]);
        }

        this.trigger_(EventObject.collection(this, this.events.commandAdded, index, uuid));
        this._commands.splice(index, 0, cmd);
        this._handleNextArcTo(index);
        return [index, uuid] as [number, string];
    }

    removeCommand(indexOrUuid: number | string) {
        const index = this._indexAt(indexOrUuid);
        if (index === -1) return false;
        const uuid = this.commands[index].uuid;

        // handle `moveTo`
        if (index === 0 && this.commands[1] !== undefined) {
            const { x: x1, y: y1, uuid: uuid1 } = this._commands[1];
            const cmd1 = { ...Path.moveTo([x1, y1]), uuid: uuid1 };
            this.trigger_(EventObject.collection(this, this.events.commandChanged, 1, uuid1));
            this._commands[1] = cmd1;
        }

        this.trigger_(EventObject.collection(this, this.events.commandRemoved, index, uuid));
        this._commands.splice(index, 1);

        this._handleNextArcTo(index);
        return true;
    }

    appendCommand(command: PathCommand) {
        this._assertIsPathCommand(command, "command");
        const index = this.commandCount;
        const uuid = Utility.uuid();

        let cmd: PathCommandWithUuid = { ...command, uuid };

        // handle first append
        if (this._commands.length === 0) {
            cmd = { ...Path.moveTo([cmd.x, cmd.y]), uuid };
        } else {
            // handle `moveTo`
            if (cmd.type === PathCommandType.MoveTo) {
                cmd = { ...Path.lineTo([cmd.x, cmd.y]), uuid };
            }
            // handle `arcTo`
            if (cmd.type === PathCommandType.ArcTo) {
                cmd = this._correctAndSetRadii(cmd, this._commands[index - 1]);
            }
        }
        this.trigger_(EventObject.collection(this, this.events.commandAdded, index, uuid));
        this._commands.push(cmd);
        return [index, uuid] as [number, string];
    }
    prependCommand(command: PathCommand) {
        this._assertIsPathCommand(command, "command");
        const index = 0;
        const uuid = Utility.uuid();

        let cmd: PathCommandWithUuid = { ...command, uuid };

        // handle first prepend
        if (this._commands.length === 0) {
            cmd = { ...Path.moveTo([cmd.x, cmd.y]), uuid };
        } else {
            // handle `moveTo`
            if (command.type !== PathCommandType.MoveTo) {
                const { x: x0, y: y0, uuid: uuid0 } = this._commands[0];

                cmd = { ...Path.moveTo([cmd.x, cmd.y]), uuid };
                const cmd0 = { ...this._reverseCommand(command, x0, y0), uuid: uuid0 };

                this.trigger_(EventObject.collection(this, this.events.commandChanged, 1, uuid0));
                this._commands[0] = cmd0;
            }
        }
        this.trigger_(EventObject.collection(this, this.events.commandAdded, index, uuid));
        this._commands.unshift(cmd);
        return [index, uuid] as [number, string];
    }
    // #endregion

    clean() {
        const copyPath = this.clone();
        let i = 0;
        while (i < copyPath.commandCount - 1) {
            if (copyPath.getSegment(i)!.dimensionallyDegenerate()) {
                copyPath.removeCommand(i);
                continue;
            }
            i++;
        }
        return copyPath;
    }

    private _getSimpleArea() {
        const l = this.commandCount;
        const commands = this._commands;
        let a = 0;
        for (let i = 0; i < l; i++) {
            const currCmd = commands[i];
            const nextCmd = commands[next(i, l, true)];

            switch (nextCmd.type) {
                case PathCommandType.MoveTo: {
                    const { x: x0, y: y0 } = currCmd;
                    const { x: x1, y: y1 } = nextCmd;
                    a += lineSegmentPathIntegral(x0, y0, x1, y1);
                    break;
                }
                case PathCommandType.LineTo: {
                    const { x: x0, y: y0 } = currCmd;
                    const { x: x1, y: y1 } = nextCmd;
                    a += lineSegmentPathIntegral(x0, y0, x1, y1);
                    break;
                }
                case PathCommandType.BezierTo: {
                    const { x: x0, y: y0 } = currCmd;
                    const { x: x3, y: y3, controlPoint1X: x1, controlPoint1Y: y1, controlPoint2X: x2, controlPoint2Y: y2 } = nextCmd;
                    a += bezierPathIntegral(x0, y0, x1, y1, x2, y2, x3, y3);
                    break;
                }
                case PathCommandType.QuadraticBezierTo: {
                    const { x: x0, y: y0 } = currCmd;
                    const { x: x2, y: y2, controlPointX: x1, controlPointY: y1 } = nextCmd;
                    a += quadraticBezierPathIntegral(x0, y0, x1, y1, x2, y2);
                    break;
                }
                case PathCommandType.ArcTo: {
                    const { x: x0, y: y0 } = currCmd;
                    let { x: x1, y: y1, radiusX, radiusY, rotation, largeArc, positive } = nextCmd;
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
        const g = new Graphics();
        if (!this.initialized_()) return g;
        g.fillRule = this.fillRule;
        this._commands.forEach(cmd => {
            if (cmd.type === PathCommandType.MoveTo) {
                g.moveTo(cmd.x, cmd.y);
            }
            if (cmd.type === PathCommandType.LineTo) {
                g.lineTo(cmd.x, cmd.y);
            }
            if (cmd.type === PathCommandType.BezierTo) {
                g.bezierTo(cmd.controlPoint1X, cmd.controlPoint1Y, cmd.controlPoint2X, cmd.controlPoint2Y, cmd.x, cmd.y);
            }
            if (cmd.type === PathCommandType.QuadraticBezierTo) {
                g.quadraticBezierTo(cmd.controlPointX, cmd.controlPointY, cmd.x, cmd.y);
            }
            if (cmd.type === PathCommandType.ArcTo) {
                g.endpointArcTo(cmd.radiusX, cmd.radiusY, cmd.rotation, cmd.largeArc, cmd.positive, cmd.x, cmd.y);
            }
        });
        if (this.closed) g.close();
        if (optioner.options.graphics.pathSegmentArrow) {
            this.getSegments().forEach(segment => {
                let vector;
                if (segment instanceof Arc) {
                    const [sa, ea] = segment.getStartEndAngles();
                    const positive = segment.positive;
                    vector = segment.getTangentVectorAtAngle(Angle.middle(sa, ea, positive));
                } else {
                    vector = segment.getTangentVectorAtTime(0.5);
                }
                g.append(new ArrowGraphics(vector.point1Coordinates, vector.angle).getGraphics(viewport));
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
    toString(): string {
        // throw new Error("Method not implemented.");
        return [`${this.name}(${this.uuid}){`, `\tcommands: ${JSON.stringify(this.commands)}`, `\t}`, `}`].join("\n");
    }
    toArray(): any[] {
        throw new Error("Method not implemented.");
    }
    toObject(): object {
        throw new Error("Method not implemented.");
    }
}
