import Geomtoy from "../.."
import Arc from "../basic/Arc"
import BaseObject from "../../base/BaseObject"
import Bezier from "../Bezier"
import Line from "../Line"
import LineSegment from "../LineSegment"
import Point from "../Point"
import QuadraticBezier from "../QuadraticBezier"
import { PathArcToCommand, PathBezierCurveToCommand, PathCommand, PathCommandType, PathLineToCommand, PathMoveToCommand, PathQuadraticBezierCurveToCommand } from "../types/path"
import util from "../../utility"
import assert from "../../utility/assertion"
import coord from "../../utility/coordinate"

class Path extends BaseObject {
    private _closed = true
    private _commands: PathCommand[] = []

    constructor(owner: Geomtoy, commands: PathCommand[])
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any) {
        super(o)
    }
    get closed() {
        return this._closed
    }
    set closed(value: boolean) {
        assert.isBoolean(value,"closed")
        this._closed = value
    }

    get commands() {
        return util.cloneDeep(this._commands)
    }

    static readonly events = Object.freeze({
        commandsReset: "commandsReset",
        commandAdded: "commandAdded",
        commandRemoved: "commandRemoved",
        commandChanged: "commandChanged"
    })

    isValid() {
        if (
            this._commands.some((c, index) => {
                if (index === 0) {
                    return c.type !== PathCommandType.MoveTo
                } else {
                    return c.type === PathCommandType.MoveTo
                }
            })
        ) {
            return false
        }
        if (this._commands.length < 2) return false
        return true
    }

    static moveTo(point: [number, number] | Point) {
        assert.isCoordinateOrPoint(point, "point")
        const [x, y] = point instanceof Point ? point.coordinate : point
        return { type: PathCommandType.MoveTo, coordinate: [x, y], uuid: util.uuid() }
    }
    static lineTo(point: [number, number] | Point) {
        assert.isCoordinateOrPoint(point, "point")
        const [x, y] = point instanceof Point ? point.coordinate : point
        return { type: PathCommandType.LineTo, coordinate: [x, y], uuid: util.uuid() }
    }
    static bezierCurveTo(controlPoint1: [number, number] | Point, controlPoint2: [number, number] | Point, point: [number, number] | Point) {
        assert.isCoordinateOrPoint(controlPoint1, "controlPoint1")
        assert.isCoordinateOrPoint(controlPoint2, "controlPoint2")
        assert.isCoordinateOrPoint(point, "point")
        const [cp1x, cp1y] = controlPoint1 instanceof Point ? controlPoint1.coordinate : controlPoint1
        const [cp2x, cp2y] = controlPoint2 instanceof Point ? controlPoint2.coordinate : controlPoint2
        const [x, y] = point instanceof Point ? point.coordinate : point
        return {
            type: PathCommandType.BezierCurveTo,
            controlPoint1Coordinate: [cp1x, cp1y],
            controlPoint2Coordinate: [cp2x, cp2y],
            coordinate: [x, y],
            uuid: util.uuid()
        }
    }
    static quadraticBezierCurveTo(controlPoint: [number, number] | Point, point: [number, number] | Point) {
        assert.isCoordinateOrPoint(controlPoint, "controlPoint")
        assert.isCoordinateOrPoint(point, "point")
        const [cpx, cpy] = controlPoint instanceof Point ? controlPoint.coordinate : controlPoint
        const [x, y] = point instanceof Point ? point.coordinate : point
        return { type: PathCommandType.QuadraticBezierCurveTo, controlPointCoordinate: [cpx, cpy], coordinate: [x, y], uuid: util.uuid() }
    }
    static arcTo(radiusX: number, radiusY: number, xAxisRotation: number, largeArc: boolean, positive: boolean, point: [number, number] | Point) {
        assert.isPositiveNumber(radiusX, "radiusX")
        assert.isPositiveNumber(radiusY, "radiusY")
        assert.isRealNumber(xAxisRotation, "xAxisRotation")
        assert.isBoolean(largeArc, "largeArc")
        assert.isBoolean(positive, "positive")
        assert.isCoordinateOrPoint(point, "point")
        const [x, y] = point instanceof Point ? point.coordinate : point
        return { type: PathCommandType.ArcTo, radiusX, radiusY, xAxisRotation, largeArc, positive, coordinate: [x, y], uuid: util.uuid() }
    }

    getCommandCount() {
        return this._commands.length
    }
    getPathSegmentByUuid(uuid: string): Arc | LineSegment | Bezier | QuadraticBezier | null {
        const foundIndex = this._commands.findIndex(c => c.uuid === uuid)
        if (foundIndex === -1) return null
        return this.getPathSegment(foundIndex)
    }
    getPathSegment(index: number): Arc | LineSegment | Bezier | QuadraticBezier | null {
        const curr = this._commands[index]
        const prev = index === 0 ? this._commands[this._commands.length - 1] : this._commands[index - 1]
        const type = curr.type
        switch (type) {
            case PathCommandType.MoveTo: {
                if (this.closed) {
                    return new LineSegment(this.owner, prev.coordinate, curr.coordinate)
                } else {
                    return null
                }
            }
            case PathCommandType.LineTo: {
                return new LineSegment(this.owner, prev.coordinate, curr.coordinate)
            }
            case PathCommandType.BezierCurveTo: {
                return new Bezier(this.owner, prev.coordinate, curr.coordinate, curr.controlPoint1Coordinate, curr.controlPoint2Coordinate)
            }
            case PathCommandType.QuadraticBezierCurveTo: {
                return new QuadraticBezier(this.owner, prev.coordinate, curr.coordinate, curr.controlPointCoordinate)
            }
            case PathCommandType.ArcTo: {
                return Arc.fromTwoPointsEtc.bind(this)(
                    prev.coordinate,
                    curr.coordinate,
                    curr.radiusX,
                    curr.radiusY,
                    curr.largeArc,
                    curr.positive,
                    curr.xAxisRotation
                )
            }
            default: {
                return null
            }
        }
    }

    getCommand(index: number): PathCommand | null {
        assert.isInteger(index, "index")
        assert.comparison(index, "index", "ge", 0)
        const cmd = this._commands[index]
        return cmd ? util.cloneDeep(cmd) : null
    }
    setCommand(index: number, command: PathCommand) {
        assert.isInteger(index, "index")
        assert.comparison(index, "index", "ge", 0)
        if (index > this._commands.length) return false
        if (this._isPathCommand(command)) throw new Error("[G]The `command` is not a `PathCommand`.")
        this.trigger([Path.events.commandChanged])
        this._commands[index] = util.cloneDeep(command)
        return true
    }
    insertCommand(index: number, command: PathCommand) {
        if (this._isPathCommand(command)) throw new Error("[G]The `command` is not a `PathCommand`.")
        this.trigger([Path.events.commandAdded])
        this._commands.splice(index, 0, util.cloneDeep(command))
    }
    removeCommand(index: number) {
        this.trigger([Path.events.commandRemoved])
        this._commands.splice(index, 1)
    }
    appendCommand(command: PathCommand) {
        if (this._isPathCommand(command)) throw new Error("[G]The `command` is not a `PathCommand`.")
        this.trigger([Path.events.commandAdded])
        this._commands.push(util.cloneDeep(command))
    }

    private _isPathCommand(p: any): p is PathCommand {
        if (!util.isPlainObject(p)) return false
        if (!p.type) return false
        if (!p.uuid) return false
        switch (p.type) {
            case PathCommandType.MoveTo: {
                if (Object.keys(p).length !== 3) return false
                if (!util.isCoordinate(p.coordinate)) return false
                return true
            }
            case PathCommandType.LineTo: {
                if (Object.keys(p).length !== 3) return false
                if (!util.isCoordinate(p.coordinate)) return false
                return true
            }
            case PathCommandType.BezierCurveTo: {
                if (Object.keys(p).length !== 5) return false
                if (!util.isCoordinate(p.controlPoint1Coordinate)) return false
                if (!util.isCoordinate(p.controlPoint2Coordinate)) return false
                if (!util.isCoordinate(p.coordinate)) return false
                return true
            }
            case PathCommandType.QuadraticBezierCurveTo: {
                if (Object.keys(p).length !== 4) return false
                if (!util.isCoordinate(p.controlPointCoordinate)) return false
                if (!util.isCoordinate(p.coordinate)) return false
                return true
            }
            case PathCommandType.ArcTo: {
                const l = Object.keys(p).length
                if (Object.keys(p).length !== 8) return false
                if (!util.isPositiveNumber(p.radiusX)) return false
                if (!util.isPositiveNumber(p.radiusY)) return false
                if (!util.isRealNumber(p.xAxisRotation)) return false
                if (!util.isBoolean(p.largeArc)) return false
                if (!util.isBoolean(p.positive)) return false
                if (!util.isCoordinate(p.coordinate)) return false
                return true
            }
            default: {
                return false
            }
        }
    }

    clone(): BaseObject {
        throw new Error("Method not implemented.")
    }
    copyFrom(object: BaseObject | null): this {
        throw new Error("Method not implemented.")
    }
    toString(): string {
        throw new Error("Method not implemented.")
    }
    toArray(): any[] {
        throw new Error("Method not implemented.")
    }
    toObject(): object {
        throw new Error("Method not implemented.")
    }
}

export default Path
