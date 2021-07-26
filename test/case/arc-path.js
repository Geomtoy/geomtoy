import _ from "lodash"
import G from "../../src/geomtoy"
import vanillaCanvasDrawer from "../../src/geomtoy/adaptors/vanilla-canvas"
import vanillaSvgDrawer from "../../src/geomtoy/adaptors/vanilla-svg"

let c = document.querySelector("#canOrigin")
let ctx = c.getContext("2d")
ctx.strokeStyle = "red"
ctx.beginPath()
ctx.moveTo(50, 100)
//角度总是顺时针的
ctx.arc(50, 50, 50, 0.5 * Math.PI, 1 * Math.PI, true)
ctx.stroke()

ctx.strokeStyle = "blue"
ctx.beginPath()
ctx.moveTo(50, 100)
ctx.ellipse(50, 50, 25, 50, 0, 0.5 * Math.PI, 1 * Math.PI, false)
ctx.stroke()
ctx.closePath()

{
    let context = document.querySelector("#canGeomtoy").getContext("2d"),
        svg = document.querySelector("#svgGeomtoy"),
        e = new G.Ellipse(120, 120, 50, 60),
        p = new G.Point(40, 40),
        l = G.Line.fromPoints(new G.Point(40, 40), G.Point.zero),
        cd = new vanillaCanvasDrawer(context),
        sd = new vanillaSvgDrawer(svg)

        console.log(l,l.__proto__)
    cd.draw(e)
    sd.draw(e)
    cd.draw(p)
    sd.draw(p)
    cd.draw(l)
    sd.draw(l)


    let a = new SVGMatrix()
}
