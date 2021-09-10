import Geomtoy from "../../src/geomtoy"
import "./assets/dg"
import colors from "./assets/colors"
import interact from "./assets/interact"
import rendererSwitch from "./assets/renderer-switch"

const canvas = document.querySelector("#canvas")
const svg = document.querySelector("#svg")

const G = new Geomtoy(100, 100, {
    epsilon: 2 ** -32,
    graphics: {
        pointSize: 6,
        lineRange: 1000
    }
})
// G.xAxisPositiveOnRight = false
G.yAxisPositiveOnBottom = false
G.scale = 10

const canvasRenderer = new Geomtoy.adapters.VanillaCanvas(canvas, G, { lineJoin: "round" })
const svgRenderer = new Geomtoy.adapters.VanillaSvg(svg, G, { lineJoin: "round" })
const gui = new dat.GUI()

const touchables = {
    point1: {
        object: G.Point(-25, -12),
        controller: {
            x: undefined,
            y: undefined
        },
        path: undefined
    },
    point2: {
        object: G.Point(0, 25),
        controller: {
            x: undefined,
            y: undefined
        },
        path: undefined
    },
    point3: {
        object: G.Point(35, -16),
        controller: {
            x: undefined,
            y: undefined
        },
        path: undefined
    }
}
const setting = {
    sideLines: true,
    medianSegments: false,
    centroidPoint: false,
    medialTriangle: false,
    antimedialTriangle: false,
    angleBisectingSegments: false,
    incenterPoint: false,
    inscribedCircle: false,
    altitudeLines: false,
    orthocenterPoint: false,
    orthicTriangle: false,
    polarCircle: false,
    perpendicularlyBisectingLines: false,
    circumcenterPoint: false,
    circumscribedCircle: true,
    escenterPoints: false,
    escribedCircles: false,
    symmedianSegments: false,
    lemoinePoint: false,
    eulerLine: false,
    ninePointCenterPoint: false,
    ninePointCircle: false
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
        let cWidth = width / G.scale,
            cHeight = height / G.scale
        Object.getOwnPropertyNames(touchables).forEach(name => {
            touchables[name].controller.x.min(-cWidth / 2)
            touchables[name].controller.x.max(cWidth / 2)
            touchables[name].controller.y.min(-cHeight / 2)
            touchables[name].controller.y.max(cHeight / 2)
        })
        draw(currentRenderer)
    })
})

const guiObject = gui.addFolder("objects")
guiObject.open()
Object.keys(touchables).forEach(name => {
    let folder = guiObject.addFolder(name)
    folder.open()
    let controllerX = folder
        .add(touchables[name].object, "x", 0, 0, 0.1)
        .listen()
        .onChange(() => draw(currentRenderer))
    touchables[name].controller.x = controllerX
    let controllerY = folder
        .add(touchables[name].object, "y", 0, 0, 0.1)
        .listen()
        .onChange(() => draw(currentRenderer))
    touchables[name].controller.y = controllerY
})
const guiSetting = gui.addFolder("setting")
guiSetting.open()
Object.keys(setting).forEach(name => {
    guiSetting
        .add(setting, name)
        .listen()
        .onChange(() => draw(currentRenderer))
})

const mathFont = "Cambria Math, Times New Roman, math, serif"

function draw(renderer) {
    renderer.clear()

    renderer.strokeWidth(2)
    renderer.stroke(colors.grey + "CC")
    renderer.fill(colors.grey + "CC")
    renderer.draw(G.Point.zero())
    renderer.draw(G.Text(1, 0, "O", { size: 40, italic: true, family: mathFont }))

    renderer.fill(colors.black + "FF")
    renderer.stroke(colors.black + "FF")
    touchables.point1.path = renderer.draw(touchables.point1.object)
    touchables.point2.path = renderer.draw(touchables.point2.object)
    touchables.point3.path = renderer.draw(touchables.point3.object)
    renderer.draw(G.Text(touchables.point1.object.x + 1, touchables.point1.object.y, "A", { size: 40, italic: true, family: mathFont }))
    renderer.draw(G.Text(touchables.point2.object.x + 1, touchables.point2.object.y, "B", { size: 40, italic: true, family: mathFont }))
    renderer.draw(G.Text(touchables.point3.object.x + 1, touchables.point3.object.y, "C", { size: 40, italic: true, family: mathFont }))

    // renderer.stroke(colors.red)
    // renderer.strokeWidth(4)
    // renderer.strokeDash([10,10])
    // renderer.strokeDashOffset(10)
    // renderer.strokeDash([10,10])
    const tri = G.Triangle(touchables.point1.object, touchables.point2.object, touchables.point3.object)

    if (tri.isValid()) {
        renderer.fill("transparent")
        renderer.draw(tri, true)

        renderer.stroke(colors.grey + "CC")
        renderer.strokeDash([2, 2])
        setting.sideLines &&
            renderer.drawBatch(
                tri.getSideSegments().map(s => s.toLine()),
                true
            )
        renderer.strokeDash([])
        renderer.stroke(colors.red + "CC")
        setting.medianSegments && renderer.drawBatch(tri.getMedianSegments(), true)
        setting.centroidPoint && renderer.draw(tri.getCentroidPoint(), true)
        setting.medialTriangle && renderer.draw(tri.getMedialTriangle(), true)
        setting.antimedialTriangle && renderer.draw(tri.getAntimedialTriangle(), true)
        renderer.stroke(colors.green + "CC")
        setting.angleBisectingSegments && renderer.drawBatch(tri.getAngleBisectingSegments(), true)
        setting.incenterPoint && renderer.draw(tri.getIncenterPoint(), true)
        setting.inscribedCircle && renderer.draw(tri.getInscribedCircle(), true)
        renderer.stroke(colors.purple + "CC")
        setting.altitudeLines &&
            renderer.drawBatch(
                tri.getAltitudeSegments().map(s => s.toLine()),
                true
            )
        setting.orthocenterPoint && renderer.draw(tri.getOrthocenterPoint(), true)
        let ot, pc
        setting.orthicTriangle && (ot = tri.getOrthicTriangle()) !== null && renderer.draw(ot, true)
        setting.polarCircle && (pc = tri.getPolarCircle()) !== null && renderer.draw(pc, true)
        renderer.stroke(colors.indigo + "CC")
        setting.perpendicularlyBisectingLines &&
            renderer.drawBatch(
                tri.getPerpendicularlyBisectingSegments().map(s => s.toLine()),
                true
            )
        setting.circumcenterPoint && renderer.draw(tri.getCircumcenterPoint(), true)
        setting.circumscribedCircle && renderer.draw(tri.getCircumscribedCircle(), true)
        renderer.stroke(colors.teal + "CC")
        setting.escenterPoints && renderer.drawBatch(tri.getEscenterPoints(), true)
        setting.escribedCircles && renderer.drawBatch(tri.getEscribedCircles(), true)
        renderer.stroke(colors.yellow + "CC")
        setting.symmedianSegments && renderer.drawBatch(tri.getSymmedianSegments(), true)
        setting.lemoinePoint && renderer.draw(tri.getLemoinePoint(), true)
        renderer.stroke(colors.brown + "CC")
        setting.eulerLine && renderer.draw(tri.getEulerLine(), true)
        setting.ninePointCenterPoint && renderer.draw(tri.getNinePointCenterPoint(), true)
        setting.ninePointCircle && renderer.draw(tri.getNinePointCircle(), true)
    }
}
