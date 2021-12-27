import { validAndWithSameOwner } from "../../decorator";
import util from "../../utility";
import assert from "../../utility/assertion";
import coord from "../../utility/coord";
import math from "../../utility/math";

import Shape from "../../base/Shape";
import Arc from "../basic/Arc";
import Bezier from "../basic/Bezier";
import LineSegment from "../basic/LineSegment";
import Point from "../basic/Point";
import QuadraticBezier from "../basic/QuadraticBezier";
import Graphics from "../../graphics";
import EventObject from "../../event/EventObject";

import { PathCommandType } from "../../types";

import type Geomtoy from "../..";
import type { PathCommand, PathCommandWithUuid, PathMoveToCommand, PathLineToCommand, PathBezierCurveToCommand, PathQuadraticBezierCurveToCommand, PathArcToCommand } from "../../types";


class Path extends Shape {
    private _closed = true;
    private _commands: PathCommandWithUuid[] = [];

    constructor(owner: Geomtoy, commands: PathCommand[], closed?: boolean);
    constructor(owner: Geomtoy);
    constructor(o: Geomtoy, a1?: any, a2?: any) {
        super(o);
        if (util.isArray(a1)) {
            Object.assign(this, { commands: a1, closed: a2 ?? true });
        }
        return Object.seal(this);
    }

    static readonly events = Object.freeze({
        commandsReset: "reset" as const,
        commandAdded: "cmdAdd" as const,
        commandRemoved: "cmdRemove" as const,
        commandChanged: "cmdChange" as const
    });

    private _setCommands(value: PathCommand[]) {
        if (!util.isEqualTo(this._commands, value)) this.trigger_(EventObject.simple(this, Path.events.commandsReset));
        this._commands = value.map(cmd => {
            return { ...cmd, uuid: util.uuid() };
        });
    }

    get commands(): PathCommand[] {
        return this._commands.map(cmdWu => {
            const { uuid, ...cmd } = cmdWu;
            return cmd;
        });
    }
    set commands(value) {
        assert.condition(util.isArray(value) && value.every(cmd => this._isPathCommand(cmd)), "[G]The `commands` should be an array of `PathCommand`.");
        this._setCommands(value);
    }

    get closed() {
        return this._closed;
    }
    set closed(value: boolean) {
        assert.isBoolean(value, "closed");
        this._closed = value;
    }

    get commandCount() {
        return this._commands.length;
    }

    isValid() {
        if (
            this._commands.some((cmd, index) => {
                if (index === 0) {
                    return cmd.type !== PathCommandType.MoveTo;
                } else {
                    return cmd.type === PathCommandType.MoveTo;
                }
            })
        ) {
            return false;
        }
        if (this._commands.length < 2) return false;
        return true;
    }

