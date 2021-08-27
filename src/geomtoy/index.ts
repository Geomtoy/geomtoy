import util from "./utility"
import { sealed } from "./decorator"

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
import Ellipse from "./Ellipse"
import Ray from "./Ray"

import Transformation from "./transformation"
import Inversion from "./inversion"

import Matrix from "./transformation/Matrix"
import {
    Options,
    defaultOptions,
    Tail,
    TailedConstructorAndStaticMethods,
    ConstructorOverloads,
    TailedConstructor,
    TailedStaticMethods,
    RecursivePartial,
    Factory
} from "./types"
import VanillaCanvas from "./adaptor/vanilla-canvas"
import VanillaSvg from "./adaptor/vanilla-svg"
import SvgDotJs from "./adaptor/svg-dot-js"
import GeomObject from "./base/GeomObject"

function tailConstructorAndStaticMethods<T extends { new (...args: any): any }>(owner: Geomtoy, ctor: T): TailedConstructorAndStaticMethods<T> {
    // Use arrow function to define tailed constructor and static methods to avoid user trying to `new`(create instance of) them
    function tailFunction<F extends (...args: any) => any>(fn: F): (...args: Tail<Parameters<F>>) => ReturnType<F> {
        return (...args: Tail<Parameters<F>>) => fn(owner, ...args)
    }

    let constructorTailer: TailedConstructor<T> = (...args: Tail<ConstructorParameters<ConstructorOverloads<T>[number]>>) => {
            return new ctor(owner, ...(args as Tail<ConstructorParameters<T>>))
        },
        staticMethodsTailer = util.reduce(
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

function assignOptions(target: Options, source: RecursivePartial<Options>) {
    function assignOptionsInner(target: { [key: string]: any }, source: { [key: string]: any }) {
        for (const key in target) {
            if (util.isPlainObject(target[key])) {
                if (util.isPlainObject(source[key])) {
                    assignOptionsInner(target[key], source[key])
                }
            } else {
                if (Object.prototype.toString.call(target[key]) === Object.prototype.toString.call(source[key])) {
                    target[key] = source[key]
                }
            }
        }
    }
    assignOptionsInner(target, source)
}
function applyOptionsRules(target: Options) {
    if (target.epsilon > 2 ** -16) target.epsilon = 2 ** -16
    if (target.epsilon < 2 ** -52) target.epsilon = 2 ** -52
}

function cloneOptions(target: Options) {
    function cloneOptionsInner(target: Options) {
        let ret: { [key: string]: any } = {}
        for (const key in target) {
            if (util.isPlainObject((target as any)[key])) {
                ret[key] = cloneOptionsInner((target as any)[key])
            } else {
                ret[key] = (target as any)[key]
            }
        }
        return ret
    }
    return cloneOptionsInner(target) as Options
}

@sealed
class Geomtoy {
    #options: Options

    #name = "Geomtoy"
    #uuid = util.uuid()

    #Point = tailConstructorAndStaticMethods(this, Point) as any as Factory<typeof Point>
    #Line = tailConstructorAndStaticMethods(this, Line) as any as Factory<typeof Line>
    #Segment = tailConstructorAndStaticMethods(this, Segment) as any as Factory<typeof Segment>
    #Vector = tailConstructorAndStaticMethods(this, Vector) as any as Factory<typeof Vector>
    #Triangle = tailConstructorAndStaticMethods(this, Triangle) as any as Factory<typeof Triangle>
    #Circle = tailConstructorAndStaticMethods(this, Circle) as any as Factory<typeof Circle>
    #Rectangle = tailConstructorAndStaticMethods(this, Rectangle) as any as Factory<typeof Rectangle>
    #Polyline = tailConstructorAndStaticMethods(this, Polyline) as any as Factory<typeof Polyline>
    #Polygon = tailConstructorAndStaticMethods(this, Polygon) as any as Factory<typeof Polygon>
    #RegularPolygon = tailConstructorAndStaticMethods(this, RegularPolygon) as any as Factory<typeof RegularPolygon>
    #Ellipse = tailConstructorAndStaticMethods(this, Ellipse) as any as Factory<typeof Ellipse>
    #Transformation = tailConstructorAndStaticMethods(this, Transformation) as any as Factory<typeof Transformation>
    #Inversion = tailConstructorAndStaticMethods(this, Inversion) as any as Factory<typeof Inversion>

    constructor(options: RecursivePartial<Options> = {}) {
        this.#options = cloneOptions(defaultOptions)
        assignOptions(this.#options, options)
        applyOptionsRules(this.#options)
        return Object.seal(this)
    }

    static adapters = {
        VanillaCanvas,
        VanillaSvg,
        SvgDotJs
    }

    get name() {
        return this.#name
    }
    get uuid() {
        return this.#uuid
    }
    get globalTransformation() {
        let { scale: sx, scale: sy, originX: tx, originY: ty, xAxisPositiveOnRight: xpr, yAxisPositiveOnBottom: ypb } = this.getOptions().coordinateSystem
        if (!xpr) sx = -sx
        if (!ypb) sy = -sy

        // If `sx` and `sy` have different sign, the positive rotation angle is anticlockwise, otherwise clockwise.
        return Matrix.identity.postMultiplySelf(new Matrix(1, 0, 0, 1, tx, ty)).postMultiplySelf(new Matrix(sx, 0, 0, sy, 0, 0))
    }

    get Point() {
        return this.#Point
    }
    get Line() {
        return this.#Line
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
    get Transformation() {
        return this.#Transformation
    }
    get Inversion() {
        return this.#Inversion
    }

    getOptions() {
        return cloneOptions(this.#options)
    }
    setOptions(options: RecursivePartial<Options> = {}) {
        assignOptions(this.#options, options)
        applyOptionsRules(this.#options)
    }

    adopt(object: GeomObject) {
        object.owner = this
    }
}

/**
 * @category Entry
 */
export default Geomtoy
