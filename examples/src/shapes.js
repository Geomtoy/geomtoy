import Geomtoy from "../../src/geomtoy"
import "./assets/dg"
import colors from "./assets/colors"
import interact from "./assets/interact"
import rendererSwitch from "./assets/renderer-switch"

const canvas = document.querySelector("#canvas")
const svg = document.querySelector("#svg")
const G = new Geomtoy(100,100,{
    epsilon: 2 ** -32,
    graphics: {
        pointSize: 6
    }
})
const canvasRenderer = new Geomtoy.adapters.VanillaCanvas(canvas, G, { lineJoin: "round" })
const svgRenderer = new Geomtoy.adapters.VanillaSvg(svg, G, { lineJoin: "round" })
const gui = new dat.GUI()

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


let currentRenderer
const rendererList = { canvas: canvasRenderer, svg: svgRenderer }

rendererSwitch(gui, rendererList, "canvas", (type, renderer) => {
    currentRenderer = renderer
    Object.keys(rendererList)
        .filter(t => t !== type)
        .forEach(t => {
            interact.stopDragAndDrop(rendererList[t])
            interact.stopZoomAndPan(rendererList[t])
            interact.stopResponsive(rendererList[t])
        })
    interact.startDragAndDrop(touchables, currentRenderer, draw)
    interact.startZoomAndPan(currentRenderer, draw)
    interact.startResponsive(currentRenderer, (_, width, height) => {
        G.width = width
        G.height = height
        G.origin = [width / 2, height / 2]
        draw(currentRenderer)
    })
})


function draw(renderer) {
    renderer.clear()

    renderer.strokeWidth(2)
    renderer.stroke(colors.black)
    renderer.draw(G.Point.zero())
    renderer.fill("#00000000")

    touchables.point1.path = renderer.draw(touchables.point1.object)
    touchables.point2.path = renderer.draw(touchables.point2.object)
    touchables.point3.path = renderer.draw(touchables.point3.object)
    let p1 = touchables.point1.object
    let p2 = touchables.point2.object
    let p3 = touchables.point3.object

    renderer.stroke(colors.red + "80")
    renderer.draw(G.Triangle(p1, p2, p3),true)

    renderer.draw(G.Circle(20,p1))

}