    static moveTo(point: [number, number] | Point) {
        assert.isCoordinatesOrPoint(point, "point");
        const [x, y] = point instanceof Point ? point.coordinates : point;
        const ret: PathMoveToCommand = {
            type: PathCommandType.MoveTo,
            x,
            y
        };
        return ret;
    }
    static lineTo(point: [number, number] | Point) {
        assert.isCoordinatesOrPoint(point, "point");
        const [x, y] = point instanceof Point ? point.coordinates : point;
        const ret: PathLineToCommand = {
            type: PathCommandType.LineTo,
            x,
            y
        };
        return ret;
    }
    static bezierCurveTo(controlPoint1: [number, number] | Point, controlPoint2: [number, number] | Point, point: [number, number] | Point) {
        assert.isCoordinatesOrPoint(controlPoint1, "controlPoint1");
        assert.isCoordinatesOrPoint(controlPoint2, "controlPoint2");
        assert.isCoordinatesOrPoint(point, "point");
        const [controlPoint1X, controlPoint1Y] = controlPoint1 instanceof Point ? controlPoint1.coordinates : controlPoint1;
        const [controlPoint2X, controlPoint2Y] = controlPoint2 instanceof Point ? controlPoint2.coordinates : controlPoint2;
        const [x, y] = point instanceof Point ? point.coordinates : point;
        const ret: PathBezierCurveToCommand = {
            type: PathCommandType.BezierCurveTo,
            x,
            y,
            controlPoint1X,
            controlPoint1Y,
            controlPoint2X,
            controlPoint2Y
        };
        return ret;
    }
    static quadraticBezierCurveTo(controlPoint: [number, number] | Point, point: [number, number] | Point) {
        assert.isCoordinatesOrPoint(controlPoint, "controlPoint");
        assert.isCoordinatesOrPoint(point, "point");
        const [controlPointX, controlPointY] = controlPoint instanceof Point ? controlPoint.coordinates : controlPoint;
        const [x, y] = point instanceof Point ? point.coordinates : point;
        const ret: PathQuadraticBezierCurveToCommand = {
            type: PathCommandType.QuadraticBezierCurveTo,
            x,
            y,
            controlPointX,
            controlPointY
        };
        return ret;
    }
    static arcTo(radiusX: number, radiusY: number, xAxisRotation: number, largeArc: boolean, positive: boolean, point: [number, number] | Point) {
        assert.isPositiveNumber(radiusX, "radiusX");
        assert.isPositiveNumber(radiusY, "radiusY");
        assert.isRealNumber(xAxisRotation, "xAxisRotation");
        assert.isBoolean(largeArc, "largeArc");
        assert.isBoolean(positive, "positive");
        assert.isCoordinatesOrPoint(point, "point");
        const [x, y] = point instanceof Point ? point.coordinates : point;
        const ret: PathArcToCommand = {
            type: PathCommandType.ArcTo,
            x,
            y,
            radiusX,
            radiusY,
            xAxisRotation,
            largeArc,
            positive
        };
        return ret;
    }

