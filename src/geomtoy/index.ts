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

import Transformation from "./transformation"
import Inversion from "./inversion"

import Matrix from "./transformation/Matrix"
import { Options, defaultOptions } from "./types"
import VanillaCanvas from "./adaptor/vanilla-canvas"
import VanillaSvg from "./adaptor/vanilla-svg"
import SvgDotJs from "./adaptor/svg-dot-js"

type Tail<T extends any[]> = T extends [infer A, ...infer R] ? R : never
// prettier-ignore
type ConstructorOverloads<T> =
    T extends {
        new(...args: infer A1): infer R1
        new(...args: infer A2): infer R2
        new(...args: infer A3): infer R3
        new(...args: infer A4): infer R4
        new(...args: infer A5): infer R5
        new(...args: infer A6): infer R6
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3,
        new (...args: A4) => R4,
        new (...args: A5) => R5,
        new (...args: A6) => R6,
    ]
    : T extends {
        new(...args: infer A1): infer R1
        new(...args: infer A2): infer R2
        new(...args: infer A3): infer R3
        new(...args: infer A4): infer R4
        new(...args: infer A5): infer R5
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3,
        new (...args: A4) => R4,
        new (...args: A5) => R5
    ]
    : T extends {
        new(...args: infer A1): infer R1
        new(...args: infer A2): infer R2
        new(...args: infer A3): infer R3
        new(...args: infer A4): infer R4
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3,
        new (...args: A4) => R4
    ]
    : T extends {
        new(...args: infer A1): infer R1
        new(...args: infer A2): infer R2
        new(...args: infer A3): infer R3
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3
    ]
    : T extends {
        new(...args: infer A1): infer R1
        new(...args: infer A2): infer R2
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2
    ]
    : T extends {
        new(...args: infer A1): infer R1
    }
    ? [
        new (...args: A1) => R1
    ]
    : never
// prettier-ignore
type TailedStaticMethods<T extends { new (...args: any): any }> = {
    [K in keyof T as T[K] extends (...arg: any) => any ? K : never]
    : T[K] extends (...arg: any) => any ? (...arg: Tail<Parameters<T[K]>>) => ReturnType<T[K]> : never
}
type TailedConstructor<T extends { new (...args: any): any }> = {
    (...arg: Tail<ConstructorParameters<ConstructorOverloads<T>[number]>>): InstanceType<T>
}
type TailedConstructorAndStaticMethods<T extends { new (...args: any): any }> = TailedStaticMethods<T> & TailedConstructor<T>

function tailConstructorAndStaticMethods<T extends { new (...args: any): any }>(owner: Geomtoy, ctor: T): TailedConstructorAndStaticMethods<T> {
    // Use arrow function to define tailed constructor and static methods to avoid user trying to `new`(create instance of) them
    function tailFunction<F extends (...args: any) => any>(fn: F): (...args: Tail<Parameters<F>>) => ReturnType<F> {
        return (...args: Tail<Parameters<F>>) => fn(owner, ...args)
    }

    let constructorTailer: TailedConstructor<T> = (...args: Tail<ConstructorParameters<ConstructorOverloads<T>[number]>>) => {
            return new ctor(owner, ...(args as Tail<ConstructorParameters<T>>))
        },
        staticMethodsTailer = util.transform(
            // DO use `Object.getOwnPropertyNames` to retrieve all enumerable and non-enumerable property names,
            // for static methods defined as function like `static method(){}` is non-enumerable,
            // and static methods defined as variable like `static method = function(){} or () => {}` is enumerable
            util.filter(Object.getOwnPropertyNames(ctor as Record<string, any>), name => util.isFunction((ctor as Record<string, any>)[name])),
            (result, name) => (result[name] = tailFunction((ctor as Record<string, any>)[name])),
            {} as { [key: string]: (...args: any) => any }
        )

    return util.assign(constructorTailer, staticMethodsTailer as TailedStaticMethods<T>)
}
function isOptions(o: any): o is Options {
    let s: Options = o
    return (
        typeof s.epsilon === "number" &&
        typeof s.graphic.pointSize === "number" &&
        typeof s.coordinateSystem.xAxisPositiveOnRight === "boolean" &&
        typeof s.coordinateSystem.yAxisPositiveOnBottom === "boolean" &&
        typeof s.coordinateSystem.originX === "number" &&
        typeof s.coordinateSystem.originY === "number" &&
        typeof s.coordinateSystem.scale === "number"
    )
}

@sealed
class Geomtoy {
    #options: Options

    #name = "Geomtoy"
    #uuid = util.uuid()

    #Point: TailedConstructorAndStaticMethods<typeof Point> = tailConstructorAndStaticMethods(this, Point)
    #Line: TailedConstructorAndStaticMethods<typeof Line> = tailConstructorAndStaticMethods(this, Line)
    #Segment: TailedConstructorAndStaticMethods<typeof Segment> = tailConstructorAndStaticMethods(this, Segment)
    #Vector: TailedConstructorAndStaticMethods<typeof Vector> = tailConstructorAndStaticMethods(this, Vector)
    #Triangle: TailedConstructorAndStaticMethods<typeof Triangle> = tailConstructorAndStaticMethods(this, Triangle)
    #Circle: TailedConstructorAndStaticMethods<typeof Circle> = tailConstructorAndStaticMethods(this, Circle)
    #Rectangle: TailedConstructorAndStaticMethods<typeof Rectangle> = tailConstructorAndStaticMethods(this, Rectangle)
    #Polyline: TailedConstructorAndStaticMethods<typeof Polyline> = tailConstructorAndStaticMethods(this, Polyline)
    #Polygon: TailedConstructorAndStaticMethods<typeof Polygon> = tailConstructorAndStaticMethods(this, Polygon)
    #RegularPolygon: TailedConstructorAndStaticMethods<typeof RegularPolygon> = tailConstructorAndStaticMethods(this, RegularPolygon)
    #Ellipse: TailedConstructorAndStaticMethods<typeof Ellipse> = tailConstructorAndStaticMethods(this, Ellipse)
    #Transformation: TailedConstructorAndStaticMethods<typeof Transformation> = tailConstructorAndStaticMethods(this, Transformation)
    #Inversion: TailedConstructorAndStaticMethods<typeof Inversion> = tailConstructorAndStaticMethods(this, Inversion)

    constructor(options: Partial<Options> = {}) {
        let tc = util.defaultsDeep(util.cloneDeep(options), defaultOptions)
        if (!isOptions(tc)) throw new Error()
        this.#options = tc

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
        return util.cloneDeep(this.#options)
    }
    setOptions(options: Partial<Options> = {}) {
        let tc = util.defaultsDeep(util.cloneDeep(options), util.cloneDeep(this.#options))
        if (!isOptions(tc)) throw new Error()
        util.assignDeep(this.#options, tc)
    }
}

/**
 * @category Entry
 */
export default Geomtoy
