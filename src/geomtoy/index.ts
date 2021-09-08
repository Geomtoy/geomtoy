import util from "./utility"
import { assertIsBoolean, assertIsCoordinate, assertIsPositiveNumber, sealed } from "./decorator"

import Point from "./Point"
import Line from "./Line"
import Ray from "./Ray"
import Segment from "./Segment"
import Vector from "./Vector"
import Triangle from "./Triangle"
import Circle from "./Circle"
import Rectangle from "./Rectangle"
import Polyline from "./Polyline"
import Polygon from "./Polygon"
import RegularPolygon from "./RegularPolygon"
import Ellipse from "./Ellipse"
import Text from "./Text"

import Transformation from "./transformation"
import Inversion from "./inversion"

import {
    Options,
    defaultOptions,
    Tail,
    ConstructorOverloads,
    TailedConstructor,
    TailedStaticMethods,
    RecursivePartial,
    Factory,
    CoordinateSystem,
    defaultCoordinateSystem
} from "./types"
import VanillaCanvas from "./adaptor/vanilla-canvas"
import VanillaSvg from "./adaptor/vanilla-svg"
import GeomObject from "./base/GeomObject"
import coord from "./utility/coordinate"

function factory<T extends { new (...args: any): any }>(owner: Geomtoy, ctor: T): Factory<T> {
    // Use arrow function to define tailed constructor and static methods to avoid user trying to `new`(create instance of) them
    function tailFunction<F extends (...args: any) => any>(fn: F): (...args: Tail<Parameters<F>>) => ReturnType<F> {
        return (...args: Tail<Parameters<F>>) => fn(owner, ...args)
    }

    const constructorTailer: TailedConstructor<T> = (...args: Tail<ConstructorParameters<ConstructorOverloads<T>[number]>>) => {
        return new ctor(owner, ...(args as Tail<ConstructorParameters<T>>))
    }
    const staticMethodsTailer = util.reduce(
        // DO use `Object.getOwnPropertyNames` to retrieve all enumerable and non-enumerable property names,
        // for static methods defined as function like `static method(){}` is non-enumerable,
        // and static methods defined as variable like `static method = function(){} or () => {}` is enumerable
        util.filter(Object.getOwnPropertyNames(ctor as Record<string, any>), name => util.isFunction((ctor as Record<string, any>)[name])),
        (result, name) => {
            result[name] = tailFunction((ctor as Record<string, any>)[name])
            return result
        },
        {} as { [key: string]: (...args: any) => any }
    )
    return Object.assign(constructorTailer, staticMethodsTailer as TailedStaticMethods<T>)
}
function assignDeep<T extends { [key: string]: any }>(target: T, source: RecursivePartial<T>) {
    function assignDeepInner<U extends { [key: string]: any }>(target: U, source: any) {
        Object.keys(target).forEach((key: keyof U) => {
            if (util.isPlainObject(target[key])) {
                if (util.isPlainObject(source[key])) {
                    assignDeepInner(target[key], source[key])
                }
            } else {
                // same type check
                if (Object.prototype.toString.call(target[key]) === Object.prototype.toString.call(source[key])) {
                    target[key] = source[key]
                }
            }
        })
    }
    assignDeepInner(target, source)
}
function cloneDeep<T extends { [key: string]: any }>(target: T) {
    function cloneDeepInner<U extends { [key: string]: any }>(target: U) {
        const ret: U = {} as U
        Object.keys(target).forEach((key: keyof U) => {
            if (util.isPlainObject(target[key])) {
                ret[key] = cloneDeepInner(target[key])
            } else {
                ret[key] = target[key]
            }
        })
        return ret
    }
    return cloneDeepInner(target)
}
function applyOptionsRules(target: Options) {
    if (target.epsilon > 2 ** -16) target.epsilon = 2 ** -16
    if (target.epsilon < 2 ** -52) target.epsilon = 2 ** -52
}
@sealed
class Geomtoy {
    #uuid = util.uuid()

    #Point = factory(this, Point)
    #Line = factory(this, Line)
    #Ray = factory(this, Ray)
    #Segment = factory(this, Segment)
    #Vector = factory(this, Vector)
    #Triangle = factory(this, Triangle)
    #Circle = factory(this, Circle)
    #Rectangle = factory(this, Rectangle)
    #Polyline = factory(this, Polyline)
    #Polygon = factory(this, Polygon)
    #RegularPolygon = factory(this, RegularPolygon)
    #Ellipse = factory(this, Ellipse)
    #Text = factory(this, Text)
    #Transformation = factory(this, Transformation)
    #Inversion = factory(this, Inversion)

