import Geomtoy from "../../src/geomtoy"
import "./assets/dg"
import colors from "./assets/colors"
import interact from "./assets/interact"

const canvas = document.querySelector("#canvas")
const svg = document.querySelector("#svg")
const G = new Geomtoy(1000,1000,{
    epsilon: 2 ** -32,
    coordinateSystem: {
        scale: 4,
        xAxisPositiveOnRight: true,
        yAxisPositiveOnBottom: true
    },
    graphics: {
        pointSize: 4
    }
})
const canvasRenderer = new Geomtoy.adapters.VanillaCanvas(canvas, G, { lineJoin: "round" })
const svgRenderer = new Geomtoy.adapters.VanillaSvg(svg, G, { lineJoin: "round" })
const touchables = {
    point1: {
        object: G.Point(200, 120),
        controller: {
            x: undefined,
            y: undefined
        },
        path: undefined
    },
    point2: {
        object: G.Point(200, 100),
        controller: {
            x: undefined,
            y: undefined
        },
        path: undefined
    },
    point3: {
        object: G.Point(150, 160),
        controller: {
            x: undefined,
            y: undefined
        },
        path: undefined
    }
}
const gui = new dat.GUI()
const setting = {
    renderer: "svg"
}
console.log(touchables.point1.object)
gui.add(setting, "renderer", ["canvas", "svg"])
    .listen()
    .onChange(value => showRender(value))
showRender("svg")
function showRender(type) {
    canvas.style.display = svg.style.display = "none"
    if (type === "canvas") {
        canvas.style.display = "block"
        draw(canvasRenderer)
    }
    if (type === "svg") {
        svg.style.display = "block"
        draw(svgRenderer)
    }
}
interact.responsive(canvas, () => {
    if (setting.renderer === "canvas") draw(canvasRenderer)
})
interact.responsive(svg, () => {
    if (setting.renderer === "svg") draw(svgRenderer)
})
interact.dragAndDrop(touchables, canvas, canvasRenderer, () => draw(canvasRenderer))
interact.dragAndDrop(touchables, svg, svgRenderer, () => draw(svgRenderer))

function draw(renderer) {
    renderer.clear()

    renderer.stroke(colors.black)
    renderer.fill("#00000000")

    touchables.point1.path = renderer.draw(touchables.point1.object)
    touchables.point2.path = renderer.draw(touchables.point2.object)
    touchables.point3.path = renderer.draw(touchables.point3.object)
    let p1 = touchables.point1.object
    let p2 = touchables.point2.object
    let p3 = touchables.point3.object

    renderer.stroke(colors.red + "80")
    renderer.drawBehind(G.Triangle(p1, p2, p3))

    renderer.draw(G.Circle(20,p1))

}
