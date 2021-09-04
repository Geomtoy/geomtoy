import Geomtoy from "../../src/geomtoy"
import "./assets/dg"
import colors from "./assets/colors"
import interact from "./assets/interact"

const canvas = document.querySelector("#canvas")
const G = new Geomtoy({
    epsilon: 2 ** -32,
    coordinateSystem: {
        scale: 12,
        xAxisPositiveOnRight: true,
        yAxisPositiveOnBottom: false
    },
    graphics: {
        pointSize: 0.5
    }
})
const canvasRenderer = new Geomtoy.adapters.VanillaCanvas(canvas, G, { lineJoin: "round" })
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
    medianSegments: true,
    centroidPoint: true,
    medialTriangle: false,
    antimedialTriangle: false,
    bisectingSegments: true,
    incenterPoint: true,
    inscribedCircle: true,
    altitudeLines: true,
    orthocenterPoint: true,
    orthicTriangle: false,
    polarCircle: false,
    perpendicularlyBisectingLines: true,
    circumcenterPoint: true,
    circumscribedCircle: true,
    escenterPoints: true,
    escribedCircles: true,
    symmedianSegments: false,
    lemoinePoint: false,
    eulerLine: false,
    ninePointCenterPoint: false,
    ninePointCircle: false
}
const guiObject = gui.addFolder("objects")
guiObject.open()
Object.getOwnPropertyNames(touchables).forEach(name => {
    let folder = guiObject.addFolder(name)
    folder.open()
    let controllerX = folder.add(touchables[name].object, "x", 0, 0, 0.1).listen().onChange(draw)
    touchables[name].controller.x = controllerX
    let controllerY = folder.add(touchables[name].object, "y", 0, 0, 0.1).listen().onChange(draw)
    touchables[name].controller.y = controllerY
})
const guiSetting = gui.addFolder("setting")
guiSetting.open()
Object.getOwnPropertyNames(setting).forEach(name => {
    guiSetting.add(setting, name).listen().onChange(draw)
}) //

interact.responsive(canvas, (width, height) => {
    console.log(1)
    G.setOptions({
        coordinateSystem: {
            originX: width / 2,
            originY: height / 2
        }
    })
    let cWidth = width / G.getOptions().coordinateSystem.scale,
        cHeight = height / G.getOptions().coordinateSystem.scale
    Object.getOwnPropertyNames(touchables).forEach(name => {
        touchables[name].controller.x.min(-cWidth / 2)
        touchables[name].controller.x.max(cWidth / 2)
        touchables[name].controller.y.min(-cHeight / 2)
        touchables[name].controller.y.max(cHeight / 2)
    })
    draw()
})
interact.dragAndDrop(touchables, canvas, canvasRenderer, draw)

const tri = G.Triangle()

function draw() {
    canvasRenderer.clear()

    canvasRenderer.strokeWidth(0.25)
    canvasRenderer.stroke(colors.black + "CC")

    canvasRenderer.fill("#000000FF")
    touchables.point1.path = canvasRenderer.draw(touchables.point1.object)
    touchables.point2.path = canvasRenderer.draw(touchables.point2.object)
    touchables.point3.path = canvasRenderer.draw(touchables.point3.object)
    canvasRenderer.fill("#00000000")
    Object.assign(tri, {
        point1: touchables.point1.object,
        point2: touchables.point2.object,
        point3: touchables.point3.object
    })

    if (tri.isValid()) {
        canvasRenderer.drawBehind(tri)
        canvasRenderer.stroke(colors.grey + "CC")
        setting.sideLines && canvasRenderer.drawBehindBatch(...tri.getSideSegments().map(s => s.toLine()))
        canvasRenderer.stroke(colors.red + "CC")
        setting.medianSegments && canvasRenderer.drawBehindBatch(...tri.getMedianSegments())
        setting.centroidPoint && canvasRenderer.drawBehind(tri.getCentroidPoint())
        setting.medialTriangle && canvasRenderer.drawBehind(tri.getMedialTriangle())
        setting.antimedialTriangle && canvasRenderer.drawBehind(tri.getAntimedialTriangle())
        canvasRenderer.stroke(colors.green + "CC")
        setting.bisectingSegments && canvasRenderer.drawBehindBatch(...tri.getAngleBisectingSegments())
        setting.incenterPoint && canvasRenderer.drawBehind(tri.getIncenterPoint())
        setting.inscribedCircle && canvasRenderer.drawBehind(tri.getInscribedCircle())
        canvasRenderer.stroke(colors.purple + "CC")
        setting.altitudeLines && canvasRenderer.drawBehindBatch(...tri.getAltitudeSegments().map(s => s.toLine()))
        setting.orthocenterPoint && canvasRenderer.drawBehind(tri.getOrthocenterPoint())
        let ot, pc
        setting.orthicTriangle && (ot = tri.getOrthicTriangle()) !== null && canvasRenderer.drawBehind(ot)
        setting.polarCircle && (pc = tri.getPolarCircle()) !== null && canvasRenderer.drawBehind(pc)
        canvasRenderer.stroke(colors.indigo + "CC")
        setting.perpendicularlyBisectingLines && canvasRenderer.drawBehindBatch(...tri.getPerpendicularlyBisectingSegments().map(s => s.toLine()))
        setting.circumcenterPoint && canvasRenderer.drawBehind(tri.getCircumcenterPoint())
        setting.circumscribedCircle && canvasRenderer.drawBehind(tri.getCircumscribedCircle())
        canvasRenderer.stroke(colors.teal + "CC")
        setting.escenterPoints && canvasRenderer.drawBehindBatch(...tri.getEscenterPoints())
        setting.escribedCircles && canvasRenderer.drawBehindBatch(...tri.getEscribedCircles())
        canvasRenderer.stroke(colors.yellow + "CC")
        setting.symmedianSegments && canvasRenderer.drawBehindBatch(...tri.getSymmedianSegments())
        setting.lemoinePoint && canvasRenderer.drawBehind(tri.getLemoinePoint())
        canvasRenderer.stroke(colors.brown + "CC")
        setting.eulerLine && canvasRenderer.drawBehind(tri.getEulerLine())
        setting.ninePointCenterPoint && canvasRenderer.drawBehind(tri.getNinePointCenterPoint())
        setting.ninePointCircle && canvasRenderer.drawBehind(tri.getNinePointCircle())
    }
}