    #width: number = NaN
    #height: number = NaN
    #scale: number = 1
    #offset: [number, number] = [0, 0]

    #xAxisPositiveOnRight: boolean = true
    #yAxisPositiveOnBottom: boolean = true
    #origin: [number, number] = [0, 0]

    #options: Options
    #globalTransformation = new Transformation(this)

    constructor(width: number, height: number, options: RecursivePartial<Options> = {}) {
        Object.assign(this, { width, height })
        this.#options = cloneDeep(defaultOptions)
        this.setOptions(options)
        return Object.seal(this)
    }

    get width() {
        return this.#width
    }
    set width(value) {
        assertIsPositiveNumber(value, "width")
        this.#width = value
    }
    get height() {
        return this.#height
    }
    set height(value) {
        assertIsPositiveNumber(value, "height")
        this.#height = value
    }
    get scale() {
        return this.#scale
    }
    set scale(value) {
        assertIsPositiveNumber(value, "scale")
        this.#scale = value
        this.refreshGlobalTransformation()
    }
    get offset(): [number, number] {
        return [...this.#offset]
    }
    set offset(value) {
        assertIsCoordinate(value, "offset")
        this.#offset = value
        this.refreshGlobalTransformation()
    }
    get xAxisPositiveOnRight() {
        return this.#xAxisPositiveOnRight
    }
    set xAxisPositiveOnRight(value) {
        assertIsBoolean(value, "xAxisPositiveOnRight")
        this.#xAxisPositiveOnRight = value
        this.refreshGlobalTransformation()
    }
    get yAxisPositiveOnBottom() {
        return this.#yAxisPositiveOnBottom
    }
    set yAxisPositiveOnBottom(value) {
        assertIsBoolean(value, "yAxisPositiveOnBottom")
        this.#yAxisPositiveOnBottom = value
        this.refreshGlobalTransformation()
    }
    get origin(): [number, number] {
        return [...this.#origin]
    }
    set origin(value) {
        assertIsCoordinate(value, "origin")
        this.#origin = value
        this.refreshGlobalTransformation()
    }

    static adapters = {
        VanillaCanvas,
        VanillaSvg
    }
    get name() {
        return this.constructor.name
    }
    get uuid() {
        return this.#uuid
    }
    get globalTransformation() {
        return this.#globalTransformation.clone()
    }
    refreshGlobalTransformation() {
        const { origin, scale, offset, xAxisPositiveOnRight: xpr, yAxisPositiveOnBottom: ypb } = this
        this.#globalTransformation
            .reset()
            .translate(coord.x(origin) + coord.x(offset), coord.y(origin) + coord.y(offset))
            .scale(xpr ? scale : -scale, ypb ? scale : -scale)
    }

    getOptions() {
        return cloneDeep(this.#options)
    }
    setOptions(options: RecursivePartial<Options>) {
        assignDeep(this.#options, options)
        applyOptionsRules(this.#options)
    }

    getBoundingBox(): [number, number, number, number] {
        const scale = this.#scale
        const [x, y] = this.globalTransformation.antitransformCoordinate([0, 0])
        const width = this.#width / scale
        const height = this.#height / scale
        return [x, y, width, height]
    }

    adopt(object: GeomObject) {
        object.owner = this
    }

    get Point() {
        return this.#Point
    }
    get Line() {
        return this.#Line
    }
    get Ray() {
        return this.#Ray
    }
    get Segment() {
        return this.#Segment
    }
    get Vector() {
        return this.#Vector
    }
    get Triangle() {
        return this.#Triangle
    }
    get Circle() {
        return this.#Circle
    }
    get Rectangle() {
        return this.#Rectangle
    }
    get Polyline() {
        return this.#Polyline
    }
    get Polygon() {
        return this.#Polygon
    }
    get RegularPolygon() {
        return this.#RegularPolygon
    }
    get Ellipse() {
        return this.#Ellipse
    }
    get Text() {
        return this.#Text
    }
    get Transformation() {
        return this.#Transformation
    }
    get Inversion() {
        return this.#Inversion
    }
}

/**
 * @category Entry
 */
export default Geomtoy
