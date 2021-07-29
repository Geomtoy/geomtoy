import Point from "./Point"
import Line from "./Line"
import Segment from "./Segment"
import Vector from "./Vector"
import Triangle from "./Triangle"
import Circle from "./Circle"
import Rectangle from "./Rectangle"
import Polyline from "./Polyline"
import Polygon from "./Polygon"
import RegularPolygon from "./RegularPolygon"
import Inversion from "./inversion/Inversion"
import Ellipse from "./Ellipse"
import Matrix from "./transformation/Matrix"
import { defaultOptions, Options } from "./types"

import vanillaCanvas from "./adaptor/vanilla-canvas"
import vanillaSvg from "./adaptor/vanilla-svg"
import svgDotJs from "./adaptor/svg-dot-js"
import util from "./utility"

function optionsMixin<T extends new (...args: any[]) => any>(c: T, options: Options) {
    class Mixin extends c {
        constructor(...args: any[]) {
            super()
        }
        options: Options = options
    }
    return Mixin
}

class Geomtoy {
    width: number
    height: number
    #options: Options

    constructor(width: number, height: number, options: Partial<Options> = {}) {
        this.width = width
        this.height = height
        this.#options = util.defaultsDeep(options, defaultOptions)
    }

    static adapters: object = {
        vanillaCanvas,
        vanillaSvg,
        svgDotJs
    }

    get options() {
        this.#options.global = {
            xAxisPositiveOnRight: this.#xAxisPositiveOnRight,
            yAxisPositiveOnBottom: this.#yAxisPositiveOnBottom,
            originX: this.#originX,
            originY: this.#originY,
            scale: this.#scale
        }
        return this.#options
    }

    get Point() {
        return optionsMixin(Point, this.options)
    }
    get Line() {
        return optionsMixin(Line, this.options)
    }
    get Segment() {
        return optionsMixin(Segment, this.options)
    }
    get Vector() {
        return optionsMixin(Vector, this.options)
    }
    get Triangle() {
        return optionsMixin(Triangle, this.options)
    }
    get Circle() {
        return optionsMixin(Circle, this.options)
    }
    get Ellipse() {
        return optionsMixin(Ellipse, this.options)
    }
    get Rectangle() {
        return optionsMixin(Rectangle, this.options)
    }
    get Polyline() {
        return optionsMixin(Polyline, this.options)
    }
    get Polygon() {
        return optionsMixin(Polygon, this.options)
    }
    get Inversion() {
        return optionsMixin(Inversion, this.options)
    }
    get RegularPolygon() {
        return optionsMixin(RegularPolygon, this.options)
    }

    #transformation = Matrix.identity
    #xAxisPositiveOnRight = true
    #yAxisPositiveOnBottom = true
    #originX = 0
    #originY = 0
    #scale = 1

    getCoordinateSystem() {
        return {
            xAxisPositiveOnRight: this.#xAxisPositiveOnRight,
            yAxisPositiveOnBottom: this.#yAxisPositiveOnBottom,
            originX: this.#originX,
            originY: this.#originY,
            scale: this.#scale
        }
    }
    setCoordinateSystem({ xAxisPositiveOnRight = true, yAxisPositiveOnBottom = true, originX = 0, originY = 0, scale = 1 }) {
        let sx = scale,
            sy = scale,
            tx = originX,
            ty = originY
        if (!xAxisPositiveOnRight) sx = -scale
        if (!yAxisPositiveOnBottom) sy = -scale

        this.#xAxisPositiveOnRight = xAxisPositiveOnRight
        this.#yAxisPositiveOnBottom = yAxisPositiveOnBottom
        this.#originX = originX
        this.#originY = originY
        this.#scale = scale

        // If `sx` and `sy` have different sign, the positive rotation angle is anticlockwise, otherwise clockwise.
        this.#transformation.postMultiplySelf(new Matrix(0, 0, 0, 0, tx, ty))
        this.#transformation.postMultiplySelf(new Matrix(sx, 0, 0, sy, 0, 0))
    }

    getGlobalTransformation() {
        return this.#transformation
    }
    setGlobalTransformation(matrix: Matrix) {
        this.#transformation = matrix
    }
}

export default Geomtoy