    move(deltaX: number, deltaY: number) {
        assert.isRealNumber(deltaX, "deltaX");
        assert.isRealNumber(deltaY, "deltaY");
        return this.clone().moveSelf(deltaX, deltaY);
    }
    moveSelf(deltaX: number, deltaY: number) {
        assert.isRealNumber(deltaX, "deltaX");
        assert.isRealNumber(deltaY, "deltaY");
        if (deltaX === 0 && deltaY === 0) return this;

        this._commands.forEach((cmd, i) => {
            switch (cmd.type) {
                case PathCommandType.MoveTo: {
                    [cmd.x, cmd.y] = coord.move([cmd.x, cmd.y], deltaX, deltaY);
                    break;
                }
                case PathCommandType.LineTo: {
                    [cmd.x, cmd.y] = coord.move([cmd.x, cmd.y], deltaX, deltaY);
                    break;
                }
                case PathCommandType.BezierCurveTo: {
                    [cmd.controlPoint1X, cmd.controlPoint1Y] = coord.move([cmd.controlPoint1X, cmd.controlPoint1Y], deltaX, deltaY);
                    [cmd.controlPoint2X, cmd.controlPoint2Y] = coord.move([cmd.controlPoint2X, cmd.controlPoint2Y], deltaX, deltaY);
                    [cmd.x, cmd.y] = coord.move([cmd.x, cmd.y], deltaX, deltaY);
                    break;
                }
                case PathCommandType.QuadraticBezierCurveTo: {
                    [cmd.controlPointX, cmd.controlPointY] = coord.move([cmd.controlPointX, cmd.controlPointY], deltaX, deltaY);
                    [cmd.x, cmd.y] = coord.move([cmd.x, cmd.y], deltaX, deltaY);
                    break;
                }
                case PathCommandType.ArcTo: {
                    [cmd.x, cmd.y] = coord.move([cmd.x, cmd.y], deltaX, deltaY);
                    break;
                }
            }
            this.trigger_(EventObject.collection(this, Path.events.commandChanged, i, cmd.uuid));
        });
        return this;
    }
    moveAlongAngle(angle: number, distance: number) {
        assert.isRealNumber(angle, "angle");
        assert.isRealNumber(distance, "distance");

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

    private _isPathCommand(v: any): v is PathCommand {
        if (!util.isPlainObject(v)) return false;
        if (!v.type) return false;
        switch (v.type) {
            case PathCommandType.MoveTo: {
                if (Object.keys(v).length !== 3) return false;
                if (!util.isRealNumber(v.x)) return false;
                if (!util.isRealNumber(v.y)) return false;
                return true;
            }
            case PathCommandType.LineTo: {
                if (Object.keys(v).length !== 3) return false;
                if (!util.isRealNumber(v.x)) return false;
                if (!util.isRealNumber(v.y)) return false;
                return true;
            }
            case PathCommandType.BezierCurveTo: {
                if (Object.keys(v).length !== 7) return false;
                if (!util.isRealNumber(v.x)) return false;
                if (!util.isRealNumber(v.y)) return false;
                if (!util.isRealNumber(v.controlPoint1X)) return false;
                if (!util.isRealNumber(v.controlPoint1Y)) return false;
                if (!util.isRealNumber(v.controlPoint2X)) return false;
                if (!util.isRealNumber(v.controlPoint2Y)) return false;
                return true;
            }
            case PathCommandType.QuadraticBezierCurveTo: {
                if (Object.keys(v).length !== 5) return false;
                if (!util.isRealNumber(v.x)) return false;
                if (!util.isRealNumber(v.y)) return false;
                if (!util.isRealNumber(v.controlPointX)) return false;
                if (!util.isRealNumber(v.controlPointY)) return false;
                return true;
            }
            case PathCommandType.ArcTo: {
                if (Object.keys(v).length !== 8) return false;
                if (!util.isRealNumber(v.x)) return false;
                if (!util.isRealNumber(v.y)) return false;
                if (!util.isPositiveNumber(v.radiusX)) return false;
                if (!util.isPositiveNumber(v.radiusY)) return false;
                if (!util.isRealNumber(v.xAxisRotation)) return false;
                if (!util.isBoolean(v.largeArc)) return false;
                if (!util.isBoolean(v.positive)) return false;
                return true;
            }
            default: {
                return false;
            }
        }
    }
    private _assertIsPathCommand(value: PathCommand, p: string) {
        assert.condition(this._isPathCommand(value), `[G]The \`${p}\` should be a \`PathCommand\`.`);
    }
    private _assertIsIndexOrUuid(value: number | string, p: string) {
        assert.condition(!util.isString(value) && !(util.isInteger(value) && value >= 0), `[G]The \`${p}\` should be a string or an integer greater than or equal to 0.`);
    }
    private _parseIndexOrUuid(indexOrUuid: number | string): [number, string] | [undefined, undefined] {
        if (util.isString(indexOrUuid)) {
            const index = this._commands.findIndex(cmd => cmd.uuid === indexOrUuid);
            if (index != -1) {
                return [index, indexOrUuid];
            }
        } else {
            if (math.inInterval(indexOrUuid, 0, this.commandCount - 1)) {
                return [indexOrUuid, this._commands[indexOrUuid].uuid];
            }
        }
        return [undefined, undefined];
    }

    getIndexOfUuid(uuid: string) {
        assert.isString(uuid, "uuid");
        return this._commands.findIndex(cmd => cmd.uuid === uuid);
    }
    getUuidOfIndex(index: number) {
        assert.isInteger(index, "index");
        return math.inInterval(index, 0, this.commandCount - 1) ? this._commands[index].uuid : "";
    }

    getPathSegment(indexOrUuid: number | string) {
        this._assertIsIndexOrUuid(indexOrUuid, "indexOrUuid");
        const [index] = this._parseIndexOrUuid(indexOrUuid);
        if (index === undefined) return null;

        const curr = util.nth(this._commands, index)!;
        const prev = util.nth(this._commands, index - 1)!;
        const type = curr.type;

        switch (type) {
            case PathCommandType.MoveTo: {
                if (this.closed) {
                    return new LineSegment(this.owner, prev.x, prev.y, curr.x, curr.y);
                } else {
                    return null;
                }
            }
            case PathCommandType.LineTo: {
                return new LineSegment(this.owner, [prev.x, prev.y], [curr.x, curr.y]);
            }
            case PathCommandType.BezierCurveTo: {
                return new Bezier(this.owner, [prev.x, prev.y], [curr.x, curr.y], [curr.controlPoint1X, curr.controlPoint1Y], [curr.controlPoint2X, curr.controlPoint2Y]);
            }
            case PathCommandType.QuadraticBezierCurveTo: {
                return new QuadraticBezier(this.owner, [prev.x, prev.y], [curr.x, curr.y], [curr.controlPointX, curr.controlPointY]);
            }
            case PathCommandType.ArcTo: {
                return Arc.fromTwoPointsEtc.call(this, [prev.x, prev.y], [curr.x, curr.y], curr.radiusX, curr.radiusY, curr.largeArc, curr.positive, curr.xAxisRotation);
            }
            default: {
                return null;
            }
        }
    }

    getCommand(indexOrUuid: number | string): PathCommand | null {
        this._assertIsIndexOrUuid(indexOrUuid, "indexOrUuid");

        const [index] = this._parseIndexOrUuid(indexOrUuid);
        if (index === undefined) return null;

        const { uuid, ...rest } = util.cloneDeep(this._commands[index]);
        return rest;
    }
    setCommand(indexOrUuid: number | string, command: PathCommand) {
        this._assertIsIndexOrUuid(indexOrUuid, "indexOrUuid");
        this._assertIsPathCommand(command, "command");

        const [index, uuid] = this._parseIndexOrUuid(indexOrUuid);
        if (index === undefined || uuid === undefined) return false;

        const oldCmd = this._commands[index];
        const newCmd = util.cloneDeep(oldCmd);
        util.assignDeep(newCmd, command);
        if (!util.isEqualTo(oldCmd, newCmd)) this.trigger_(EventObject.collection(this, Path.events.commandChanged, index, uuid));
        this._commands[index] = newCmd;
        return true;
    }
    insertCommand(indexOrUuid: number | string, command: PathCommand) {
        this._assertIsIndexOrUuid(indexOrUuid, "indexOrUuid");
        this._assertIsPathCommand(command, "command");

        const [index, uuid] = this._parseIndexOrUuid(indexOrUuid);
        if (index === undefined || uuid === undefined) return false;

        const cmd = Object.assign(util.cloneDeep(command), { uuid: util.uuid() });
        this.trigger_(EventObject.collection(this, Path.events.commandAdded, index + 1, cmd.uuid));
        this._commands.splice(index, 0, cmd);
        return [index + 1, cmd.uuid] as [number, string];
    }
    removeCommand(indexOrUuid: number | string) {
        this._assertIsIndexOrUuid(indexOrUuid, "indexOrUuid");

        const [index, uuid] = this._parseIndexOrUuid(indexOrUuid);
        if (index === undefined || uuid === undefined) return false;
        this.trigger_(EventObject.collection(this, Path.events.commandRemoved, index, uuid));
        this._commands.splice(index, 1);
        return true;
    }
    appendCommand(command: PathCommand) {
        this._assertIsPathCommand(command, "command");

        const cmd = Object.assign(util.cloneDeep(command), { uuid: util.uuid() });
        const index = this.commandCount;
        this.trigger_(EventObject.collection(this, Path.events.commandAdded, index, cmd.uuid));
        this._commands.push(cmd);
        return [index, cmd.uuid] as [number, string];
    }

    getGraphics() {
        const g = new Graphics();
        if (!this.isValid()) return g;
        this._commands.forEach(cmd => {
            if (cmd.type === PathCommandType.MoveTo) {
                g.moveTo(cmd.x, cmd.y);
            }
            if (cmd.type === PathCommandType.LineTo) {
                g.lineTo(cmd.x, cmd.y);
            }
            if (cmd.type === PathCommandType.BezierCurveTo) {
                g.bezierCurveTo(cmd.controlPoint1X, cmd.controlPoint1Y, cmd.controlPoint2X, cmd.controlPoint2Y, cmd.x, cmd.y);
            }
            if (cmd.type === PathCommandType.QuadraticBezierCurveTo) {
                g.quadraticBezierCurveTo(cmd.controlPointX, cmd.controlPointY, cmd.x, cmd.y);
            }
            if (cmd.type === PathCommandType.ArcTo) {
                g.endpointArcTo(cmd.radiusX, cmd.radiusY, cmd.xAxisRotation, cmd.largeArc, cmd.positive, cmd.x, cmd.y);
            }
        });
        if (this.closed) {
            g.close();
        }
        return g;
    }
    clone() {
        return new Path(this.owner, this.commands);
    }
    copyFrom(shape: Path | null) {
        if (shape === null) shape = new Path(this.owner);
        this._setCommands(shape.commands);
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

validAndWithSameOwner(Path);

/**
 * @category Shape
 */
export default Path;
