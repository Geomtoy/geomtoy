import Line from "../Line"
import Matrix from "./Matrix"
import _ from "lodash"
import Point from "../Point"

class LineReflection extends Matrix {
    #line: Line

    constructor(a: number, b: number, c: number)
    constructor(line: Line)
    constructor()
    constructor(a?: any, b?: any, c?: any) {
        super()
        if (_.isNumber(a) && _.isNumber(b) && _.isNumber(c)) {
            this.#line = new Line(a, b, c)
            this.#lineReflection()
            return this
        }
        if (a instanceof Line) {
            this.#line = a
            this.#lineReflection()
            return this
        }

        this.#line = Line.fromPoints(Point.zero, new Point(0, 1))
        this.#lineReflection()
    }

    get line() {
        return this.#line
    }
    set line(value) {
        this.#line = value
        this.#lineReflection()
    }

    static get yAxis() {
        return new LineReflection()
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
        let la = this.#line.a,
            lb = this.#line.b,
            lc = this.#line.c,
            denominator = la ** 2 + lb ** 2

        this.a = (lb ** 2 - la ** 2) / denominator
        this.b = -(2 * la * lb) / denominator
        this.c = this.b
        this.d = -this.a
        this.e = -(2 * la * lc) / denominator
        this.f = -(2 * lb * lc) / denominator
    }
}

export default LineReflection
