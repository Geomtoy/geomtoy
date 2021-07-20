import GeomObject from "./base/GeomObjectD0"
import Graphic from "./graphic"
import Point from "./Point"
import { GraphicImplType } from "./types"

class Ellipse {
    constructor(public cx: number, public cy: number, public rx: number, public ry: number) {}

    #pathPoints: Array<Point> = []

    getGraphic(type: GraphicImplType) {
        /**
         * @see https://www.tinaja.com/glib/ellipse4.pdf
         */
        const kappa = 0.551784 //0.5522848
        let x = this.cx,
            y = this.cy,
            a = this.rx,
            b = this.ry,
            ox = a * kappa, // 水平控制點偏移量
            oy = b * kappa // 垂直控制點偏移量
        let g = new Graphic()
        g.moveTo(x - a, y)
        g.bezierCurveTo(x - a, y - oy, x - ox, y - b, x, y - b)
        g.bezierCurveTo(x + ox, y - b, x + a, y - oy, x + a, y)
        g.bezierCurveTo(x + a, y + oy, x + ox, y + b, x, y + b)
        g.bezierCurveTo(x - ox, y + b, x - a, y + oy, x - a, y)
        g.close()
        return g.valueOf(type)
    }
}

export default Ellipse
