
import Graphic from "./graphic"
import Point from "./Point"
import Vector from "./Vector"
import type from "./utility/type"
import { GraphicImplType, Coordinate } from "./types"
import { is, sealed } from "./decorator"
import GeomObject from "./base/GeomObject"
import Transformation from "./transformation"

@sealed
class Ellipse extends GeomObject {
    
    #centerPoint: Point | undefined
    #radiusX: number | undefined
    #radiusY: number | undefined
    #rotation :number | undefined

    constructor(centerPosition: Coordinate | Point | Vector, radiusX: number, radiusY: number,rotation:number) {
        super()
        let a1 = centerPosition,
            a2 = radiusX,
            a3 = radiusY

        if ((type.isCoordinate(a1) || a1 instanceof Point || a1 instanceof Vector) && type.isNumber(a2) && type.isNumber(a3)) {
            let cp = new Point(a1)
            Object.seal(Object.assign(this, { centerPoint: cp, radiusX: a2, radiusY: a3 }))
            return this
        }
        throw new Error(`[G]Arguments can NOT construct a ellipse.`)
    }

    @is("point")
    get centerPoint() {
        return this.#centerPoint!
    }
    set centerPoint(value) {
        this.#centerPoint = value
    }
    @is("positiveNumber")
    get radiusX() {
        return this.#radiusX!
    }
    set radiusX(value) {
        this.#radiusX = value
    }
    @is("positiveNumber")
    get radiusY() {
        return this.#radiusY!
    }
    set radiusY(value) {
        this.#radiusY = value
    }
    @is("realNumber")
    get rotation (){
        return this.#rotation!
    }
    set rotation (value){
        this.#rotation = value
    }
 

    getEccentricity(){

        
    }

    
    clone(): GeomObject {
        throw new Error("Method not implemented.")
    }
    toString(): string {
        throw new Error("Method not implemented.")
    }
    toObject(): object {
        throw new Error("Method not implemented.")
    }
    toArray(): any[] {
        throw new Error("Method not implemented.")
    }


    getGraphic(type: GraphicImplType) {
        let x = this.centerPoint.x,
            y = this.centerPoint.y,
            rx = this.radiusX,
            ry = this.radiusY,
            g = new Graphic()
        g.moveTo(0, 0)
            //let graphic decide the start point itself
            .centerArcTo(x, y, rx, ry, 0, 2 * Math.PI, 0)
        return g.valueOf(type)
    }

    //https://www.coder.work/article/1220553
    static findTangentLineOfTwoEllipse(ellipse1:Ellipse, ellipse2:Ellipse){

    }

    //https://zhuanlan.zhihu.com/p/64550850
    static findTangentLineOfEllipseAndParabola(){}

    apply(transformation: Transformation): GeomObject {
        throw new Error("Method not implemented.")
    }
   

    getGraphicAlt(type: GraphicImplType) {
        /**
         * @see https://www.tinaja.com/glib/ellipse4.pdf
         */
        const kappa = 0.551784 //or 0.5522848
        let x = this.centerPoint.x,
            y = this.centerPoint.y,
            rx = this.radiusX,
            ry = this.radiusY,
            ox = rx * kappa, // x axis control point offset
            oy = ry * kappa // y axis control point offset
        let g = new Graphic()
        g.moveTo(x - rx, y)
            .bezierCurveTo(x - rx, y - oy, x - ox, y - ry, x, y - ry)
            .bezierCurveTo(x + ox, y - ry, x + rx, y - oy, x + rx, y)
            .bezierCurveTo(x + rx, y + oy, x + ox, y + ry, x, y + ry)
            .bezierCurveTo(x - ox, y + ry, x - rx, y + oy, x - rx, y)

        return g.valueOf(type)
    }
}

export default Ellipse
