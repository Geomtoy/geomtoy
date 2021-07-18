import Path from "./utility/Path"

class Ellipse {
    constructor(public cx: number, public cy: number, public rx: number, public ry: number) {}

    generateDrawingPath() {
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

        //     ctx.moveTo(x - a, y);
        //     ctx.bezierCurveTo(x - a, y - oy, x - ox, y - b, x, y - b);
        //     ctx.bezierCurveTo(x + ox, y - b, x + a, y - oy, x + a, y);
        //     ctx.bezierCurveTo(x + a, y + oy, x + ox, y + b, x, y + b);
        //     ctx.bezierCurveTo(x - ox, y + b, x - a, y + oy, x - a, y);
        //     ctx.closePath();
    }
}

export default Ellipse
