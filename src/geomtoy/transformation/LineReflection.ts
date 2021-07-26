import _ from "lodash"
import Matrix from "./Matrix"
import Point from "../Point"
import Line from "../Line"
import { is, sealed } from "../decorator"

@sealed
class LineReflection extends Matrix {
    #line: Line | undefined

    constructor(line: Line) {
        super()
        if (line instanceof Line) {
            Object.seal(Object.assign(this, { line }))
            this.#lineReflection()
            return this
        }
        throw new Error(`[G]Arguments can NOT construct a LineReflection.`)
    }

    @is("line")
    get line(): Line {
        return this.#line!
    }
    set line(value) {
        this.#line = value
        this.#lineReflection()
    }

    static get yAxis() {
        return new LineReflection(Line.fromPoints(Point.zero, new Point(0, 1)))
    }
    static get xAxis() {
        return new LineReflection(Line.fromPoints(Point.zero, new Point(1, 0)))
    }
    static get yEqPositiveX() {
        return new LineReflection(Line.fromPoints(Point.zero, new Point(1, 1)))
    }
    static get yEqNegativeX() {
        return new LineReflection(Line.fromPoints(Point.zero, new Point(-1, -1)))
    }

    #lineReflection() {
        let la = this.#line!.a,
            lb = this.#line!.b,
            lc = this.#line!.c,
            denominator = la ** 2 + lb ** 2

        this.a = (lb ** 2 - la ** 2) / denominator
        this.b = -(2 * la * lb) / denominator
        this.c = this.b
        this.d = -this.a
        this.e = -(2 * la * lc) / denominator
        this.f = -(2 * lb * lc) / denominator
    }
    clone() {
        return new LineReflection(this.line)
    }
}

export default LineReflection
