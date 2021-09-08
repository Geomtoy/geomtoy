import Geomtoy from "../../src/geomtoy"
import "./assets/dg"
import colors from "./assets/colors"
import interact from "./assets/interact"
import rendererSwitch from "./assets/renderer-switch"

const canvas = document.querySelector("#canvas")
const svg = document.querySelector("#svg")

const G = new Geomtoy(canvas.width, canvas.height, {
    epsilon: 2 ** -32,
    graphics: {
        pointSize: 6,
        lineRange: 1000
    }
})
G.xAxisPositiveOnRight = false
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
        offset:undefined,
        path: undefined
    },
    point2: {
        object: G.Point(0, 25),
        controller: {
            x: undefined,
            y: undefined
        },
        offset:undefined,
        path: undefined
    },
    point3: {
        object: G.Point(35, -16),
        controller: {
            x: undefined,
            y: undefined
        },
        offset:undefined,
        path: undefined
    }
}
const setting = {
    sideLines: true,
    medianSegments: false,
    centroidPoint: false,
    medialTriangle: false,
    antimedialTriangle: false,
    bisectingSegments: false,
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

rendererSwitch(gui, rendererList, "svg", (type, renderer) => {
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

function draw(renderer) {
    renderer.clear()

    renderer.strokeWidth(4)
    renderer.stroke(colors.black + "CC")

    renderer.fill("#000000FF")
    touchables.point1.path = renderer.draw(touchables.point1.object)
    touchables.point2.path = renderer.draw(touchables.point2.object)
    touchables.point3.path = renderer.draw(touchables.point3.object)

    renderer.fill(colors.black)
    // renderer.stroke(colors.red)
    // renderer.strokeWidth(4)
    // renderer.strokeDash([10,10])
    // renderer.strokeDashOffset(10)
    // renderer.draw(G.Text(touchables.point1.object.x , touchables.point1.object.y -1, "AA", { size: 40, bold: true }))
    // renderer.draw(G.Text(touchables.point2.object.x , touchables.point2.object.y -1, "B", { size: 40, bold: true }))
    // renderer.draw(G.Text(touchables.point3.object.x , touchables.point3.object.y -1, "C", { size: 40, bold: true }))

    // renderer.strokeDash([10,10])
    renderer.fill("#00000000")
    // renderer.strokeWidth(4)
    renderer.stroke(colors.black)
    renderer.strokeWidth(4)
    const tri = G.Triangle()
    Object.assign(tri, {
        point1: touchables.point1.object,
        point2: touchables.point2.object,
        point3: touchables.point3.object
    })

    if (tri.isValid()) {
        // renderer.strokeDash([4,4])
        renderer.drawBehind(tri)
        // renderer.strokeDash([])
        renderer.stroke(colors.grey + "CC")
        setting.sideLines && renderer.drawBehindBatch(...tri.getSideSegments().map(s => s.toLine()))

        renderer.stroke(colors.red + "CC")
        setting.medianSegments && renderer.drawBehindBatch(...tri.getMedianSegments())
        setting.centroidPoint && renderer.drawBehind(tri.getCentroidPoint())
        setting.medialTriangle && renderer.drawBehind(tri.getMedialTriangle())
        setting.antimedialTriangle && renderer.drawBehind(tri.getAntimedialTriangle())
        renderer.stroke(colors.green + "CC")
        setting.bisectingSegments && renderer.drawBehindBatch(...tri.getAngleBisectingSegments())
        setting.incenterPoint && renderer.drawBehind(tri.getIncenterPoint())
        setting.inscribedCircle && renderer.drawBehind(tri.getInscribedCircle())
        renderer.stroke(colors.purple + "CC")
        setting.altitudeLines && renderer.drawBehindBatch(...tri.getAltitudeSegments().map(s => s.toLine()))
        setting.orthocenterPoint && renderer.drawBehind(tri.getOrthocenterPoint())
        let ot, pc
        setting.orthicTriangle && (ot = tri.getOrthicTriangle()) !== null && renderer.drawBehind(ot)
        setting.polarCircle && (pc = tri.getPolarCircle()) !== null && renderer.drawBehind(pc)
        renderer.stroke(colors.indigo + "CC")
        setting.perpendicularlyBisectingLines && renderer.drawBehindBatch(...tri.getPerpendicularlyBisectingSegments().map(s => s.toLine()))
        setting.circumcenterPoint && renderer.drawBehind(tri.getCircumcenterPoint())
        setting.circumscribedCircle && renderer.drawBehind(tri.getCircumscribedCircle())
        renderer.stroke(colors.teal + "CC")
        setting.escenterPoints && renderer.drawBehindBatch(...tri.getEscenterPoints())
        setting.escribedCircles && renderer.drawBehindBatch(...tri.getEscribedCircles())
        renderer.stroke(colors.yellow + "CC")
        setting.symmedianSegments && renderer.drawBehindBatch(...tri.getSymmedianSegments())
        setting.lemoinePoint && renderer.drawBehind(tri.getLemoinePoint())
        renderer.stroke(colors.brown + "CC")
        setting.eulerLine && renderer.drawBehind(tri.getEulerLine())
        setting.ninePointCenterPoint && renderer.drawBehind(tri.getNinePointCenterPoint())
        setting.ninePointCircle && renderer.drawBehind(tri.getNinePointCircle())
    }
}
